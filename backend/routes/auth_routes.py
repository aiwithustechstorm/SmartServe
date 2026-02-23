"""Authentication blueprint — register, login (send OTP), verify OTP."""

from flask import Blueprint, request
from marshmallow import ValidationError

from models.schemas import RegisterSchema, LoginSchema, VerifyOtpSchema
from services.auth_service import register_user, send_otp, verify_otp
from utils.responses import success_response, error_response

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    schema = RegisterSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    try:
        user = register_user(data)
        return success_response(user, "User registered successfully", 201)
    except ValueError as e:
        return error_response(str(e), 409)
    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Send an OTP to the user's email (simulated)."""
    schema = LoginSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    try:
        send_otp(data["email"])
        return success_response(
            {"email": data["email"]}, "OTP sent to your email"
        )
    except ValueError as e:
        return error_response(str(e), 404)
    except RuntimeError as e:
        return error_response(str(e), 503)
    except Exception as e:
        return error_response(str(e), 500)


@auth_bp.route("/verify-otp", methods=["POST"])
def verify():
    """Verify OTP and issue a JWT."""
    schema = VerifyOtpSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    try:
        token = verify_otp(data["email"], data["otp"])
        return success_response({"access_token": token}, "Login successful")
    except ValueError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response(str(e), 500)
