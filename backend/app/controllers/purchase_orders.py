import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict


bp = Blueprint('purchase_orders', __name__, url_prefix='/api/purchase_orders')


def row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_purchase_orders():
    db = get_db()
    rows = db.execute("SELECT * FROM purchase_orders ORDER BY po_no").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:po_id>")
def get_purchase_order(po_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_purchase_order():
    data = request.get_json(silent=True) or {}

    # validation
    vendor_id = (data.get("vendor_id") or "").strip()
    if not vendor_id:
        return jsonify({"error": "vendor_id is required"}), 400

    db = get_db()

    vendor = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
    if not vendor:
        return jsonify({"error": "vendor not found"}), 404

    # prep
    po_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # auto-increment po_no
    row = db.execute("SELECT COALESCE(MAX(po_no), 0) + 1 AS next_no FROM purchase_orders").fetchone()
    auto_po_no = row["next_no"]

    # execute
    try:
        db.execute(
            """
            INSERT INTO purchase_orders (
                po_id, po_no, vendor_id, status,
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                po_id,
                data.get("po_no", auto_po_no),
                vendor_id,
                data.get("status", "draft"),
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": f"po_no {data.get("po_no", auto_po_no)} already exists"}), 409

    # retrieve
    row = db.execute("SELECT * FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201


@bp.put("/<string:po_id>")
def update_purchase_order(po_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT po_id FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "po_no" in data:
        po_no = data["po_no"]
        if not po_no:
            return jsonify({"error": "purchase order no cannot be empty"}), 400
        check = db.execute("SELECT po_no FROM purchase_orders WHERE po_no = ?", (po_no,)).fetchone()
        if check:
            return jsonify({"error": "purchase order no already exists"}), 409
        fields.append("po_no = ?")
        values.append(po_no)
    if "vendor_id" in data:
        vendor_id = (data["vendor_id"] or "").strip()
        if not vendor_id:
            return jsonify({"error": "vendor_id cannot be empty"}), 400
        vendor = db.execute("SELECT vendor_id FROM vendors WHERE vendor_id = ?", (vendor_id,)).fetchone()
        if not vendor:
            return jsonify({"error": "vendor not found"}), 404
        fields.append("vendor_id = ?")
        values.append(vendor_id)
    if "status" in data:
        status = (data["status"] or "").strip()
        if status not in ("draft", "sent", "received", "cancelled"):
            return jsonify({"error": "status must be one of: draft, sent, received, cancelled"}), 400
        fields.append("status = ?")
        values.append(status)
    if "updated_by" in data:
        fields.append("updated_by = ?")
        values.append(data.get("updated_by"))
    if not fields:
        row = db.execute("SELECT * FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(po_id)

    # execute
    db.execute(f"UPDATE purchase_orders SET {', '.join(fields)} WHERE po_id = ?", values)
    db.commit()

    # retrieve
    row = db.execute("SELECT * FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:po_id>")
def delete_purchase_order(po_id: str):
    db = get_db()
    id = db.execute("SELECT po_id FROM purchase_orders WHERE po_id = ?", (po_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM purchase_orders WHERE po_id = ?", (po_id,))
    db.commit()
    return "", 204