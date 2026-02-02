import os
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


@router.post("/send-email")
async def send_email(req: ContactRequest):
    body = (
        f"Name: {req.name}\n"
        f"Email: {req.email}\n"
        f"Subject: {req.subject}\n\n"
        f"{req.message}"
    )

    msg = EmailMessage()
    msg["From"] = SMTP_EMAIL
    msg["To"] = "bali.accmate@gmail.com"
    msg["Subject"] = f"Contact Form: {req.subject}"
    msg["Reply-To"] = req.email
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
            smtp.send_message(msg)
        return {"status": "ok", "message": "Email sent successfully."}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}
