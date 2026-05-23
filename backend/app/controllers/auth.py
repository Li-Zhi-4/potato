from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask import Blueprint, jsonify, request
from app.db import get_db
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# -- api --

@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    # validation
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400
    if not email:
        return jsonify({"error": "email is required"}), 400
    if not password:
        return jsonify({"error": "password is required"}), 400
    
    db = get_db()

    hashed_password = generate_password_hash(password)

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
                hashed_password,
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
    
    token = create_access_token(identity=row["uid"])

    return jsonify({ "user": row_to_dict(row), "access_token": token}), 201



@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    # validation
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400
    if not password:
        return jsonify({"error": "password is required"}), 400
    
    db = get_db()

    row = db.execute("SELECT * FROM users WHERE username = %s", (username,)).fetchone()

    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "invalid username or password"}), 401
    
    row.pop("password_hash")
  
    token = create_access_token(identity=row["uid"])
    return jsonify({ "user": row_to_dict(row), "access_token": token}), 200


@bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    db = get_db()

    row = db.execute("SELECT * FROM users WHERE uid = %s", (uid,)).fetchone() 
    if not row:
        return jsonify({"error": "user not found"}), 401
    row.pop("password_hash")

    return jsonify(row_to_dict(row)), 200
