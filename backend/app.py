from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Response, Cookie
from fastapi.responses import StreamingResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from dotenv import load_dotenv
from gtts import gTTS
from io import BytesIO
import gridfs, os, secrets, random, PyPDF2, requests
from datetime import datetime
from passlib.hash import bcrypt
import string

from send_email import send_otp_email, send_welcome_email, send_password_email, send_password_update_email

# ------------------ LOAD ENV ------------------
load_dotenv()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["lysn"]
users = db["users"]
audio_metadata = db["audio_metadata"]
fs = gridfs.GridFS(db)

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# FastAPI setup
app = FastAPI(title="Lysn 🎧")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ PASSWORD UTILS ------------------
def hash_password(password: str):
    # bcrypt supports max 72 bytes — truncate if needed
    encoded = password.encode("utf-8")
    if len(encoded) > 72:
        encoded = encoded[:72]
    return bcrypt.hash(encoded.decode("utf-8", errors="ignore"))

def verify_password(plain_password: str, hashed_password: str):
    try:
        return bcrypt.verify(plain_password, hashed_password)
    except Exception:
        return False

def generate_temp_password(length=12):
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(secrets.choice(chars) for _ in range(length))

# ------------------ IN-MEMORY SESSIONS ------------------
SESSIONS = {}  # { token: { "email": str, "last_active": datetime } }
SESSION_TIMEOUT = timedelta(days=7)

def create_session(email: str):
    token = secrets.token_urlsafe(32)
    SESSIONS[token] = {"email": email, "last_active": datetime.utcnow()}
    return token

def get_current_user(session_token: str = Cookie(None)):
    if not session_token or session_token not in SESSIONS:
        raise HTTPException(status_code=401, detail="Not logged in or invalid session")

    session = SESSIONS[session_token]
    if datetime.utcnow() - session["last_active"] > SESSION_TIMEOUT:
        del SESSIONS[session_token]
        raise HTTPException(status_code=401, detail="Session expired")

    # Extend session activity
    session["last_active"] = datetime.utcnow()
    return session["email"]

def logout_user(session_token: str):
    SESSIONS.pop(session_token, None)

# ------------------ HELPERS ------------------
def generate_otp():
    return str(random.randint(100000, 999999))

# ------------------ ROUTES ------------------
@app.get("/")
def root():
    return {"message": "Welcome to Lysn 🎧"}

@app.get("/healthz")
async def health_check():
    return {"message": "Lysn is active!", "status": "OK"}

# ---------- AUTHENTICATION : MANUAL ----------
@app.post("/auth/otp/request")
def request_otp(email: str = Form(...), name: str = Form(None)):
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    users.update_one(
        {"email": email},
        {
            "$setOnInsert": {
                "name": name,
                "created_at": datetime.utcnow(),
                "auth_type": "manual",
            },
            "$set": {
                "otp": otp,
                "otp_expires": expires_at,
                "updated_at": datetime.utcnow(),
            },
        },
        upsert=True,
    )

    send_otp_email(email, otp, name)
    return {"message": f"OTP sent to {email}"}


@app.post("/auth/otp/verify")
def verify_otp(response: Response, email: str = Form(...), otp: str = Form(...), name: str = Form(None)):
    user = users.find_one({"email": email})
    if not user or user.get("otp") != otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    if datetime.utcnow() > user.get("otp_expires", datetime.utcnow()):
        raise HTTPException(status_code=401, detail="OTP expired")

    # Check if this is a new registration
    existing_user = users.find_one({"email": email})
    is_new_user = not existing_user or ("otp" in existing_user and not existing_user.get("verified"))


    token = create_session(email)
    update_fields = {
        "name": name if name else user.get("name", ""),
        "auth_type": "manual",
        "created_at": user.get("created_at", datetime.utcnow()),
        "profile_pic": user.get("profile_pic", f"https://api.dicebear.com/9.x/identicon/svg?seed={email}"),
        "updated_at": datetime.utcnow(),
        "verified": True,
    }

    # 🎯 If new user, generate a strong temporary password
    if is_new_user:
        temp_password = generate_temp_password()
        update_fields["password"] = hash_password(temp_password)
        display_name = (name or user.get("name") or email.split('@')[0]).title()

        send_welcome_email(email, display_name)
        send_password_email(email, display_name, temp_password)


    users.update_one(
        {"email": email},
        {"$set": update_fields, "$unset": {"otp": "", "otp_expires": ""}},
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )

    return {"message": "OTP verified", "email": email, "name": name or user.get("name", "")}


