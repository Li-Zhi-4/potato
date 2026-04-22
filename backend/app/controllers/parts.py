import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
# from utils.helpers import row_to_dict

bp = Blueprint('parts', __name__, url_prefix='/api/parts')


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_parts():
    db = get_db()
    rows = db.execute("SELECT * FROM parts ORDER BY part_no").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("")
def create_part():
    data = request.get_json(silent=True) or {}

    # validation
    part_no = (data.get("part_no") or "").strip()
    if not part_no:
        return jsonify({"error": "part_no is required"}), 400
    
    # prep
    db = get_db()
    part_id = str(uuid.uuid4())
    is_assembly = 'assembly' if data.get("is_assembly") else 'part'
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO parts (
                part_id, part_no, description, is_assembly, workflow_id, 
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                part_id,
                part_no,
                data.get("description"),
                is_assembly,
                data.get("workflow_id", "0"),
                now,
                now,
                data.get("created_by"),
                data.get("updated_by")
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": f"part number {part_no} already exists"}), 409
    
    # retrieve
    row = db.execute("SELECT * FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.get("/<string:part_id>")
def get_part(part_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.get("/part-no/<string:part_no>")
def get_part_by_part_no(part_no: str):
    db = get_db()
    row = db.execute("SELECT * FROM parts WHERE part_no = ?", (part_no,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.put("/<string:part_id>")
def update_part(part_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation 
    id = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    
    fields = []
    values = []

    # field mapping
    if "part_no" in data:
        part_no = (data["part_no"] or "").strip()
        if not part_no:
            return jsonify({"error": "name cannot be empty"}), 400
        fields.append("part_no = ?")
        values.append(part_no)
    if "description" in data:
        fields.append("description = ?")
        values.append(data.get("description"))
    if "is_assembly" in data:
        is_assembly = 'assembly' if data.get("is_assembly") else 'part'
        fields.append("is_assembly = ?")
        values.append(is_assembly)
    if "workflow_id" in data:
        fields.append("workflow_id = ?")
        values.append(data.get("workflow_id"))
    if "updated_by" in data:
        fields.append("updated_by = ?")
        values.append(data.get("updated_by"))
    if not fields:
        row = db.execute("SELECT * FROM parts WHERE part_id = ?", (part_id,)).fetchone()
        return jsonify(_row_to_dict(row))
    
    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(part_id)

    # execute
    try:
        db.execute(f"UPDATE parts SET {', '.join(fields)} WHERE part_id = ?", values)
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": f"part_no already exists"}), 409


    # retrieve
    row = db.execute("SELECT * FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/<string:part_id>")
def delete_part(part_id: str):
    db = get_db()
    id = db.execute("SELECT part_id FROM parts WHERE part_id = ?", (part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM parts WHERE part_id = ?", (part_id,))
    db.commit()
    return "", 204


# -- tables --

@bp.get("/table")
def get_parts_table():
    db = get_db()
    rows = db.execute("""
        SELECT parts.*, vendors.name AS vendor_name
        FROM parts
        LEFT JOIN part_vendor ON parts.part_id = part_vendor.part_id AND part_vendor.is_primary = 1
        LEFT JOIN vendors ON part_vendor.vendor_id = vendors.vendor_id
    """).fetchall()
    return jsonify([_row_to_dict(r) for r in rows]) 


@bp.get("/vendor-table/<string:part_id>")
def get_vendor_table(part_id: str):
    db = get_db()
    rows = db.execute("""
        SELECT pv.*, v.name AS vendor_name
        FROM part_vendor pv
        LEFT JOIN vendors v ON pv.vendor_id = v.vendor_id
        WHERE pv.part_id = ?
    """, (part_id,)).fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.get("/subparts-table/<string:part_id>")
def get_subparts_table(part_id: str):
    db = get_db()
    rows = db.execute("""
        SELECT 
            sp.quantity, 
            sp.uom,
            p.part_id as subpart_id,
            p.part_no as subpart_part_no,
            p.description as subpart_description
        FROM part_subpart sp
        LEFT JOIN parts p ON sp.subpart_id = p.part_id
        WHERE sp.part_id = ?
    """, (part_id,)).fetchall()
    return jsonify([_row_to_dict(r) for r in rows])