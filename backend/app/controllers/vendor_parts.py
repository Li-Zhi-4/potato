from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('vendor_parts', __name__, url_prefix='/api/vendor_parts')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_vendor_parts():
    db = get_db()
    rows = db.execute("SELECT * FROM vendor_parts ORDER BY part_id").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.post("")
def create_part_vendor():
    data = request.get_json(silent=True) or {}

    # validation
    part_id = (data.get("part_id") or "").strip()
    if not part_id:
        return jsonify({"error": "part_id is required"}), 400
    vendor_id = (data.get("vendor_id") or "").strip()
    if not vendor_id:
        return jsonify({"error": "vendor_id is required"}), 400

    db = get_db()
    print("part_id ", part_id)
    part = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    print("part ", part)
    if not part:
        return jsonify({"error": "part not found"}), 404
    vendor = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
    if not vendor:
        return jsonify({"error": "vendor not found"}), 404

    # prep
    vendor_part_id = str(uuid.uuid4())
    is_primary = bool(data.get("is_primary"))
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO vendor_parts (
                vendor_part_id, part_id, vendor_id, part_no, description, is_primary,
                created_at, updated_at, created_by, updated_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                vendor_part_id,
                part_id,
                vendor_id,
                data.get("part_no"),
                data.get("description"),
                is_primary,
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "a vendor entry for this part already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.get("/<string:vendor_part_id>")
def get_part_vendor(vendor_part_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.put("/<string:vendor_part_id>")
def update_part_vendor(vendor_part_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT vendor_part_id FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "part_id" in data:
        part_id = (data["part_id"] or "").strip()
        if not part_id:
            return jsonify({"error": "part_id cannot be empty"}), 400
        part = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
        if not part:
            return jsonify({"error": "part not found"}), 404
        fields.append("part_id = %s")
        values.append(part_id)
    if "vendor_id" in data:
        vendor_id = (data["vendor_id"] or "").strip()
        if not vendor_id:
            return jsonify({"error": "vendor_id cannot be empty"}), 400
        vendor = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = %s", (vendor_id,)).fetchone()
        if not vendor:
            return jsonify({"error": "vendor not found"}), 404
        fields.append("vendor_id = %s")
        values.append(vendor_id)
    if "part_no" in data:
        fields.append("part_no = %s")
        values.append(data["part_no"])
    if "description" in data:
        fields.append("description = %s")
        values.append(data["description"])
    if "is_primary" in data:
        fields.append("is_primary = %s")
        values.append(bool(data["is_primary"]))
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(vendor_part_id)

    # execute
    try:
        db.execute(f"UPDATE vendor_parts SET {', '.join(fields)} WHERE vendor_part_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "a vendor entry for this part already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:vendor_part_id>")
def delete_part_vendor(vendor_part_id: str):
    db = get_db()
    id = db.execute("SELECT vendor_part_id FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM vendor_parts WHERE vendor_part_id = %s", (vendor_part_id,))
    db.commit()
    return "", 204