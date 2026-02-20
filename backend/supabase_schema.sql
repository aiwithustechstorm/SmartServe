-- ============================================================
-- SmartCanteen — Supabase (PostgreSQL) Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable the uuid-ossp extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(120)  NOT NULL,
    email      VARCHAR(255)  NOT NULL UNIQUE,
    phone      VARCHAR(15)   NOT NULL,
    role       VARCHAR(10)   NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Foods ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(200)  NOT NULL,
    price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    category     VARCHAR(100)  NOT NULL,
    is_available BOOLEAN        NOT NULL DEFAULT TRUE,
    image_url    TEXT,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(20)    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
    total_price NUMERIC(10,2)  NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ── Order Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id  UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_id   UUID           NOT NULL REFERENCES foods(id)  ON DELETE CASCADE,
    quantity  INTEGER        NOT NULL CHECK (quantity > 0),
    price     NUMERIC(10,2)  NOT NULL CHECK (price >= 0)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_foods_category   ON foods(category);

-- ── Row Level Security (optional but recommended) ───────────
-- Enable RLS on all tables (policies can be added per your authz needs)
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (the Flask backend uses the service key)
CREATE POLICY "Service role full access" ON users       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON foods       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON orders      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON order_items FOR ALL USING (true) WITH CHECK (true);
