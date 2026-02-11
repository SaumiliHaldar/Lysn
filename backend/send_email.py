import os, requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GOOGLE_SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL")

# Send email via Google Script POST request
def _send_email_via_script(to_email: str, subject: str, content: str, is_html: bool = False):
    """
    Internal helper to send email via Google Script POST request
    """
    if not GOOGLE_SCRIPT_URL:
        print("Error: GOOGLE_SCRIPT_URL not set in environment")
        raise Exception("GOOGLE_SCRIPT_URL not configured")

    payload = {
        "to": to_email,
        "subject": subject,
        "body": "" if is_html else content,
        "htmlBody": content if is_html else ""
    }

    try:
        response = requests.post(GOOGLE_SCRIPT_URL, json=payload, timeout=15)
        response.raise_for_status()
        return response
    except Exception as e:
        status_code = getattr(e.response, 'status_code', 'N/A') if hasattr(e, 'response') else 'N/A'
        print(f"Error in _send_email_via_script: {e} (Status: {status_code})")
        raise


# Send OTP email for verification
def send_otp_email(to_email: str, otp: str, name: str = None):
    """
    Send OTP email for verification
    """
    display_name = name or "there"
    subject = "🎧 Welcome to Lysn - Verify Your Email"
    content = (
        f"Hey {display_name}! 👋\n\n"
        f"Your Lysn OTP is {otp}. It expires in 5 minutes.\n\n"
        f"Happy Lysning! 🎧"
    )

    try:
        _send_email_via_script(to_email, subject, content)
        print(f"OTP sent to {to_email}")
    except Exception as e:
        print(f"Error sending OTP: {e}")
        raise


# Send welcome email after successful registration
def send_welcome_email(to_email: str, name: str):
    """
    Send a friendly welcome email after successful registration
    """
    current_year = datetime.now().year
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
                © {current_year} Lysn • Where your words find their sound.
            </p>
        </body>
    </html>
    """

    try:
        _send_email_via_script(to_email, subject, html_content, is_html=True)
        print(f"Welcome email sent to {to_email}")
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        raise


# Send temporary password email after OTP verification
def send_password_email(to_email: str, name: str, temp_password: str):
    """
    Send a temporary password email after OTP verification.
    """
    current_year = datetime.now().year
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
                Warmly,<br>
                <strong>The Lysn Team</strong><br>
                <small>Happy Lysning! 🎧</small>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
            <p style="font-size: 12px; color: #999;">
                © {current_year} Lysn • Where your words find their sound.
            </p>
        </body>
    </html>
    """

    try:
        _send_email_via_script(to_email, subject, html_content, is_html=True)
        print(f"Temporary password sent to {to_email}")
    except Exception as e:
        print(f"Error sending temporary password: {e}")
        raise


# Send confirmation email after password change
def send_password_update_email(to_email: str, name: str = None):
    """
    Send confirmation email after password change
    """
    display_name = name or "there"
    current_year = datetime.now().year
    subject = "🔒 Your Lysn Password Was Updated"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <p style="color: #406587;">Hey <strong>{name or 'there'} 👋,</strong></p>
            <p>Your Lysn password was changed successfully.</p>
            <p>If this wasn’t you, please reset your password immediately to keep your account secure.</p>
            <p style="margin-top: 25px;">
                Warmly,<br>
                <strong>The Lysn Team</strong><br>
                <small>Stay safe & keep Lysning 🎧</small>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
            <p style="font-size: 12px; color: #999;">
                © {current_year} Lysn • Where your words find their sound.
            </p>
        </body>
    </html>
    """

    try:
        _send_email_via_script(to_email, subject, html_content, is_html=True)
        print(f"Password update confirmation sent to {to_email}")
    except Exception as e:
        print(f"Error sending password update email: {e}")
        raise

