"""Food catalogue blueprint — CRUD for food items."""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from models.schemas import FoodCreateSchema, FoodUpdateSchema
from services.food_service import get_all_foods, create_food, update_food, delete_food
from utils.decorators import admin_required
from utils.responses import success_response, error_response

food_bp = Blueprint("foods", __name__, url_prefix="/api/foods")


@food_bp.route("", methods=["GET"])
def list_foods():
    """Public — list available food items. Admin sees all."""
    category = request.args.get("category")
    show_all = request.args.get("all") == "true"
    try:
        foods = get_all_foods(category=category, available_only=not show_all)
        return success_response(foods)
    except Exception as e:
        return error_response(str(e), 500)


@food_bp.route("", methods=["POST"])
@admin_required
def add_food():
    """Admin — create a new food item."""
    schema = FoodCreateSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    try:
        food = create_food(data)
        return success_response(food, "Food item created", 201)
    except Exception as e:
        return error_response(str(e), 500)


@food_bp.route("/<food_id>", methods=["PUT"])
@admin_required
def edit_food(food_id):
    """Admin — update a food item."""
    schema = FoodUpdateSchema()
    try:
        data = schema.load(request.get_json(force=True))
    except ValidationError as err:
        return error_response("Validation failed", 422, err.messages)

    if not data:
        return error_response("No fields to update", 400)

    try:
        food = update_food(food_id, data)
        return success_response(food, "Food item updated")
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)


@food_bp.route("/<food_id>", methods=["DELETE"])
@admin_required
def remove_food(food_id):
    """Admin — delete a food item."""
    try:
        delete_food(food_id)
        return success_response(message="Food item deleted")
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(str(e), 500)
