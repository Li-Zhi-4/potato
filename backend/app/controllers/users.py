from flask import Blueprint, jsonify, request
from app.db import get_db
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('users', __name__, url_prefix='/api/users')


# -- api --

@bp.get("")
def list_users():
    db = get_db()
    rows = db.execute("SELECT uid, username, email, first_name, last_name, created_at, updated_at FROM users ORDER BY first_name").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:uid>")
def get_user(uid: str):
    db = get_db()
    row = db.execute(
        "SELECT uid, username, email, first_name, last_name, created_at, updated_at FROM users WHERE uid = %s",
        (uid,)
    ).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_user():
    data = request.get_json(silent=True) or {}

    # validation
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password_hash = (data.get("password_hash") or "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400
    if not email:
        return jsonify({"error": "email is required"}), 400
    if not password_hash:
        return jsonify({"error": "password_hash is required"}), 400

    db = get_db()

    try:
        row = db.execute(
            """
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING uid, username, email, first_name, last_name, created_at, updated_at
            """,
            (
                username,
                email,
                password_hash,
                (data.get("first_name") or "").strip() or None,
                (data.get("last_name") or "").strip() or None,
            ),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation as e:
        db.rollback()
        if "username" in str(e):
            return jsonify({"error": f"username '{username}' already exists"}), 409
        return jsonify({"error": f"email '{email}' already exists"}), 409

    return jsonify(row_to_dict(row)), 201


@bp.put("/<string:uid>")
def update_user(uid: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    existing = db.execute("SELECT uid FROM users WHERE uid = %s", (uid,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    if "username" in data:
        username = (data["username"] or "").strip()
        if not username:
            return jsonify({"error": "username cannot be empty"}), 400
        fields.append("username = %s")
        values.append(username)
    if "email" in data:
        email = (data["email"] or "").strip()
        if not email:
            return jsonify({"error": "email cannot be empty"}), 400
        fields.append("email = %s")
        values.append(email)
    if "password_hash" in data:
        password_hash = (data["password_hash"] or "").strip()
        if not password_hash:
            return jsonify({"error": "password_hash cannot be empty"}), 400
        fields.append("password_hash = %s")
        values.append(password_hash)
    if "first_name" in data:
        fields.append("first_name = %s")
        values.append((data["first_name"] or "").strip() or None)
    if "last_name" in data:
        fields.append("last_name = %s")
        values.append((data["last_name"] or "").strip() or None)

    if not fields:
        row = db.execute(
            "SELECT uid, username, email, first_name, last_name, created_at, updated_at FROM users WHERE uid = %s",
            (uid,)
        ).fetchone()
        return jsonify(row_to_dict(row))

    fields.append("updated_at = NOW()")
    values.append(uid)

    try:
        db.execute(f"UPDATE users SET {', '.join(fields)} WHERE uid = %s", values)
        db.commit()
    except pg_errors.UniqueViolation as e:
        db.rollback()
        if "username" in str(e):
            return jsonify({"error": "username already exists"}), 409
        return jsonify({"error": "email already exists"}), 409

    row = db.execute(
        "SELECT uid, username, email, first_name, last_name, created_at, updated_at FROM users WHERE uid = %s",
        (uid,)
    ).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:uid>")
def delete_user(uid: str):
    db = get_db()
    existing = db.execute("SELECT uid FROM users WHERE uid = %s", (uid,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM users WHERE uid = %s", (uid,))
    db.commit()
    return "", 204