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

    # ── Debug: check Brevo config (REMOVE after testing) ────────────
    @app.route("/api/debug-email-config")
    def debug_email_config():
        brevo_key = app.config.get("BREVO_API_KEY", "")
        brevo_sender = app.config.get("BREVO_SENDER_EMAIL", "")
        resend_key = app.config.get("RESEND_API_KEY", "")
        return {
            "brevo_key_set": bool(brevo_key),
            "brevo_key_prefix": brevo_key[:12] + "..." if brevo_key else "",
            "brevo_sender": brevo_sender,
            "resend_key_set": bool(resend_key),
            "resend_key_prefix": resend_key[:8] + "..." if resend_key else "",
        }

    # ── Debug: test send email (REMOVE after testing) ───────────────
    @app.route("/api/debug-send-test", methods=["POST"])
    def debug_send_test():
        from flask import request as req
        import json, urllib.request, urllib.error
        data = req.get_json(force=True)
        to_email = data.get("email", "")
        brevo_key = app.config.get("BREVO_API_KEY", "")
        brevo_sender = app.config.get("BREVO_SENDER_EMAIL", "")
        if not brevo_key or not brevo_sender:
            return {"error": "Brevo not configured", "brevo_key_set": bool(brevo_key), "brevo_sender": brevo_sender}, 500
        payload = json.dumps({
            "sender": {"name": "SmartServe", "email": brevo_sender},
            "to": [{"email": to_email}],
            "subject": "SmartServe Test Email",
            "htmlContent": "<h2>Test from SmartServe</h2><p>If you see this, Brevo is working!</p>",
            "textContent": "Test from SmartServe - Brevo is working!",
        }).encode("utf-8")
        rq = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={"api-key": brevo_key, "Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(rq, timeout=15) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return {"success": True, "status": resp.status, "response": body}
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            return {"success": False, "status": exc.code, "response": body}, 502
        except Exception as exc:
            return {"success": False, "error": str(exc)}, 502

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
