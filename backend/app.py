"""SmartCanteen — Flask application factory."""

from flask import Flask, send_from_directory
import os

from config import Config
from extensions import jwt, cors, init_supabase
from routes.auth_routes import auth_bp
from routes.food_routes import food_bp
from routes.order_routes import order_bp
from utils.responses import error_response


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── Extensions ──────────────────────────────────────────────────
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": config_class.CORS_ORIGINS}})
    init_supabase(config_class.SUPABASE_URL, config_class.SUPABASE_KEY)

    # ── Blueprints ──────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(food_bp)
    app.register_blueprint(order_bp)

    # ── Global error handlers ───────────────────────────────────────
    @app.errorhandler(404)
    def not_found(_e):
        return error_response("Resource not found", 404)

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return error_response("Method not allowed", 405)

    @app.errorhandler(500)
    def internal_error(_e):
        return error_response("Internal server error", 500)

    # JWT error callbacks
    @jwt.expired_token_loader
    def expired_token_callback(_jwt_header, _jwt_payload):
        return error_response("Token has expired", 401)

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return error_response(f"Invalid token: {reason}", 401)

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return error_response(f"Authorization required: {reason}", 401)

    # ── Health check ────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    # ── Debug: check email config (remove after testing) ────────────
    @app.route("/api/debug/email-config")
    def debug_email_config():
        resend_key = app.config.get("RESEND_API_KEY", "")
        smtp_user = app.config.get("SMTP_USER", "")
        return {
            "resend_key_set": bool(resend_key),
            "resend_key_prefix": resend_key[:8] + "..." if len(resend_key) > 8 else "(empty)",
            "resend_from": app.config.get("RESEND_FROM", "") or "(will default to onboarding@resend.dev)",
            "smtp_user_set": bool(smtp_user),
            "smtp_host": app.config.get("SMTP_HOST", "(not set)"),
            "smtp_port": app.config.get("SMTP_PORT", "(not set)"),
            "dev_otp": app.config.get("DEV_OTP", False),
            "render_url": app.config.get("RENDER_EXTERNAL_URL", "(not set)"),
        }

    @app.route("/api/debug/test-email")
    def debug_test_email():
        """Temporary: diagnose email sending errors. Remove after debugging."""
        import json as _json
        import urllib.request
        import urllib.error
        import smtplib

        results = {"resend": None, "smtp_465": None, "smtp_587": None}

        # Test Resend
        resend_key = app.config.get("RESEND_API_KEY", "")
        if resend_key:
            from_name = app.config.get("SMTP_FROM_NAME", "SmartServe")
            resend_from = app.config.get("RESEND_FROM", "") or f"{from_name} <onboarding@resend.dev>"
            payload = _json.dumps({
                "from": resend_from,
                "to": ["aiwithustechstorm2026@gmail.com"],
                "subject": "SmartServe Test Email",
                "text": "This is a test. If you see this, Resend works!",
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=payload,
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json", "User-Agent": "SmartServe/1.0", "Accept": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    results["resend"] = {"status": resp.status, "body": resp.read().decode("utf-8", errors="replace")}
            except urllib.error.HTTPError as exc:
                results["resend"] = {"error": exc.code, "body": exc.read().decode("utf-8", errors="replace")}
            except Exception as exc:
                results["resend"] = {"error": str(exc)}

        # Test SMTP 465
        smtp_user = app.config.get("SMTP_USER", "")
        smtp_pass = app.config.get("SMTP_PASSWORD", "")
        smtp_host = app.config.get("SMTP_HOST", "smtp.gmail.com")
        if smtp_user and smtp_pass:
            try:
                with smtplib.SMTP_SSL(smtp_host, 465, timeout=10) as s:
                    s.login(smtp_user, smtp_pass)
                    results["smtp_465"] = "connected and authenticated"
            except Exception as exc:
                results["smtp_465"] = {"error": str(exc)}

            try:
                with smtplib.SMTP(smtp_host, 587, timeout=10) as s:
                    s.ehlo()
                    s.starttls()
                    s.ehlo()
                    s.login(smtp_user, smtp_pass)
                    results["smtp_587"] = "connected and authenticated"
            except Exception as exc:
                results["smtp_587"] = {"error": str(exc)}

        return results

    # ── Serve logo publicly (for email branding) ────────────────────
    @app.route("/api/logo.png")
    def serve_logo():
        logo_dir = os.path.join(app.root_path, "..", "frontend", "public")
        return send_from_directory(logo_dir, "logo.png", mimetype="image/png")

    return app


# ── WSGI entry point (used by gunicorn: gunicorn app:application) ────
application = create_app()

# ── Keep-alive self-ping (prevents Render free-tier sleep) ──────────
from utils.keep_alive import start_keep_alive
start_keep_alive(application)

# ── Run directly ────────────────────────────────────────────────────
if __name__ == "__main__":
    application.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
