from flask import Blueprint, jsonify, request
from app.db import get_db
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')


# -- api --

@bp.get("")
def list_permissions():
    db = get_db()
    workspace_id = request.args.get("workspace_id")
    uid = request.args.get("uid")

    if workspace_id and uid:
        rows = db.execute("SELECT * FROM permissions WHERE workspace_id = %s AND uid = %s ORDER BY entity, action", (workspace_id, uid)).fetchall()
    elif workspace_id:
        rows = db.execute("SELECT * FROM permissions WHERE workspace_id = %s ORDER BY entity, action", (workspace_id,)).fetchall()
    elif uid:
        rows = db.execute("SELECT * FROM permissions WHERE uid = %s ORDER BY entity, action", (uid,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM permissions ORDER BY entity, action").fetchall()

    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:permission_id>")
def get_permission(permission_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM permissions WHERE permission_id = %s", (permission_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_permission():
    data = request.get_json(silent=True) or {}

    # validation
    uid = (data.get("uid") or "").strip()
    workspace_id = (data.get("workspace_id") or "").strip()
    entity = (data.get("entity") or "").strip()
    action = (data.get("action") or "").strip()
    if not uid:
        return jsonify({"error": "uid is required"}), 400
    if not workspace_id:
        return jsonify({"error": "workspace_id is required"}), 400
    if not entity:
        return jsonify({"error": "entity is required"}), 400
    if not action:
        return jsonify({"error": "action is required"}), 400

    db = get_db()

    user = db.execute("SELECT uid FROM users WHERE uid = %s", (uid,)).fetchone()
    if not user:
        return jsonify({"error": "user not found"}), 404

    workspace = db.execute("SELECT workspace_id FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    if not workspace:
        return jsonify({"error": "workspace not found"}), 404

    try:
        row = db.execute(
            """
            INSERT INTO permissions (uid, workspace_id, entity, action, created_by)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (uid, workspace_id, entity, action, data.get("created_by")),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation:
        db.rollback()
        return jsonify({"error": f"permission '{action}' on '{entity}' already exists for this user in this workspace"}), 409

    return jsonify(row_to_dict(row)), 201


@bp.delete("/<string:permission_id>")
def delete_permission(permission_id: str):
    db = get_db()
    existing = db.execute("SELECT permission_id FROM permissions WHERE permission_id = %s", (permission_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM permissions WHERE permission_id = %s", (permission_id,))
    db.commit()
    return "", 204