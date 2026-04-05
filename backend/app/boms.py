import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime

bp = Blueprint('boms', __name__, url_prefix='/api/boms')


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}

# -- api --

@bp.get("")
def list_boms():
    db = get_db()
    rows = db.execute("SELECT * FROM boms ORDER BY job_no").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


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
    return jsonify(_row_to_dict(row)), 201


@bp.get("/<string:bom_id>")
def get_bom(bom_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


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
        return jsonify(_row_to_dict(row))

    # timestamp
    fields.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(bom_id)

    # execute
    db.execute(f"UPDATE boms SET {', '.join(fields)} WHERE bom_id = ?", values)
    db.commit()

    # retrieve
    row = db.execute("SELECT * FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/<string:bom_id>")
def delete_bom(bom_id: str):
    db = get_db()
    id = db.execute("SELECT bom_id FROM boms WHERE bom_id = ?", (bom_id,)).fetchone()
    if not id:
        return jsonify({"error": "not found"}), 404
    db.execute("DELETE FROM boms WHERE bom_id = ?", (bom_id,))
    db.commit()
    return "", 204