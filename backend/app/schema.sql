

-- Entities --

CREATE TABLE IF NOT EXISTS users (
    uid         TEXT PRIMARY KEY,
    username    TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    first_name  TEXT,
    last_name   TEXT,

    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id   TEXT PRIMARY KEY,
    name        TEXT NOT NULL,

    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    created_by  TEXT NOT NULL REFERENCES users(uid),
    updated_by  TEXT REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    purchase_order_id   TEXT PRIMARY KEY,
    purchase_order_no   INTEGER NOT NULL UNIQUE,
    vendor_id           TEXT NOT NULL REFERENCES vendors(vendor_id),
    status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),

    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    created_by          TEXT NOT NULL REFERENCES users(uid),
    updated_by          TEXT REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS boms (
    bom_id      TEXT PRIMARY KEY,
    job_no      INTEGER,
    description TEXT,

    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    created_by  TEXT NOT NULL REFERENCES users(uid),
    updated_by  TEXT REFERENCES users(uid)
);




-- Relationships --

CREATE TABLE IF NOT EXISTS part_vendor (
    part_vendor_id  TEXT PRIMARY KEY,
    part_id         TEXT NOT NULL REFERENCES parts(part_id),
    vendor_id       TEXT NOT NULL REFERENCES vendors(vendor_id),
    name            TEXT,
    part_no         TEXT,
    description     TEXT,
    is_primary      INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),

    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    created_by      TEXT NOT NULL REFERENCES users(uid),
    updated_by      TEXT REFERENCES users(uid),
    UNIQUE(part_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS part_subpart (
    part_subpart_id TEXT PRIMARY KEY,
    part_id         TEXT NOT NULL REFERENCES parts(part_id),
    subpart_id      TEXT NOT NULL REFERENCES parts(part_id),
    quantity        REAL NOT NULL DEFAULT 1,
    uom             TEXT NOT NULL DEFAULT 'each',

    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    created_by      TEXT NOT NULL REFERENCES users(uid),
    updated_by      TEXT REFERENCES users(uid),
    UNIQUE(part_id, subpart_id)
);




-- Junctions --

CREATE TABLE IF NOT EXISTS components (
    component_id        TEXT PRIMARY KEY,
    bom_id              TEXT NOT NULL REFERENCES boms(bom_id),
    part_id             TEXT NOT NULL REFERENCES parts(part_id),
    part_vendor_id      TEXT REFERENCES part_vendor(part_vendor_id),
    purchase_order_id   TEXT REFERENCES purchase_orders(purchase_order_id),
    quantity            REAL NOT NULL DEFAULT 1,
    uom                 TEXT NOT NULL DEFAULT 'each',
    status              TEXT,

    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    created_by          TEXT NOT NULL REFERENCES users(uid),
    updated_by          TEXT REFERENCES users(uid)
);