@app.post("/auth/login")
def login(response: Response, email: str = Form(...), password: str = Form(...)):
    user = users.find_one({"email": email})
    if not user or not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_session(email)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )
    return {"message": "Login successful", "email": email, "name": user.get("name", "")}

@app.post("/auth/set-password")
def set_password(
    email: str = Depends(get_current_user),
    old_password: str = Form(...),
    new_password: str = Form(...)
):
    user = users.find_one({"email": email})
    if not user or not verify_password(old_password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Old password incorrect")

    users.update_one(
        {"email": email},
        {"$set": {"password": hash_password(new_password), "updated_at": datetime.utcnow()}}
    )

    # send confirmation email
    try:
        send_password_update_email(email, user.get("name"))
    except Exception as e:
        print(f"Failed to send password update email: {e}")

    return {"message": "Password updated successfully"}

@app.post("/auth/password/reset")
def reset_password(email: str = Form(...)):
    user = users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    users.update_one(
        {"email": email},
        {"$set": {"otp": otp, "otp_expires": expires_at, "updated_at": datetime.utcnow()}},
    )

    # send OTP mail for password reset
    send_otp_email(email, otp, user.get("name", email.split("@")[0].title()))

    return {"message": f"OTP sent to {email} for password reset"}

@app.post("/auth/password/reset/verify")
def verify_reset_password(email: str = Form(...), otp: str = Form(...)):
    user = users.find_one({"email": email})
    if not user or user.get("otp") != otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    expires_at = user.get("otp_expires")
    if not expires_at or datetime.utcnow() > expires_at:
        raise HTTPException(status_code=401, detail="OTP expired")

    return {"message": "OTP verified"}

# ---------- AUTHENTICATION : GOOGLE ----------
@app.get("/auth/google/login")
def google_login():
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&scope=openid email profile"
    )
    return RedirectResponse(auth_url)

@app.get("/auth/google/callback")
def google_callback(response: Response, code: str):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    r = requests.post(token_url, data=data).json()
    access_token = r.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Google login failed")

    userinfo = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        params={"access_token": access_token},
    ).json()

    email = userinfo.get("email")
    name = userinfo.get("name")
    profile_pic = userinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Cannot get email")
    
    # Check if user already exists
    existing_user = users.find_one({"email": email})

    token = create_session(email)
    users.update_one(
        {"email": email},
        {
            "$set": {
                "name": name,
                "email": email,
                "auth_type": "google",
                "profile_pic": profile_pic,
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {"created_at": datetime.utcnow()},
        },
        upsert=True,
    )

    # Send welcome email only for new Google signups
    if not existing_user:
        try:
            send_welcome_email(email, name)
        except Exception as e:
            print(f"Failed to send welcome email to {email}: {e}")

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )

    return {"message": "Google login successful", "email": email, "name": name, "profile_pic": profile_pic}

@app.get("/auth/me")
def get_user_info(email: str = Depends(get_current_user)):
    user = users.find_one({"email": email}, {"_id": 0})
    return {"user": user}

@app.post("/auth/logout")
def logout(response: Response, session_token: str = Cookie(None)):
    logout_user(session_token)
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}

# ---------- PDF → AUDIO ----------
@app.post("/pdf/upload")
def upload_pdf(file: UploadFile = File(...), email: str = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF allowed")

    pdf_reader = PyPDF2.PdfReader(file.file)
    text = "".join([page.extract_text() or "" for page in pdf_reader.pages])

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF has no readable text")

    tts = gTTS(text=text, lang="en")
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)

    audio_id = fs.put(audio_buffer, filename=f"{secrets.token_hex(8)}.mp3", user=email)
    audio_metadata.insert_one({"user": email, "audio_id": audio_id, "uploaded": datetime.utcnow()})

    return {"message": "Audio generated", "audio_id": str(audio_id)}

@app.get("/audio/{audio_id}")
def get_audio(audio_id: str):
    try:
        file = fs.get(ObjectId(audio_id))
        return StreamingResponse(file, media_type="audio/mpeg")
    except Exception:
        raise HTTPException(status_code=404, detail="Audio not found")

@app.get("/audios_list")
def list_audios(email: str = Depends(get_current_user)):
    records = audio_metadata.find({"user": email})
    audios = [
        {
            "audio_id": str(r["audio_id"]),
            "uploaded": (
                r["uploaded"].strftime("%Y-%m-%d %H:%M:%S")
                if isinstance(r["uploaded"], datetime)
                else str(r["uploaded"])
            ),
        }
        for r in records
    ]
    return {"audios": audios}
