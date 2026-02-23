"""Authentication service — OTP generation, verification, JWT issuing."""

import random
import string
from datetime import datetime, timedelta

from flask_jwt_extended import create_access_token

from extensions import get_supabase
from utils.email import send_otp_email

# In-memory OTP store: { email: { otp, expires_at } }
_otp_store: dict = {}

OTP_EXPIRY_MINUTES = 5


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


# ── Register ────────────────────────────────────────────────────────
def register_user(data: dict) -> dict:
    """Insert a new user into the users table and return the row."""
    # Check duplicate email
    existing = (
        get_supabase().table("users")
        .select("id")
        .eq("email", data["email"])
        .execute()
    )
    if existing.data:
        raise ValueError("Email already registered")

    result = get_supabase().table("users").insert(data).execute()
    return result.data[0]


# ── Send OTP (login) ────────────────────────────────────────────────
def send_otp(email: str) -> str:
    """Generate an OTP for the given email and store it in memory."""
    # Verify user exists
    user = (
        get_supabase().table("users")
        .select("id, email")
        .eq("email", email)
        .execute()
    )
    if not user.data:
        raise ValueError("User not found")

    otp = _generate_otp()
    _otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    }
    # Send OTP via email
    send_otp_email(email, otp)
    return True


# ── Verify OTP ──────────────────────────────────────────────────────
def verify_otp(email: str, otp: str) -> str:
    """Verify the OTP and return a JWT access token on success."""
    record = _otp_store.get(email)
    if not record:
        raise ValueError("OTP not requested or expired")

    if datetime.utcnow() > record["expires_at"]:
        _otp_store.pop(email, None)
        raise ValueError("OTP expired")

    if record["otp"] != otp:
        raise ValueError("Invalid OTP")

    # OTP valid — remove it
    _otp_store.pop(email, None)

    # Fetch user for JWT claims
    user = (
        get_supabase().table("users")
        .select("id, name, email, role")
        .eq("email", email)
        .execute()
    )
    if not user.data:
        raise ValueError("User not found")

    user_data = user.data[0]
    token = create_access_token(
        identity=user_data["id"],
        additional_claims={
            "role": user_data["role"],
            "email": user_data["email"],
            "name": user_data["name"],
        },
    )
    return token
