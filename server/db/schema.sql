-- CoreInventory PostgreSQL Schema
-- Run this script to initialize your database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  login_id VARCHAR(12) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  uom VARCHAR(20) NOT NULL DEFAULT 'Units',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WAREHOUSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT
);

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (type IN ('internal', 'view', 'supplier', 'customer', 'inventory'))
);

-- ============================================
-- STOCK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, location_id)
);

-- ============================================
-- OPERATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('receipt', 'delivery', 'internal', 'adjustment')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  source_location_id UUID REFERENCES locations(id),
  dest_location_id UUID REFERENCES locations(id),
  contact VARCHAR(100),
  scheduled_date DATE,
  responsible_uid UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- OPERATION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS operation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- MOVE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS move_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  quantity INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_location ON stock(location_id);
CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(type);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operation_items_operation ON operation_items(operation_id);
CREATE INDEX IF NOT EXISTS idx_move_history_timestamp ON move_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
