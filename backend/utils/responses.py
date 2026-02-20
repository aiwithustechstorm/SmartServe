from flask import jsonify


def success_response(data=None, message="Success", status_code=200):
    """Return a standardised success JSON response."""
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code


def error_response(message="Something went wrong", status_code=400, errors=None):
    """Return a standardised error JSON response."""
    payload = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status_code
