from flask_jwt_extended import JWTManager
from supabase import create_client, Client
from flask_cors import CORS

jwt = JWTManager()
cors = CORS()
supabase: Client = None  # initialised in create_app


def init_supabase(url: str, key: str) -> Client:
    """Create and cache the Supabase client."""
    global supabase
    supabase = create_client(url, key)
    return supabase


def get_supabase() -> Client:
    """Return the initialised Supabase client (call-time lookup)."""
    return supabase
