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

from send_email import send_otp_email, send_welcome_email

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

    # check if new registration
    existing_user = users.find_one({"email": email})
    is_new_user = not existing_user or ("otp" in existing_user and not existing_user.get("verified"))


    token = create_session(email)
    users.update_one(
        {"email": email},
        {
            "$set": {
                "name": name if name else user.get("name", ""),
                "auth_type": "manual",
                "created_at": user.get("created_at", datetime.utcnow()),
                "profile_pic": user.get("profile_pic", f"https://api.dicebear.com/9.x/identicon/svg?seed={email}"),
                "updated_at": datetime.utcnow(),
            },
            "$unset": {"otp": "", "otp_expires": ""},
        },
        upsert=True,
    )

    # 🎉 Send welcome email only for new users
    if is_new_user:
        send_welcome_email(email, (name or user.get("name") or email.split('@')[0]).title())

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )

    return {"message": "OTP verified", "email": email, "name": name or user.get("name", "")}

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

@app.get("/audio/list")
def list_audios(email: str = Depends(get_current_user)):
    records = audio_metadata.find({"user": email})
    return {"audios": [{ "audio_id": str(r["audio_id"]), "uploaded": r["uploaded"] } for r in records]}
