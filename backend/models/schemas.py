from marshmallow import Schema, fields, validate, pre_load


# ── Auth ────────────────────────────────────────────────────────────
class RegisterSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    email = fields.Email(required=True)
    phone = fields.Str(required=True, validate=validate.Length(min=10, max=15))
    role = fields.Str(
        load_default="user", validate=validate.OneOf(["user", "admin"])
    )


class LoginSchema(Schema):
    email = fields.Email(required=True)


class VerifyOtpSchema(Schema):
    email = fields.Email(required=True)
    otp = fields.Str(required=True, validate=validate.Length(equal=6))


# ── Food ────────────────────────────────────────────────────────────
class _NormaliseImageUrl:
    """Mixin that converts empty image_url strings to None before load."""
    @pre_load
    def normalise_image_url(self, data, **kwargs):
        if data.get("image_url") == "":
            data["image_url"] = None
        return data


class FoodCreateSchema(_NormaliseImageUrl, Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    price = fields.Float(required=True, validate=validate.Range(min=0))
    category = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    is_available = fields.Bool(load_default=True)
    image_url = fields.Url(load_default=None, allow_none=True)


class FoodUpdateSchema(_NormaliseImageUrl, Schema):
    name = fields.Str(validate=validate.Length(min=1, max=200))
    price = fields.Float(validate=validate.Range(min=0))
    category = fields.Str(validate=validate.Length(min=1, max=100))
    is_available = fields.Bool()
    image_url = fields.Url(allow_none=True)


# ── Order ───────────────────────────────────────────────────────────
class OrderItemSchema(Schema):
    food_id = fields.UUID(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))


class OrderCreateSchema(Schema):
    items = fields.List(
        fields.Nested(OrderItemSchema), required=True, validate=validate.Length(min=1)
    )


class OrderStatusUpdateSchema(Schema):
    status = fields.Str(
        required=True,
        validate=validate.OneOf(["pending", "preparing", "ready", "completed"]),
    )
