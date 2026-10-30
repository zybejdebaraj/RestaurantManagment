CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('admin', 'owner', 'staff', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  image TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100) NOT NULL DEFAULT 'Main Course',
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, user_id)
);
CREATE INDEX IF NOT EXISTS restaurants_owner_idx ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS menus_restaurant_idx ON menus(restaurant_id);

CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity BETWEEN 1 AND 500),
  UNIQUE (restaurant_id, name)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_name VARCHAR(50),
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  notes TEXT NOT NULL DEFAULT '',
  total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99)
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_active_table_idx ON orders(table_id)
  WHERE table_id IS NOT NULL AND status NOT IN ('completed', 'cancelled');
CREATE INDEX IF NOT EXISTS orders_restaurant_idx ON orders(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
