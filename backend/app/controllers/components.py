from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors


bp = Blueprint('components', __name__, url_prefix='/api/components')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_components():
    db = get_db()
    rows = db.execute("SELECT * FROM components ORDER BY bom_id").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:component_id>")
def get_component(component_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM components WHERE component_id = %s", (component_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_component():
    data = request.get_json(silent=True) or {}

    # validation
    bom_id = (data.get("bom_id") or "").strip()
    if not bom_id:
        return jsonify({"error": "bom_id is required"}), 400
    part_id = (data.get("part_id") or "").strip()
    if not part_id:
        return jsonify({"error": "part_id is required"}), 400

    db = get_db()

    bom = db.execute("SELECT bom_id FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
    if not bom:
        return jsonify({"error": "bom not found"}), 404
    part = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
    if not part:
        return jsonify({"error": "part not found"}), 404

    po_id = (data.get("po_id") or "").strip()
    if po_id:
        purchase_order = db.execute("SELECT po_id FROM purchase_orders WHERE po_id = %s", (po_id,)).fetchone()
        if not purchase_order:
            return jsonify({"error": "purchase order not found"}), 404
    else:
        po_id = None

    # prep
    component_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO components (
                component_id, bom_id, part_id, po_id,
                quantity, uom, status,
                created_at, updated_at, created_by, updated_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                component_id,
                bom_id,
                part_id,
                po_id,
                data.get("quantity", 1),
                data.get("uom", "each"),
                data.get("status"),
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "could not create component"}), 409

    # retrieve
    row = db.execute("SELECT * FROM components WHERE component_id = %s", (component_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.put("/<string:component_id>")
def update_component(component_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT component_id FROM components WHERE component_id = %s", (component_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "bom_id" in data:
        bom_id = (data["bom_id"] or "").strip()
        if not bom_id:
            return jsonify({"error": "bom_id cannot be empty"}), 400
        bom = db.execute("SELECT bom_id FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
        if not bom:
            return jsonify({"error": "bom not found"}), 404
        fields.append("bom_id = %s")
        values.append(bom_id)
    if "part_id" in data:
        part_id = (data["part_id"] or "").strip()
        if not part_id:
            return jsonify({"error": "part_id cannot be empty"}), 400
        part = db.execute("SELECT part_id FROM parts WHERE part_id = %s", (part_id,)).fetchone()
        if not part:
            return jsonify({"error": "part not found"}), 404
        fields.append("part_id = %s")
        values.append(part_id)
    if "part_vendor_id" in data:
        part_vendor_id = (data["part_vendor_id"] or "").strip()
        if part_vendor_id:
            part_vendor = db.execute("SELECT part_vendor_id FROM part_vendor WHERE part_vendor_id = %s", (part_vendor_id,)).fetchone()
            if not part_vendor:
                return jsonify({"error": "part_vendor not found"}), 404
        else:
            part_vendor_id = None
        fields.append("part_vendor_id = %s")
        values.append(part_vendor_id)
    if "po_id" in data:
        po_id = (data["po_id"] or "").strip()
        if po_id:
            purchase_order = db.execute("SELECT po_id FROM purchase_orders WHERE po_id = %s", (po_id,)).fetchone()
            if not purchase_order:
                return jsonify({"error": "purchase order not found"}), 404
        else:
            po_id = None
        fields.append("po_id = %s")
        values.append(po_id)
    if "quantity" in data:
        fields.append("quantity = %s")
        values.append(data["quantity"])
    if "uom" in data:
        fields.append("uom = %s")
        values.append(data["uom"])
    if "status" in data:
        fields.append("status = %s")
        values.append(data["status"])
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM components WHERE component_id = %s", (component_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(component_id)

    # execute
    try:
        db.execute(f"UPDATE components SET {', '.join(fields)} WHERE component_id = %s", values)
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "could not update component"}), 409

    # retrieve
    row = db.execute("SELECT * FROM components WHERE component_id = %s", (component_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:component_id>")
def delete_component(component_id: str):
    db = get_db()
    id = db.execute("SELECT component_id FROM components WHERE component_id = %s", (component_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM components WHERE component_id = %s", (component_id,))
    db.commit()
    return "", 204