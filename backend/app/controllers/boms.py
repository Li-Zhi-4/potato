from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors

bp = Blueprint('boms', __name__, url_prefix='/api/boms')


# -- crud api --

@bp.get("")
@jwt_required()
def get_bom():
    db = get_db()
    job_no = request.args.get("job_no")

    if job_no:
        row = db.execute("SELECT * FROM boms WHERE job_no = %s", (job_no,)).fetchone()
        return jsonify(row_to_dict(row)) if row else (jsonify({"error": "not found"}), 404)

    rows = db.execute("SELECT * FROM boms").fetchall()
    return jsonify([row_to_dict(r) for r in rows])


@bp.get("/<string:bom_id>")
@jwt_required()
def get_bom_by_id(bom_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(row_to_dict(row))


@bp.post("")
@jwt_required()
def create_bom():
    data = request.get_json(silent=True) or {}

    # prep
    db = get_db()

    # execute
    try:
        row = db.execute(
            """
            INSERT INTO boms (
                title, job_no, description,
                created_by, updated_by
            ) VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                data.get("title"),
                data.get("job_no"),
                data.get("description"),
                data.get("created_by"),
                data.get("updated_by"),
            ),
        ).fetchone()
        db.commit()
    except pg_errors.UniqueViolation:
        return jsonify({"error": "could not create bom"}), 409

    # retrieve
    return jsonify(row_to_dict(row)), 201



@bp.put("/<string:bom_id>")
@jwt_required()
def update_bom(bom_id: str):
    data = request.get_json(silent=True) or {}
    db = get_db()

    # validation
    id = db.execute("SELECT bom_id FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404

    fields = []
    values = []

    # field mapping
    if "title" in data:
        fields.append("title = %s")
        values.append(data["title"])
    if "job_no" in data:
        fields.append("job_no = %s")
        values.append(data["job_no"])
    if "description" in data:
        fields.append("description = %s")
        values.append(data["description"])
    if "updated_by" in data:
        fields.append("updated_by = %s")
        values.append(data["updated_by"])
    if not fields:
        row = db.execute("SELECT * FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
        return jsonify(row_to_dict(row))

    # timestamp
    fields.append("updated_at = %s")
    values.append(datetime.now().isoformat())
    values.append(bom_id)

    # execute
    db.execute(f"UPDATE boms SET {', '.join(fields)} WHERE bom_id = %s", values)
    db.commit()

    # retrieve
    row = db.execute("SELECT * FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
    return jsonify(row_to_dict(row))


@bp.delete("/<string:bom_id>")
@jwt_required()
def delete_bom(bom_id: str):
    db = get_db()
    id = db.execute("SELECT bom_id FROM boms WHERE bom_id = %s", (bom_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM boms WHERE bom_id = %s", (bom_id,))
    db.commit()
    return "", 204


# -- tables --




@bp.get("/boms-table/<string:bom_id>")
@jwt_required()
def get_boms_table(bom_id: str):
    db = get_db()
    row = db.execute(
        """
        SELECT
            c.component_id,
            c.quantity,
            c.status,
            c.uom,
            p.part_no,
            p.description,
            po.po_no
        FROM components c
        LEFT JOIN parts p ON c.part_id = p.part_id
        LEFT JOIN purchase_orders po ON c.po_id = po.po_id
        WHERE c.bom_id = %s;
        """, (bom_id,)).fetchall()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify([row_to_dict(r) for r in row])