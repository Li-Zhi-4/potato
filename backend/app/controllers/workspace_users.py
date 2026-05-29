from flask import Blueprint, jsonify, request
from app.db import get_db
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('workspace_users', __name__, url_prefix='/api/workspace_users')


# -- api --

@bp.get("")
def list_workspace_users():
    db = get_db()
    workspace_id = request.args.get("workspace_id")
    uid = request.args.get("uid")

    if workspace_id:
        rows = db.execute("SELECT * FROM workspace_users WHERE workspace_id = %s ORDER BY created_at", (workspace_id,)).fetchall()
    elif uid:
        rows = db.execute("SELECT * FROM workspace_users WHERE uid = %s ORDER BY created_at", (uid,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM workspace_users ORDER BY created_at").fetchall()

    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:workspace_user_id>")
def get_workspace_user(workspace_user_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM workspace_users WHERE workspace_user_id = %s", (workspace_user_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_workspace_user():
    data = request.get_json(silent=True) or {}

    # validation
    workspace_id = (data.get("workspace_id") or "").strip()
    uid = (data.get("uid") or "").strip()
    if not workspace_id:
        return jsonify({"error": "workspace_id is required"}), 400
    if not uid:
        return jsonify({"error": "uid is required"}), 400

    db = get_db()

    workspace = db.execute("SELECT workspace_id FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    if not workspace:
        return jsonify({"error": "workspace not found"}), 404

    user = db.execute("SELECT uid FROM users WHERE uid = %s", (uid,)).fetchone()
    if not user:
        return jsonify({"error": "user not found"}), 404

    try:
        row = db.execute(
            """
            INSERT INTO workspace_users (workspace_id, uid)
            VALUES (%s, %s)
            RETURNING *
            """,
            (workspace_id, uid),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation:
        db.rollback()
        return jsonify({"error": "user is already a member of this workspace"}), 409

    return jsonify(row_to_dict(row)), 201


@bp.delete("/<string:workspace_user_id>")
def delete_workspace_user(workspace_user_id: str):
    db = get_db()
    existing = db.execute("SELECT workspace_user_id FROM workspace_users WHERE workspace_user_id = %s", (workspace_user_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM workspace_users WHERE workspace_user_id = %s", (workspace_user_id,))
    db.commit()
    return "", 204