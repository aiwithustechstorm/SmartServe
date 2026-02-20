"""Order service — placing orders, fetching, status transitions."""

from extensions import get_supabase

# Allowed status transitions (current → set of valid next statuses)
_VALID_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"preparing"},
    "preparing": {"ready"},
    "ready": {"completed"},
    "completed": set(),  # terminal state
}


def place_order(user_id: str, items: list[dict]) -> dict:
    """
    Validate food availability, calculate totals server-side,
    insert order + order_items, and return the created order.
    """
    # 1. Fetch all requested food items in one query
    food_ids = [str(item["food_id"]) for item in items]
    foods_result = (
        get_supabase().table("foods")
        .select("id, name, price, is_available")
        .in_("id", food_ids)
        .execute()
    )
    foods_map = {f["id"]: f for f in foods_result.data}

    # 2. Validate availability
    for item in items:
        fid = str(item["food_id"])
        food = foods_map.get(fid)
        if not food:
            raise ValueError(f"Food item {fid} not found")
        if not food["is_available"]:
            raise ValueError(f"'{food['name']}' is currently unavailable")

    # 3. Calculate total price server-side
    total_price = 0.0
    order_items_payload = []
    for item in items:
        fid = str(item["food_id"])
        food = foods_map[fid]
        line_price = food["price"] * item["quantity"]
        total_price += line_price
        order_items_payload.append(
            {
                "food_id": fid,
                "quantity": item["quantity"],
                "price": line_price,
            }
        )

    # 4. Insert order
    order_result = (
        get_supabase().table("orders")
        .insert(
            {
                "user_id": user_id,
                "status": "pending",
                "total_price": round(total_price, 2),
            }
        )
        .execute()
    )
    order = order_result.data[0]

    # 5. Insert order items
    for oi in order_items_payload:
        oi["order_id"] = order["id"]
    get_supabase().table("order_items").insert(order_items_payload).execute()

    # 6. Return enriched order
    order["items"] = order_items_payload
    return order


def get_user_orders(user_id: str) -> list:
    """Return all orders for a specific user, newest first."""
    orders = (
        get_supabase().table("orders")
        .select("*, order_items(*)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return orders.data


def get_all_orders(status: str | None = None) -> list:
    """Return all orders (admin). Optionally filter by status."""
    query = get_supabase().table("orders").select("*, order_items(*), users(name, email, phone)")
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data


def update_order_status(order_id: str, new_status: str) -> dict:
    """Update order status with transition validation."""
    # Fetch current order
    order_result = (
        get_supabase().table("orders")
        .select("id, status")
        .eq("id", order_id)
        .execute()
    )
    if not order_result.data:
        raise ValueError("Order not found")

    current_status = order_result.data[0]["status"]
    allowed = _VALID_TRANSITIONS.get(current_status, set())

    if new_status not in allowed:
        raise ValueError(
            f"Cannot transition from '{current_status}' to '{new_status}'. "
            f"Allowed: {allowed or 'none (terminal state)'}"
        )

    result = (
        get_supabase().table("orders")
        .update({"status": new_status})
        .eq("id", order_id)
        .execute()
    )
    return result.data[0]
