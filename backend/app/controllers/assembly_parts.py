from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('assembly_parts', __name__, url_prefix='/api/assembly_parts')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_assembly_parts():
    db = get_db()
    rows = db.execute("SELECT * FROM assembly_parts ORDER BY part_id").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.post("")
def create_assembly_parts():
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

    part = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    if not part:
        return jsonify({"error": "part not found"}), 404
    subpart = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (subpart_id,)).fetchone()
    if not subpart:
        return jsonify({"error": "subpart not found"}), 404

    # prep
    assembly_part_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO assembly_parts (
                assembly_part_id, part_id, subpart_id, quantity, uom,
                created_at, updated_at, created_by, updated_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                assembly_part_id,
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
    except pg_errors.UniqueViolation:
        return jsonify({"error": "this subpart is already assigned to this part"}), 409

    # retrieve
    row = db.execute("SELECT * FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.get("/<string:assembly_part_id>")
def get_assembly_parts(assembly_part_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.put("/<string:assembly_part_id>")
def update_assembly_parts(assembly_part_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT assembly_part_id FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
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
    if "subpart_id" in data:
        subpart_id = (data["subpart_id"] or "").strip()
        if not subpart_id:
            return jsonify({"error": "subpart_id cannot be empty"}), 400
        subpart = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (subpart_id,)).fetchone()
        if not subpart:
            return jsonify({"error": "subpart not found"}), 404
        fields.append("subpart_id = %s")
        values.append(subpart_id)
    if "quantity" in data:
        fields.append("quantity = %s")
        values.append(data["quantity"])
    if "uom" in data:
        fields.append("uom = %s")
        values.append(data["uom"])
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(assembly_part_id)

    # execute
    try:
        db.execute(f"UPDATE assembly_parts SET {', '.join(fields)} WHERE assembly_part_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "this subpart is already assigned to this part"}), 409

    # retrieve
    row = db.execute("SELECT * FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:assembly_part_id>")
def delete_assembly_parts(assembly_part_id: str):
    db = get_db()
    id = db.execute("SELECT assembly_part_id FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM assembly_parts WHERE assembly_part_id = %s", (assembly_part_id,))
    db.commit()
    return "", 204