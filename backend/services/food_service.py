"""Food catalogue service."""

from extensions import get_supabase


def get_all_foods(category: str | None = None, available_only: bool = True) -> list:
    """Return food items, optionally filtered by category and availability."""
    query = get_supabase().table("foods").select("*")
    if available_only:
        query = query.eq("is_available", True)
    if category:
        query = query.eq("category", category)
    result = query.order("name").execute()
    return result.data


def create_food(data: dict) -> dict:
    """Insert a new food item (admin only)."""
    result = get_supabase().table("foods").insert(data).execute()
    return result.data[0]


def update_food(food_id: str, data: dict) -> dict:
    """Update an existing food item (admin only)."""
    # Verify existence
    existing = get_supabase().table("foods").select("id").eq("id", food_id).execute()
    if not existing.data:
        raise ValueError("Food item not found")

    result = (
        get_supabase().table("foods").update(data).eq("id", food_id).execute()
    )
    return result.data[0]


def delete_food(food_id: str) -> None:
    """Delete a food item (admin only)."""
    existing = get_supabase().table("foods").select("id").eq("id", food_id).execute()
    if not existing.data:
        raise ValueError("Food item not found")

    get_supabase().table("foods").delete().eq("id", food_id).execute()
