"""SmartCanteen — Flask application factory."""

from flask import Flask

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

    return app


# ── Run directly ────────────────────────────────────────────────────
if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
