import sqlite3

from flask import Blueprint, jsonify, request

from app.db import get_db

bp = Blueprint("api", __name__, url_prefix="/api")


def _row_to_dict(row) -> dict:
    return {k: row[k] for k in row.keys()}


# --- Parts ---


@bp.get("/parts")
def list_parts():
    db = get_db()
    rows = db.execute(
        "SELECT id, name, description, part_number, is_assembly, created_at FROM parts ORDER BY name"
    ).fetchall()
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


# --- Assembly children ---


@bp.get("/parts/<int:part_id>/children")
def list_assembly_children(part_id: int):
    db = get_db()
    parent = db.execute("SELECT id FROM parts WHERE id = ?", (part_id,)).fetchone()
    if not parent:
        return jsonify({"error": "part not found"}), 404
    rows = db.execute(
        """
        SELECT ac.id, ac.parent_part_id, ac.child_part_id, ac.quantity, ac.uom,
               p.name AS child_name, p.part_number AS child_part_number
        FROM assembly_children ac
        JOIN parts p ON p.id = ac.child_part_id
        WHERE ac.parent_part_id = ?
        ORDER BY p.name
        """,
        (part_id,),
    ).fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/parts/<int:part_id>/children")
def add_assembly_child(part_id: int):
    data = request.get_json(silent=True) or {}
    child_id = data.get("child_part_id")
    if child_id is None:
        return jsonify({"error": "child_part_id is required"}), 400
    try:
        qty = float(data.get("quantity", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a number"}), 400
    if qty <= 0:
        return jsonify({"error": "quantity must be positive"}), 400
    uom = (data.get("uom") or "ea").strip() or "ea"
    db = get_db()
    if part_id == int(child_id):
        return jsonify({"error": "part cannot be a child of itself"}), 400
    db.execute(
        """
        INSERT INTO assembly_children (parent_part_id, child_part_id, quantity, uom)
        VALUES (?, ?, ?, ?)
        """,
        (part_id, child_id, qty, uom),
    )
    db.commit()
    row = db.execute(
        "SELECT * FROM assembly_children WHERE parent_part_id = ? AND child_part_id = ?",
        (part_id, child_id),
    ).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.delete("/parts/<int:part_id>/children/<int:child_id>")
def remove_assembly_child(part_id: int, child_id: int):
    db = get_db()
    cur = db.execute(
        "DELETE FROM assembly_children WHERE parent_part_id = ? AND child_part_id = ?",
        (part_id, child_id),
    )
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


# --- BOMs ---


@bp.get("/boms")
def list_boms():
    db = get_db()
    rows = db.execute("SELECT * FROM boms ORDER BY name").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/boms")
def create_bom():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    db = get_db()
    cur = db.execute(
        "INSERT INTO boms (name, description) VALUES (?, ?)",
        (name, data.get("description")),
    )
    db.commit()
    bid = cur.lastrowid
    row = db.execute("SELECT * FROM boms WHERE id = ?", (bid,)).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.get("/boms/<int:bom_id>")
def get_bom(bom_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM boms WHERE id = ?", (bom_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.put("/boms/<int:bom_id>")
def update_bom(bom_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    if not db.execute("SELECT id FROM boms WHERE id = ?", (bom_id,)).fetchone():
        return jsonify({"error": "not found"}), 404
    fields, values = [], []
    if "name" in data:
        n = (data["name"] or "").strip()
        if not n:
            return jsonify({"error": "name cannot be empty"}), 400
        fields.append("name = ?")
        values.append(n)
    if "description" in data:
        fields.append("description = ?")
        values.append(data.get("description"))
    if not fields:
        row = db.execute("SELECT * FROM boms WHERE id = ?", (bom_id,)).fetchone()
        return jsonify(_row_to_dict(row))
    values.append(bom_id)
    db.execute(f"UPDATE boms SET {', '.join(fields)} WHERE id = ?", values)
    db.commit()
    row = db.execute("SELECT * FROM boms WHERE id = ?", (bom_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/boms/<int:bom_id>")
def delete_bom(bom_id: int):
    db = get_db()
    cur = db.execute("DELETE FROM boms WHERE id = ?", (bom_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


@bp.get("/boms/<int:bom_id>/lines")
def list_bom_lines(bom_id: int):
    db = get_db()
    if not db.execute("SELECT id FROM boms WHERE id = ?", (bom_id,)).fetchone():
        return jsonify({"error": "bom not found"}), 404
    rows = db.execute(
        """
        SELECT bl.id, bl.bom_id, bl.part_id, bl.quantity, bl.uom, bl.notes, bl.sort_order,
               p.name AS part_name, p.part_number AS part_number
        FROM bom_lines bl
        JOIN parts p ON p.id = bl.part_id
        WHERE bl.bom_id = ?
        ORDER BY bl.sort_order, bl.id
        """,
        (bom_id,),
    ).fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/boms/<int:bom_id>/lines")
def add_bom_line(bom_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    if not db.execute("SELECT id FROM boms WHERE id = ?", (bom_id,)).fetchone():
        return jsonify({"error": "bom not found"}), 404
    part_id = data.get("part_id")
    if part_id is None:
        return jsonify({"error": "part_id is required"}), 400
    try:
        qty = float(data.get("quantity", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a number"}), 400
    if qty <= 0:
        return jsonify({"error": "quantity must be positive"}), 400
    uom = (data.get("uom") or "ea").strip() or "ea"
    sort_order = data.get("sort_order", 0)
    try:
        sort_order = int(sort_order)
    except (TypeError, ValueError):
        sort_order = 0
    cur = db.execute(
        """
        INSERT INTO bom_lines (bom_id, part_id, quantity, uom, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (bom_id, part_id, qty, uom, data.get("notes"), sort_order),
    )
    db.commit()
    lid = cur.lastrowid
    row = db.execute(
        """
        SELECT bl.id, bl.bom_id, bl.part_id, bl.quantity, bl.uom, bl.notes, bl.sort_order,
               p.name AS part_name, p.part_number AS part_number
        FROM bom_lines bl
        JOIN parts p ON p.id = bl.part_id
        WHERE bl.id = ?
        """,
        (lid,),
    ).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.put("/bom-lines/<int:line_id>")
def update_bom_line(line_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    existing = db.execute("SELECT * FROM bom_lines WHERE id = ?", (line_id,)).fetchone()
    if not existing:
        return jsonify({"error": "not found"}), 404
    fields, values = [], []
    if "quantity" in data:
        try:
            q = float(data["quantity"])
        except (TypeError, ValueError):
            return jsonify({"error": "quantity must be a number"}), 400
        if q <= 0:
            return jsonify({"error": "quantity must be positive"}), 400
        fields.append("quantity = ?")
        values.append(q)
    if "uom" in data:
        fields.append("uom = ?")
        values.append((data.get("uom") or "ea").strip() or "ea")
    if "notes" in data:
        fields.append("notes = ?")
        values.append(data.get("notes"))
    if "sort_order" in data:
        try:
            fields.append("sort_order = ?")
            values.append(int(data["sort_order"]))
        except (TypeError, ValueError):
            return jsonify({"error": "sort_order must be an integer"}), 400
    if not fields:
        row = db.execute(
            """
            SELECT bl.id, bl.bom_id, bl.part_id, bl.quantity, bl.uom, bl.notes, bl.sort_order,
                   p.name AS part_name, p.part_number AS part_number
            FROM bom_lines bl
            JOIN parts p ON p.id = bl.part_id
            WHERE bl.id = ?
            """,
            (line_id,),
        ).fetchone()
        return jsonify(_row_to_dict(row))
    values.append(line_id)
    db.execute(f"UPDATE bom_lines SET {', '.join(fields)} WHERE id = ?", values)
    db.commit()
    row = db.execute(
        """
        SELECT bl.id, bl.bom_id, bl.part_id, bl.quantity, bl.uom, bl.notes, bl.sort_order,
               p.name AS part_name, p.part_number AS part_number
        FROM bom_lines bl
        JOIN parts p ON p.id = bl.part_id
        WHERE bl.id = ?
        """,
        (line_id,),
    ).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/bom-lines/<int:line_id>")
def delete_bom_line(line_id: int):
    db = get_db()
    cur = db.execute("DELETE FROM bom_lines WHERE id = ?", (line_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


# --- Purchase orders ---


@bp.get("/purchase-orders")
def list_purchase_orders():
    db = get_db()
    rows = db.execute("SELECT * FROM purchase_orders ORDER BY created_at DESC").fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/purchase-orders")
def create_purchase_order():
    data = request.get_json(silent=True) or {}
    po_number = (data.get("po_number") or "").strip()
    if not po_number:
        return jsonify({"error": "po_number is required"}), 400
    db = get_db()
    try:
        cur = db.execute(
            """
            INSERT INTO purchase_orders (po_number, vendor, status, ordered_at, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                po_number,
                data.get("vendor"),
                (data.get("status") or "draft").strip() or "draft",
                data.get("ordered_at"),
                data.get("notes"),
            ),
        )
        db.commit()
    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": "po_number already exists"}), 409
    pid = cur.lastrowid
    row = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (pid,)).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.get("/purchase-orders/<int:po_id>")
def get_purchase_order(po_id: int):
    db = get_db()
    row = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.put("/purchase-orders/<int:po_id>")
def update_purchase_order(po_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    if not db.execute("SELECT id FROM purchase_orders WHERE id = ?", (po_id,)).fetchone():
        return jsonify({"error": "not found"}), 404
    fields, values = [], []
    for key in ("po_number", "vendor", "status", "ordered_at", "notes"):
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    if not fields:
        row = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
        return jsonify(_row_to_dict(row))
    values.append(po_id)
    try:
        db.execute(f"UPDATE purchase_orders SET {', '.join(fields)} WHERE id = ?", values)
        db.commit()
    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": "po_number already exists"}), 409
    row = db.execute("SELECT * FROM purchase_orders WHERE id = ?", (po_id,)).fetchone()
    return jsonify(_row_to_dict(row))


@bp.delete("/purchase-orders/<int:po_id>")
def delete_purchase_order(po_id: int):
    db = get_db()
    cur = db.execute("DELETE FROM purchase_orders WHERE id = ?", (po_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


@bp.get("/purchase-orders/<int:po_id>/lines")
def list_po_lines(po_id: int):
    db = get_db()
    if not db.execute("SELECT id FROM purchase_orders WHERE id = ?", (po_id,)).fetchone():
        return jsonify({"error": "not found"}), 404
    rows = db.execute(
        """
        SELECT pol.id, pol.purchase_order_id, pol.bom_line_id, pol.part_id, pol.quantity,
               pol.uom, pol.unit_price, pol.notes,
               p.name AS part_name, p.part_number AS part_number,
               bl.bom_id AS bom_id
        FROM purchase_order_lines pol
        JOIN parts p ON p.id = pol.part_id
        LEFT JOIN bom_lines bl ON bl.id = pol.bom_line_id
        WHERE pol.purchase_order_id = ?
        ORDER BY pol.id
        """,
        (po_id,),
    ).fetchall()
    return jsonify([_row_to_dict(r) for r in rows])


@bp.post("/purchase-orders/<int:po_id>/lines")
def add_po_line(po_id: int):
    data = request.get_json(silent=True) or {}
    db = get_db()
    if not db.execute("SELECT id FROM purchase_orders WHERE id = ?", (po_id,)).fetchone():
        return jsonify({"error": "purchase order not found"}), 404
    part_id = data.get("part_id")
    if part_id is None:
        return jsonify({"error": "part_id is required"}), 400
    try:
        qty = float(data.get("quantity", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity must be a number"}), 400
    if qty <= 0:
        return jsonify({"error": "quantity must be positive"}), 400
    uom = (data.get("uom") or "ea").strip() or "ea"
    bom_line_id = data.get("bom_line_id")
    if bom_line_id is not None:
        bl = db.execute(
            "SELECT part_id FROM bom_lines WHERE id = ?", (bom_line_id,)
        ).fetchone()
        if not bl:
            return jsonify({"error": "bom_line not found"}), 400
        if int(bl["part_id"]) != int(part_id):
            return jsonify({"error": "part_id must match the BOM line's part"}), 400
    unit_price = data.get("unit_price")
    if unit_price is not None:
        try:
            unit_price = float(unit_price)
        except (TypeError, ValueError):
            return jsonify({"error": "unit_price must be a number"}), 400
    cur = db.execute(
        """
        INSERT INTO purchase_order_lines
            (purchase_order_id, bom_line_id, part_id, quantity, uom, unit_price, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            po_id,
            bom_line_id,
            part_id,
            qty,
            uom,
            unit_price,
            data.get("notes"),
        ),
    )
    db.commit()
    lid = cur.lastrowid
    row = db.execute(
        """
        SELECT pol.id, pol.purchase_order_id, pol.bom_line_id, pol.part_id, pol.quantity,
               pol.uom, pol.unit_price, pol.notes,
               p.name AS part_name, p.part_number AS part_number,
               bl.bom_id AS bom_id
        FROM purchase_order_lines pol
        JOIN parts p ON p.id = pol.part_id
        LEFT JOIN bom_lines bl ON bl.id = pol.bom_line_id
        WHERE pol.id = ?
        """,
        (lid,),
    ).fetchone()
    return jsonify(_row_to_dict(row)), 201


@bp.delete("/purchase-order-lines/<int:line_id>")
def delete_po_line(line_id: int):
    db = get_db()
    cur = db.execute("DELETE FROM purchase_order_lines WHERE id = ?", (line_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


@bp.get("/health")
def health():
    return jsonify({"status": "ok"})
