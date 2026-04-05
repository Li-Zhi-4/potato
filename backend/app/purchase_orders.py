import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime

bp = Blueprint('purchase_orders', __name__, url_prefix='/api/purchase_orders')


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_purchase_orders():
    db = get_db()
    rows = db.execute("SELECT * FROM purchase_orders ORDER BY purchase_order_no").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


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
    purchase_order_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # auto-increment purchase_order_no
    row = db.execute("SELECT COALESCE(MAX(purchase_order_no), 0) + 1 AS next_no FROM purchase_orders").fetchone()
    auto_po_no = row["next_no"]

    # execute
    try:
        db.execute(
            """
            INSERT INTO purchase_orders (
                purchase_order_id, purchase_order_no, vendor_id, status,
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                purchase_order_id,
                data.get("purchase_order_no", auto_po_no),
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
        return jsonify({"error": "could not create purchase order"}), 409

    # retrieve
    row = db.execute("SELECT * FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.get("/<string:purchase_order_id>")
def get_purchase_order(purchase_order_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.put("/<string:purchase_order_id>")
def update_purchase_order(purchase_order_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT purchase_order_id FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "purchase_order_no" in data:
        purchase_order_no = data["purchase_order_no"]
        if not purchase_order_no:
            return jsonify({"error": "purchase order no cannot be empty"}), 400
        check = db.execute("SELECT purchase_order_no FROM purchase_orders WHERE purchase_order_no = ?", (purchase_order_no,)).fetchone()
        if check:
            return jsonify({"error": "purchase order no already exists"}), 409
        fields.append("purchase_order_no = ?")
        values.append(purchase_order_no)
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
        row = db.execute("SELECT * FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
        return jsonify(_row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(purchase_order_id)

    # execute
    db.execute(f"UPDATE purchase_orders SET {', '.join(fields)} WHERE purchase_order_id = ?", values)
    db.commit()

    # retrieve
    row = db.execute("SELECT * FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/<string:purchase_order_id>")
def delete_purchase_order(purchase_order_id: str):
    db = get_db()
    id = db.execute("SELECT purchase_order_id FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM purchase_orders WHERE purchase_order_id = ?", (purchase_order_id,))
    db.commit()
    return "", 204