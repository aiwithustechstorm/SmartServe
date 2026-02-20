from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from utils.responses import error_response


def role_required(required_role: str):
    """Decorator that restricts access to users with *required_role*."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != required_role:
                return error_response("Admin access required", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def admin_required(fn):
    """Shortcut decorator for admin-only routes."""
    return role_required("admin")(fn)
