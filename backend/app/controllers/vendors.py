import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict


bp = Blueprint('vendors', __name__, url_prefix='/api/vendors')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_vendors():
    db = get_db()
    rows = db.execute("SELECT * FROM vendors ORDER BY name").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.post("")
def create_vendor():
    data = request.get_json(silent=True) or {}

    # validation
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    # prep
    db = get_db()
    vendor_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO vendors (
                vendor_id, name,
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                vendor_id,
                name,
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": f"vendor '{name}' already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.get("/<string:vendor_id>")
def get_vendor(vendor_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.put("/<string:vendor_id>")
def update_vendor(vendor_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "name" in data:
        name = (data["name"] or "").strip()
        if not name:
            return jsonify({"error": "name cannot be empty"}), 400
        fields.append("name = ?")
        values.append(name)
    if "updated_by" in data:
        fields.append("updated_by = ?")
        values.append(data.get("updated_by"))
    if not fields:
        row = db.execute("SELECT * FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(vendor_id)

    # execute
    try:
        db.execute(f"UPDATE vendors SET {', '.join(fields)} WHERE vendor_id = ?", values)
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": f"vendor name already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:vendor_id>")
def delete_vendor(vendor_id: str):
    db = get_db()
    id = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM vendors WHERE vendor_id = ?", (vendor_id,))
    db.commit()
    return "", 204