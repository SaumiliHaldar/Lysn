import os, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))


def send_otp_email(to_email: str, otp: str, name: str = None):
    """
    Send OTP email for verification
    """
    display_name = name or "there"
    msg = MIMEText(
        f"Hey {display_name}! 👋\n\n"
        f"Your Lysn OTP is {otp}. It expires in 5 minutes.\n\n"
        f"Happy Lysning! 🎧"
    )
    msg["Subject"] = "🎧 Welcome to Lysn - Verify Your Email"
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


def send_welcome_email(to_email: str, name: str):
    """
    Send a friendly welcome email after successful registration
    """
    subject = "🎉 Welcome to Lysn! 🎧"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <p style="color: #406587;">Hey <strong>{name or 'there'} 👋,</strong></p>
            <p>
                We're so glad to have you join <strong>Lysn</strong> 🎧 — your cozy corner to turn words into sound.
            </p>
            <p>
                From PDFs to peaceful audio, Lysn lets your content flow — anywhere, anytime.
            </p>
            <p>
                Ready to start creating something beautiful? 🌈
            </p>
            <p style="margin-top: 25px;">
                Warmly,<br>
                <strong>The Lysn Team</strong><br>
                <small>Happy Lysning! 🎧</small>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
            <p style="font-size: 12px; color: #999;">
                © 2025 Lysn • Where your words find their sound.
            </p>
        </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Welcome email sent to {to_email}")
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        raise


def send_password_email(to_email: str, name: str, temp_password: str):
    """
    Send a temporary password email after OTP verification.
    """
    subject = "Your Lysn Login Password 🔐"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <p style="color: #406587;">Hey <strong>{name or 'there'} 👋,</strong></p>
            <p>Welcome to <strong>Lysn</strong> 🎧 — we're thrilled to have you!</p>
            <p>Here’s your <strong>temporary password</strong> to log in:</p>
            <p style="font-size: 18px; font-weight: bold; color: #406587; margin: 10px 0;">
                {temp_password}
            </p>
            <p>Please use this password to sign in, and then change it to something personal and secure.</p>
            <p>Happy Lysning! 🎧</p>
            <br>
            <p style="margin-top: 25px;">
                — <strong>The Lysn Team</strong>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
            <p style="font-size: 12px; color: #999;">
                © 2025 Lysn • Where your words find their sound.
            </p>
        </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Temporary password sent to {to_email}")
    except Exception as e:
        print(f"Error sending temporary password: {e}")
        raise


def send_password_update_email(to_email: str, name: str = None):
    """
    Send confirmation email after password change
    """
    display_name = name or "there"
    subject = "🔒 Your Lysn Password Was Updated"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <p>Hey <strong>{display_name} 👋,</strong></p>
            <p>Your Lysn password was changed successfully.</p>
            <p>If this wasn’t you, please reset your password immediately to keep your account secure.</p>
            <p style="margin-top: 25px;">
                Warmly,<br>
                <strong>The Lysn Team</strong><br>
                <small>Stay safe & keep Lysning 🎧</small>
            </p>
        </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Password update confirmation sent to {to_email}")
    except Exception as e:
        print(f"Error sending password update email: {e}")
        raise
