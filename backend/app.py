from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os, secrets, random
import PyPDF2
from gtts import gTTS
import requests

from send_email import send_otp_email

# ------------------ LOAD ENV ------------------
load_dotenv()

# MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["lysn"]
users = db["users"]
sessions = db["sessions"]
audio_metadata = db["audio_metadata"]  # metadata only

# Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# App
app = FastAPI(title="Lysn Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ HELPERS ------------------
def generate_otp():
    return str(random.randint(100000, 999999))

def create_session(email: str):
    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(minutes=30)
    sessions.update_one({"email": email}, {"$set": {"token": token, "expiry": expiry}}, upsert=True)
    return token

def get_current_user(token: str = Form(...)):
    session = sessions.find_one({"token": token})
    if not session or session.get("expiry", datetime.utcnow()) < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return session["email"]

# ------------------ ROUTES ------------------

@app.get("/")
def root():
    return {"message": "Welcome to Lysn 🎧"}

# ---------- AUTHENTICATION ----------
@app.post("/auth/otp/request")
def request_otp(email: str = Form(...)):
    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=5)
    users.update_one({"email": email}, {"$set": {"otp": otp, "otp_expiry": expiry}}, upsert=True)
    send_otp_email(email, otp)
    return {"message": "OTP sent to email"}

@app.post("/auth/otp/verify")
def verify_otp(email: str = Form(...), otp: str = Form(...), name: str = Form(None)):
    user = users.find_one({"email": email})
    if not user or user.get("otp") != otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    if datetime.utcnow() > user.get("otp_expiry", datetime.utcnow()):
        raise HTTPException(status_code=401, detail="OTP expired")
    
    token = create_session(email)
    
    # Upsert user info
    users.update_one(
        {"email": email},
        {
            "$set": {
                "name": name if name else user.get("name", ""),
                "auth_type": "manual",
                "profile_pic": user.get("profile_pic", ""),
                "updated_at": datetime.utcnow()
            },
            "$unset": {"otp": "", "otp_expiry": ""}
        },
        upsert=True
    )
    return {"session_token": token}

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
def google_callback(code: str):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    r = requests.post(token_url, data=data).json()
    access_token = r.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Google login failed")
    
    userinfo = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        params={"access_token": access_token}
    ).json()
    
    email = userinfo.get("email")
    name = userinfo.get("name")
    profile_pic = userinfo.get("picture")
    
    if not email:
        raise HTTPException(status_code=400, detail="Cannot get email")
    
    token = create_session(email)
    
    # Upsert user info
    users.update_one(
        {"email": email},
        {
            "$set": {
                "name": name,
                "email": email,
                "auth_type": "google",
                "profile_pic": profile_pic,
                "updated_at": datetime.utcnow()
            },
            "$setOnInsert": {"created_at": datetime.utcnow()}
        },
        upsert=True
    )
    return {"session_token": token, "email": email, "name": name, "profile_pic": profile_pic}

@app.get("/auth/me")
def get_current_user_info(current_user: str = Depends(get_current_user)):
    return {"email": current_user}

@app.post("/auth/logout")
def logout(current_user: str = Depends(get_current_user)):
    sessions.delete_one({"email": current_user})
    return {"message": "Logged out successfully"}

# ---------- PDF → AUDIO ----------
@app.post("/pdf/upload")
def upload_pdf(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF allowed")
    
    # Extract text
    pdf_reader = PyPDF2.PdfReader(file.file)
    text = ""
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + " "
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF has no readable text")
    
    # Generate audio file locally
    os.makedirs("audio", exist_ok=True)
    audio_filename = f"audio/{secrets.token_hex(8)}.mp3"
    tts = gTTS(text=text, lang="en")
    tts.save(audio_filename)
    
    # Store only metadata
    audio_metadata.insert_one({
        "user": current_user,
        "file": audio_filename,
        "uploaded": datetime.utcnow()
    })
    
    return {"audio_file": audio_filename}

@app.get("/audio/{filename}")
def serve_audio(filename: str):
    path = f"audio/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="audio/mpeg")

@app.get("/audio/list")
def list_user_audios(current_user: str = Depends(get_current_user)):
    user_files = audio_metadata.find({"user": current_user})
    return {"audios": [f["file"] for f in user_files]}
