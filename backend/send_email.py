import os, smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

def send_otp_email(to_email: str, otp: str):
    """
    Send OTP to the given email
    """
    msg = MIMEText(f"Your Lysn OTP is {otp}. It expires in 5 minutes.")
    msg["Subject"] = "Welcome to Lysn!🎧"
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"OTP sent to {to_email}")
    except Exception as e:
        print(f"Error sending OTP: {e}")
        raise
