from flask import Blueprint, jsonify, request
from app.db import get_db
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('vendors', __name__, url_prefix='/api/vendors')


# -- api --

@bp.get("")
def list_vendors():
    db = get_db()
    include_archived = request.args.get("archived", "false").lower() == "true"

    if include_archived:
        rows = db.execute("SELECT * FROM vendors ORDER BY vendor_name").fetchall()
    else:
        rows = db.execute("SELECT * FROM vendors WHERE archived_at IS NULL ORDER BY vendor_name").fetchall()

    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:vendor_id>")
def get_vendor(vendor_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_vendor():
    data = request.get_json(silent=True) or {}

    # validation
    vendor_name = (data.get("vendor_name") or "").strip()
    if not vendor_name:
        return jsonify({"error": "vendor_name is required"}), 400

    # prep
    db = get_db()

    # execute
    try:
        row = db.execute(
            """
            INSERT INTO vendors (
                vendor_name,
                created_by, updated_by
            ) VALUES (%s, %s, %s)
            RETURNING *
            """,
            (
                vendor_name,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": f"vendor '{vendor_name}' already exists"}), 409

    # retrieve
    return jsonify(row_to_dict(row)), 201


@bp.put("/<string:vendor_id>")
def update_vendor(vendor_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "vendor_name" in data:
        vendor_name = (data["vendor_name"] or "").strip()
        if not vendor_name:
            return jsonify({"error": "vendor_name cannot be empty"}), 400
        fields.append("vendor_name = %s")
        values.append(vendor_name)
    if "archived_at" in data:
        fields.append("archived_at = %s")
        values.append(data.get("archived_at"))
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data.get("updated_by"))
    if not fields:
        row = db.execute("SELECT * FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(vendor_id)

    # execute
    try:
        db.execute(f"UPDATE vendors SET {', '.join(fields)} WHERE vendor_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": f"vendor vendor_name already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:vendor_id>")
def delete_vendor(vendor_id: str):
    db = get_db()
    id = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM vendors WHERE vendor_id = %s", (vendor_id,))
    db.commit()
    return "", 204