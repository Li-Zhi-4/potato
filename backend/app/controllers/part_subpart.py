import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict


bp = Blueprint('part_subpart', __name__, url_prefix='/api/part_subparts')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_part_subparts():
    db = get_db()
    rows = db.execute("SELECT * FROM part_subpart ORDER BY part_id").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.post("")
def create_part_subpart():
    data = request.get_json(silent=True) or {}

    # validation
    part_id = (data.get("part_id") or "").strip()
    if not part_id:
        return jsonify({"error": "part_id is required"}), 400
    subpart_id = (data.get("subpart_id") or "").strip()
    if not subpart_id:
        return jsonify({"error": "subpart_id is required"}), 400
    if part_id == subpart_id:
        return jsonify({"error": "part_id and subpart_id cannot be the same"}), 400

    db = get_db()

    part = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    if not part:
        return jsonify({"error": "part not found"}), 404
    subpart = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (subpart_id,)).fetchone()
    if not subpart:
        return jsonify({"error": "subpart not found"}), 404

    # prep
    part_subpart_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO part_subpart (
                part_subpart_id, part_id, subpart_id, quantity, uom,
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                part_subpart_id,
                part_id,
                subpart_id,
                data.get("quantity", 1),
                data.get("uom", "each"),
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "this subpart is already assigned to this part"}), 409

    # retrieve
    row = db.execute("SELECT * FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.get("/<string:part_subpart_id>")
def get_part_subpart(part_subpart_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.put("/<string:part_subpart_id>")
def update_part_subpart(part_subpart_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT part_subpart_id FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "part_id" in data:
        part_id = (data["part_id"] or "").strip()
        if not part_id:
            return jsonify({"error": "part_id cannot be empty"}), 400
        part = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (part_id,)).fetchone()
        if not part:
            return jsonify({"error": "part not found"}), 404
        fields.append("part_id = ?")
        values.append(part_id)
    if "subpart_id" in data:
        subpart_id = (data["subpart_id"] or "").strip()
        if not subpart_id:
            return jsonify({"error": "subpart_id cannot be empty"}), 400
        subpart = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (subpart_id,)).fetchone()
        if not subpart:
            return jsonify({"error": "subpart not found"}), 404
        fields.append("subpart_id = ?")
        values.append(subpart_id)
    if "quantity" in data:
        fields.append("quantity = ?")
        values.append(data["quantity"])
    if "uom" in data:
        fields.append("uom = ?")
        values.append(data["uom"])
    if "updated_by" in data:
        fields.append("updated_by = ?")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(part_subpart_id)

    # execute
    try:
        db.execute(f"UPDATE part_subpart SET {', '.join(fields)} WHERE part_subpart_id = ?", values)
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "this subpart is already assigned to this part"}), 409

    # retrieve
    row = db.execute("SELECT * FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:part_subpart_id>")
def delete_part_subpart(part_subpart_id: str):
    db = get_db()
    id = db.execute("SELECT part_subpart_id FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM part_subpart WHERE part_subpart_id = ?", (part_subpart_id,))
    db.commit()
    return "", 204