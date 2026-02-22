import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")

    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_EXPIRY_HOURS", "24"))
    )

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # Keep-alive self-ping (Render free tier sleeps after 15 min)
    RENDER_EXTERNAL_URL = os.getenv("RENDER_EXTERNAL_URL", "")  # e.g. https://smartserve-api.onrender.com
    KEEP_ALIVE_INTERVAL = int(os.getenv("KEEP_ALIVE_INTERVAL", "840"))  # seconds (default 14 min)
