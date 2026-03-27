import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime

bp = Blueprint('parts', __name__, url_prefix='/parts')


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}


"""
CREATE TABLE IF NOT EXISTS parts (
    part_id     TEXT PRIMARY KEY,
    part_no     TEXT NOT NULL UNIQUE,
    description TEXT,
    type        TEXT NOT NULL CHECK (type IN ('part', 'assembly')),
    workflow_id TEXT,

    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    created_by  TEXT NOT NULL REFERENCES users(uid),
    updated_by  TEXT REFERENCES users(uid)
);
"""

# -- api --

@bp.get("/")
def list_parts():
    db = get_db()
    rows = db.execute("SELECT * FROM parts ORDER BY part_no").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/")
def create_part():
    data = request.get_json(silent=True) or {}

    # validation
    part_no = (data.get("part_no") or "").strip()
    if not part_no:
        return jsonify({"error": "part_no is required"}), 400
    
    # prep
    db = get_db()
    part_id = str(uuid.uuid4())
    part_type = 'assembly' if data.get("is_assembly") else 'part'
    now = datetime.now().isoformat()

    # execute
    try:
        db.execute(
            """
            INSERT INTO parts (
                part_id, part_no, description, type, workflow_id, 
                created_at, updated_at, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                part_id,
                part_no,
                data.get("description"),
                part_type,
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


@bp.put("/parts/<int:part_id>")
def update_part(part_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    existing = db.execute("SELECT id FROM parts WHERE id = ?", (part_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    fields = []
    values = []
    if "name" in data:
        n = (data["name"] or "").strip()
        if not n:
            return jsonify({"error": "name cannot be empty"}), 400
        fields.append("name = ?")
        values.append(n)
    if "description" in data:
        fields.append("description = ?")
        values.append(data.get("description"))
    if "part_number" in data:
        pn = (data.get("part_number") or "").strip() or None
        fields.append("part_number = ?")
        values.append(pn)
    if "is_assembly" in data:
        fields.append("is_assembly = ?")
        values.append(1 if data.get("is_assembly") else 0)
    if not fields:
        row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
        return jsonify(_row_to_dict(row))
    values.append(part_id)
    db.execute(f"UPDATE parts SET {', '.join(fields)} WHERE id = ?", values)
    db.commit()
    row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/parts/<int:part_id>")
def delete_part(part_id: int):
    db = get_db()
    cur = db.execute("DELETE FROM parts WHERE id = ?", (part_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204
