from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.db import get_db
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('workspaces', __name__, url_prefix='/api/workspaces')


# -- api --

@bp.get("")
@jwt_required()
def list_workspaces():
    db = get_db()
    rows = db.execute("SELECT * FROM workspaces ORDER BY workspace_name").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:workspace_id>")
@jwt_required()
def get_workspace(workspace_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
@jwt_required()
def create_workspace():
    data = request.get_json(silent=True) or {}

    # validation
    workspace_name = (data.get("workspace_name") or "").strip()
    if not workspace_name:
        return jsonify({"error": "workspace_name is required"}), 400

    db = get_db()

    try:
        row = db.execute(
            """
            INSERT INTO workspaces (workspace_name, created_by, updated_by)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (
                workspace_name,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation:
        db.rollback()
        return jsonify({"error": f"workspace '{workspace_name}' already exists"}), 409

    return jsonify(row_to_dict(row)), 201


@bp.put("/<string:workspace_id>")
@jwt_required()
def update_workspace(workspace_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    existing = db.execute("SELECT workspace_id FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    if "workspace_name" in data:
        workspace_name = (data["workspace_name"] or "").strip()
        if not workspace_name:
            return jsonify({"error": "workspace_name cannot be empty"}), 400
        fields.append("workspace_name = %s")
        values.append(workspace_name)
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data.get("updated_by"))

    if not fields:
        row = db.execute("SELECT * FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
        return jsonify(row_to_dict(row))

    fields.append("updated_at = NOW()")
    values.append(workspace_id)

    try:
        db.execute(f"UPDATE workspaces SET {', '.join(fields)} WHERE workspace_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        db.rollback()
        return jsonify({"error": "workspace_name already exists"}), 409

    row = db.execute("SELECT * FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:workspace_id>")
@jwt_required()
def delete_workspace(workspace_id: str):
    db = get_db()
    existing = db.execute("SELECT workspace_id FROM workspaces WHERE workspace_id = %s", (workspace_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM workspaces WHERE workspace_id = %s", (workspace_id,))
    db.commit()
    return "", 204