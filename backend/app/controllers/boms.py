import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict

bp = Blueprint('boms', __name__, url_prefix='/api/boms')


# -- crud api --

@bp.get("")
def get_bom():
    db = get_db()
    job_no = request.args.get("job_no")

    if job_no:
        row = db.execute("SELECT * FROM boms WHERE job_no = ?", (job_no,)).fetchone()
        return jsonify(row_to_dict(row)) if row else (jsonify({"error": "not found"}), 404)

    rows = db.execute("SELECT * FROM boms").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:bom_id>")
def get_bom_by_id(bom_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
def create_bom():
    data = request.get_json(silent=True) or {}

    # prep
    db = get_db()
    bom_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO boms (
                bom_id, job_no, description,
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bom_id,
                data.get("job_no"),
                data.get("description"),
                now,
                now,
                data.get("created_by"),
                data.get("updated_by"),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "could not create bom"}), 409

    # retrieve
    row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    return jsonify(row_to_dict(row)), 201



@bp.put("/<string:bom_id>")
def update_bom(bom_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT bom_id FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "job_no" in data:
        fields.append("job_no = ?")
        values.append(data["job_no"])
    if "description" in data:
        fields.append("description = ?")
        values.append(data["description"])
    if "updated_by" in data:
        fields.append("updated_by = ?")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(bom_id)

    # execute
    db.execute(f"UPDATE boms SET {', '.join(fields)} WHERE bom_id = ?", values)
    db.commit()

    # retrieve
    row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:bom_id>")
def delete_bom(bom_id: str):
    db = get_db()
    id = db.execute("SELECT bom_id FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM boms WHERE bom_id = ?", (bom_id,))
    db.commit()
    return "", 204


# -- tables --




@bp.get("/boms-table/<string:bom_id>")
def get_boms_table(bom_id: str):
    db = get_db()
    row = db.execute(
        """
        SELECT 
            c.quantity, 
            c.status, 
            c.uom, 
            p.part_no, 
            p.description, 
            po.purchase_order_no
        FROM components c
        LEFT JOIN parts p ON c.part_id = p.part_id
        LEFT JOIN purchase_orders po ON c.purchase_order_id = po.purchase_order_id
        WHERE c.bom_id = ?;
        """, (bom_id,)).fetchall()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify([row_to_dict(r) for r in row])