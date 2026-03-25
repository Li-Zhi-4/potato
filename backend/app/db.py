import sqlite3
from pathlib import Path
from flask import g, current_app


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_e=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    db = sqlite3.connect(current_app.config["DATABASE"])
    db.executescript(SCHEMA)
    db.commit()
    db.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    part_number TEXT UNIQUE,
    is_assembly INTEGER NOT NULL DEFAULT 0 CHECK (is_assembly IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assembly_children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    child_part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    quantity REAL NOT NULL CHECK (quantity > 0),
    uom TEXT NOT NULL DEFAULT 'ea',
    UNIQUE (parent_part_id, child_part_id)
);

CREATE TABLE IF NOT EXISTS boms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bom_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bom_id INTEGER NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
    quantity REAL NOT NULL CHECK (quantity > 0),
    uom TEXT NOT NULL DEFAULT 'ea',
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT NOT NULL UNIQUE,
    vendor TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    ordered_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    bom_line_id INTEGER REFERENCES bom_lines(id) ON DELETE SET NULL,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
    quantity REAL NOT NULL CHECK (quantity > 0),
    uom TEXT NOT NULL DEFAULT 'ea',
    unit_price REAL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_assembly_children_parent ON assembly_children(parent_part_id);
CREATE INDEX IF NOT EXISTS idx_bom_lines_bom ON bom_lines(bom_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_po ON purchase_order_lines(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_bom_line ON purchase_order_lines(bom_line_id);
"""
