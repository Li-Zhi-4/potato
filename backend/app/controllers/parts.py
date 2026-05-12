from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors

bp = Blueprint('parts', __name__, url_prefix='/api/parts')


# -- crud api --

@bp.get("")
def list_parts():
    db = get_db()
    part_no = request.args.get("part_no")

    if part_no:
        row = db.execute("SELECT * FROM parts WHERE part_no = %s", (part_no,)).fetchone()
        return jsonify(row_to_dict(row)) if row else (jsonify({"error": "not found"}), 404)
    
    rows = db.execute("SELECT * FROM parts ORDER BY part_no").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


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
                part_id, part_no, description, is_assembly, 
                created_at, updated_at, created_by, updated_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                part_id,
                part_no,
                data.get("description"),
                is_assembly,
                now,
                now,
                data.get("created_by"),
                data.get("updated_by")
            ),
        )
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": f"part number {part_no} already exists"}), 409
    
    # retrieve
    row = db.execute("SELECT * FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.get("/<string:part_id>")
def get_part(part_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.put("/<string:part_id>")
def update_part(part_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation 
    id = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    
    fields = []
    values = []

    # field mapping
    if "part_no" in data:
        part_no = (data["part_no"] or "").strip()
        if not part_no:
            return jsonify({"error": "name cannot be empty"}), 400
        fields.append("part_no = %s")
        values.append(part_no)
    if "description" in data:
        fields.append("description = %s")
        values.append(data.get("description"))
    if "is_assembly" in data:
        is_assembly = 'assembly' if data.get("is_assembly") else 'part'
        fields.append("is_assembly = %s")
        values.append(is_assembly)
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data.get("updated_by"))
    if not fields:
        row = db.execute("SELECT * FROM parts WHERE part_id = %s", (part_id,)).fetchone()
        return jsonify(row_to_dict(row))
    
    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(part_id)

    # execute
    try:
        db.execute(f"UPDATE parts SET {', '.join(fields)} WHERE part_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": f"part_no already exists"}), 409


    # retrieve
    row = db.execute("SELECT * FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:part_id>")
def delete_part(part_id: str):
    db = get_db()
    id = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM parts WHERE part_id = %s", (part_id,))
    db.commit()
    return "", 204


# -- tables --

@bp.get("/parts-table")
def get_parts_table():
    db = get_db()
    rows = db.execute("""
        SELECT parts.part_id, parts.part_no, parts.description, parts.is_assembly, vendors.vendor_name AS vendor_name
        FROM parts
        LEFT JOIN vendor_parts ON parts.part_id = vendor_parts.part_id AND vendor_parts.is_primary = true
        LEFT JOIN vendors ON vendor_parts.vendor_id = vendors.vendor_id
    """).fetchall()
    return jsonify([row_to_dict(r) for r in rows]) 


@bp.get("/vendors-table/<string:part_id>")
def get_vendors_table(part_id: str):
    db = get_db()
    rows = db.execute("""
        SELECT vp.vendor_part_id, vp.part_no, vp.description, vp.is_primary, v.vendor_name AS vendor_name
        FROM vendor_parts vp
        LEFT JOIN vendors v ON vp.vendor_id = v.vendor_id
        WHERE vp.part_id = %s
    """, (part_id,)).fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/subparts-table/<string:part_id>")
def get_subparts_table(part_id: str):
    db = get_db()
    rows = db.execute("""
        SELECT
            sp.assembly_part_id,
            sp.quantity,
            sp.uom,
            p.part_id as subpart_id,
            p.part_no as subpart_part_no,
            p.description as subpart_description
        FROM assembly_parts sp
        LEFT JOIN parts p ON sp.subpart_id = p.part_id
        WHERE sp.part_id = %s
    """, (part_id,)).fetchall()
    return jsonify([row_to_dict(r) for r in rows])