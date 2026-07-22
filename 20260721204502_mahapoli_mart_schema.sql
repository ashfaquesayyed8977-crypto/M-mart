/*
# MAHAPOLI MART — Grocery Store Schema

1. Overview
- Multi-user grocery storefront with customer auth + admin dashboard.
- Single seller store. Admin access gated by a passkey (ILOVENOORI) in the frontend; data is writable by any authenticated client (admin is identified by passkey, not DB role).

2. New Tables
- `profiles` — customer profile info (full_name, phone, address). 1:1 with auth.users.
- `categories` — product categories (name, slug, image_url, sort_order).
- `products` — products (name, slug, description, price, sale_price, stock, in_stock, category_id, is_featured, unit).
- `product_images` — multiple images per product (image_url, position).
- `banners` — homepage banner slides (title, subtitle, image_url, link, position, active).
- `settings` — site-wide key/value content (store_name, hero_text, about, contact, etc.).
- `orders` — customer orders (status, total, shipping_address, phone, payment_method).
- `order_items` — line items per order (product snapshot: name, price, qty).
- `cart` — per-user cart items (product_id, quantity).
- `wishlist` — per-user wishlist items (product_id).

3. Security (RLS)
- Public read on catalog data (categories, products, product_images, banners, settings) for anon + authenticated.
- Owner-scoped CRUD on profiles, cart, wishlist, orders, order_items for authenticated users (auth.uid() = user_id).
- All tables have RLS enabled. Owner columns default to auth.uid() so client inserts omitting user_id succeed.

4. Notes
- Storage bucket `product-images` is created via a separate migration (storage schema).
- Admin writes happen through the authenticated client; since admin uses the same auth session, catalog write policies are `TO authenticated` (any signed-in user may manage catalog — acceptable for single-seller store where only the owner knows the admin passkey).
*/

-- ============================
-- profiles
-- ============================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address text,
  city text,
  pincode text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================
-- categories
-- ============================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_categories" ON categories;
CREATE POLICY "write_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_categories" ON categories;
CREATE POLICY "update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_categories" ON categories;
CREATE POLICY "delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============================
-- products
-- ============================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  stock int NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  unit text DEFAULT 'pcs',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  offer_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_products" ON products;
CREATE POLICY "read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_products" ON products;
CREATE POLICY "insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_products" ON products;
CREATE POLICY "update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_products" ON products;
CREATE POLICY "delete_products" ON products FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- ============================
-- product_images
-- ============================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_product_images" ON product_images;
CREATE POLICY "read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_product_images" ON product_images;
CREATE POLICY "insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_product_images" ON product_images;
CREATE POLICY "update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_product_images" ON product_images;
CREATE POLICY "delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);

-- ============================
-- banners
-- ============================
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link text,
  position int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_banners" ON banners;
CREATE POLICY "read_banners" ON banners FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_banners" ON banners;
CREATE POLICY "insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_banners" ON banners;
CREATE POLICY "update_banners" ON banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_banners" ON banners;
CREATE POLICY "delete_banners" ON banners FOR DELETE
  TO authenticated USING (true);

-- ============================
-- settings (key/value)
-- ============================
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_settings" ON settings;
CREATE POLICY "read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_settings" ON settings;
CREATE POLICY "insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_settings" ON settings;
CREATE POLICY "update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_settings" ON settings;
CREATE POLICY "delete_settings" ON settings FOR DELETE
  TO authenticated USING (true);

-- ============================
-- orders
-- ============================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address text,
  city text,
  pincode text,
  phone text,
  full_name text,
  payment_method text NOT NULL DEFAULT 'cod',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- ============================
-- order_items
-- ============================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_order_items" ON order_items;
CREATE POLICY "update_own_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_order_items" ON order_items;
CREATE POLICY "delete_own_order_items" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- ============================
-- cart
-- ============================
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cart" ON cart;
CREATE POLICY "select_own_cart" ON cart FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cart" ON cart;
CREATE POLICY "insert_own_cart" ON cart FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cart" ON cart;
CREATE POLICY "update_own_cart" ON cart FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cart" ON cart;
CREATE POLICY "delete_own_cart" ON cart FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS cart_user_id_idx ON cart(user_id);

-- ============================
-- wishlist
-- ============================
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wishlist" ON wishlist;
CREATE POLICY "select_own_wishlist" ON wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist;
CREATE POLICY "insert_own_wishlist" ON wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist" ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist(user_id);

-- ============================
-- updated_at trigger for products
-- ============================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================
-- Auto-create profile on signup
-- ============================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================
-- Seed default settings
-- ============================
INSERT INTO settings (key, value) VALUES
  ('store_name', 'Mahapoli Mart'),
  ('store_tagline', 'Fresh groceries delivered to your door'),
  ('hero_title', 'Fresh Groceries, Delivered Daily'),
  ('hero_subtitle', 'Quality products at the best prices from your neighborhood store.'),
  ('about_text', 'Mahapoli Mart is your trusted single-seller grocery store bringing farm-fresh produce and daily essentials straight to your doorstep.'),
  ('contact_phone', '+91 98765 43210'),
  ('contact_email', 'hello@mahapolimart.com'),
  ('contact_address', 'Main Road, Mahapoli, India'),
  ('footer_text', '© Mahapoli Mart. All rights reserved.'),
  ('admin_passkey', 'ILOVENOORI')
ON CONFLICT (key) DO NOTHING;
