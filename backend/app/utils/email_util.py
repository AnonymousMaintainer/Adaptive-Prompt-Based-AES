import smtplib
import logging

from email.message import EmailMessage

from ..core.config import settings

logger = logging.getLogger(__name__)

def send_email_notification(to_email: str, subject: str, body: str):
    """
    Send an email using SMTP.
    
    Args:
        to_email (str): Recipient's email address.
        subject (str): Email subject.
        body (str): Plain text body.
    """
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_USER
        msg["To"] = to_email
        msg.set_content(body)

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
