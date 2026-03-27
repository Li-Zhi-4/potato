import sqlite3
from flask import Blueprint, jsonify, request
from app.db import get_db

bp = Blueprint('parts', __name__, url_prefix='/parts')


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}


# -- api --

@bp.get("/")
def list_parts():
    db = get_db()
    rows = db.execute("SELECT * FROM parts ORDER BY part_no").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/parts")
def create_part():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    db = get_db()
    cur = db.execute(
        """
        INSERT INTO parts (name, description, part_number, is_assembly)
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            data.get("description"),
            (data.get("part_number") or "").strip() or None,
            1 if data.get("is_assembly") else 0,
        ),
    )
    db.commit()
    pid = cur.lastrowid
    row = db.execute("SELECT * FROM parts WHERE id = ?", (pid,)).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.get("/parts/<int:part_id>")
def get_part(part_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM parts WHERE id = ?", (part_id,)).fetchone()
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
