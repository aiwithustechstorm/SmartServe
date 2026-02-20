"""Order blueprint — create orders, list orders, update status."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from models.schemas import OrderCreateSchema, OrderStatusUpdateSchema
from services.order_service import (
    place_order,
    get_user_orders,
    get_all_orders,
    update_order_status,
)
from utils.decorators import admin_required
from utils.responses import success_response, error_response

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@order_bp.route("", methods=["POST"])
@jwt_required()
def create_order():
    """Authenticated user — place a new order."""
    schema = OrderCreateSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    user_id = get_jwt_identity()

    try:
        order = place_order(user_id, data["items"])
        return success_response(order, "Order placed successfully", 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)


@order_bp.route("/user", methods=["GET"])
@jwt_required()
def user_orders():
    """Authenticated user — list own orders."""
    user_id = get_jwt_identity()
    try:
        orders = get_user_orders(user_id)
        return success_response(orders)
    except Exception as e:
        return error_response(str(e), 500)


@order_bp.route("/admin", methods=["GET"])
@admin_required
def admin_orders():
    """Admin — list all orders, optionally filtered by status."""
    status = request.args.get("status")
    try:
        orders = get_all_orders(status=status)
        return success_response(orders)
    except Exception as e:
        return error_response(str(e), 500)


@order_bp.route("/<order_id>", methods=["PATCH"])
@admin_required
def change_order_status(order_id):
    """Admin — update order status with transition validation."""
    schema = OrderStatusUpdateSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    try:
        order = update_order_status(order_id, data["status"])
        return success_response(order, "Order status updated")
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(str(e), 500)
