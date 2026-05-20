-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS parts;
-- DROP TABLE IF EXISTS vendors;
-- DROP TABLE IF EXISTS purchase_orders;
-- DROP TABLE IF EXISTS boms;
-- DROP TABLE IF EXISTS vendor_parts;
-- DROP TABLE IF EXISTS assembly_parts;
-- DROP TABLE IF EXISTS components;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Users, Workspaces, Permissions --

CREATE TABLE IF NOT EXISTS users (
    uid             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    first_name      TEXT,
    last_name       TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users (uid, username, email, password_hash, first_name, last_name)
    VALUES ('00000000-0000-0000-0000-000000000000', 'admin', 'admin@gmail.com', 'password', 'John', 'Doe');

CREATE TABLE workspaces (
    workspace_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_name      TEXT NOT NULL UNIQUE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL REFERENCES users(uid),
    updated_by          UUID NOT NULL REFERENCES users(uid)
);

CREATE TABLE workspace_users (
    workspace_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
    uid                 UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, uid)
);


CREATE TABLE permissions (
    permission_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid                 UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    workspace_id        UUID NOT NULL REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
    entity              TEXT NOT NULL,
    action              TEXT NOT NULL,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL REFERENCES users(uid),
    UNIQUE(uid, workspace_id, entity, action)
);


--- Entities ---

CREATE TYPE part_type AS ENUM ('part', 'assembly');
CREATE TABLE IF NOT EXISTS parts (
    part_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_no         TEXT NOT NULL UNIQUE,
    description     TEXT,
    is_assembly     part_type NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL REFERENCES users(uid),
    updated_by      UUID NOT NULL REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name     TEXT NOT NULL UNIQUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL REFERENCES users(uid),
    updated_by      UUID NOT NULL REFERENCES users(uid),

    archived_at     TIMESTAMPTZ
);

CREATE TYPE po_status AS ENUM ('draft', 'sent', 'received', 'cancelled');
CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_no           TEXT NOT NULL UNIQUE,
    vendor_id       UUID NOT NULL REFERENCES vendors(vendor_id),
    status          po_status NOT NULL DEFAULT 'draft',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL REFERENCES users(uid),
    updated_by      UUID NOT NULL REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS boms (
    bom_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    job_no      TEXT UNIQUE,
    description TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID NOT NULL REFERENCES users(uid),
    updated_by  UUID NOT NULL REFERENCES users(uid)
);




-- Relationships --

CREATE TABLE IF NOT EXISTS vendor_parts (
    vendor_part_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id             UUID NOT NULL REFERENCES parts(part_id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    part_no             TEXT,
    description         TEXT,
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL REFERENCES users(uid),
    updated_by          UUID NOT NULL REFERENCES users(uid),
    UNIQUE(part_id, vendor_id)
);
CREATE UNIQUE INDEX idx_one_primary_per_part ON vendor_parts(part_id) WHERE is_primary = TRUE;


CREATE TABLE IF NOT EXISTS assembly_parts (
    assembly_part_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id             UUID NOT NULL REFERENCES parts(part_id) ON DELETE CASCADE,
    subpart_id          UUID NOT NULL REFERENCES parts(part_id) ON DELETE CASCADE,
    quantity            REAL NOT NULL DEFAULT 1,
    uom                 TEXT NOT NULL DEFAULT 'each',

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL REFERENCES users(uid),
    updated_by          UUID NOT NULL REFERENCES users(uid),
    UNIQUE(part_id, subpart_id),
    CHECK (subpart_id != part_id)
);




-- Junctions --

CREATE TABLE IF NOT EXISTS components (
    component_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bom_id              UUID NOT NULL REFERENCES boms(bom_id) ON DELETE CASCADE,
    part_id             UUID NOT NULL REFERENCES parts(part_id) ON DELETE CASCADE,
    po_id               UUID REFERENCES purchase_orders(po_id) ON DELETE SET NULL,
    quantity            REAL NOT NULL DEFAULT 1,
    uom                 TEXT NOT NULL DEFAULT 'each',
    status              TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL REFERENCES users(uid),
    updated_by          UUID NOT NULL REFERENCES users(uid)
);


