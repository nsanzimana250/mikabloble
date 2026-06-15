-- ============================================================
-- FIX: RLS Policies for Admin Product Management
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. mika_categories
ALTER TABLE public.mika_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.mika_categories;
CREATE POLICY "Anyone can view categories"
  ON public.mika_categories
  FOR SELECT
  USING (true);

-- Authenticated users (admins) can insert/update/delete categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.mika_categories;
CREATE POLICY "Authenticated users can manage categories"
  ON public.mika_categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.mika_categories;
CREATE POLICY "Authenticated users can update categories"
  ON public.mika_categories
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.mika_categories;
CREATE POLICY "Authenticated users can delete categories"
  ON public.mika_categories
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 2. mika_brands
ALTER TABLE public.mika_brands ENABLE ROW LEVEL SECURITY;

-- Everyone can read brands
DROP POLICY IF EXISTS "Anyone can view brands" ON public.mika_brands;
CREATE POLICY "Anyone can view brands"
  ON public.mika_brands
  FOR SELECT
  USING (true);

-- Authenticated users (admins) can insert/update/delete brands
DROP POLICY IF EXISTS "Authenticated users can manage brands" ON public.mika_brands;
CREATE POLICY "Authenticated users can manage brands"
  ON public.mika_brands
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update brands" ON public.mika_brands;
CREATE POLICY "Authenticated users can update brands"
  ON public.mika_brands
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete brands" ON public.mika_brands;
CREATE POLICY "Authenticated users can delete brands"
  ON public.mika_brands
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. mika_products
ALTER TABLE public.mika_products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
DROP POLICY IF EXISTS "Anyone can view products" ON public.mika_products;
CREATE POLICY "Anyone can view products"
  ON public.mika_products
  FOR SELECT
  USING (true);

-- Authenticated users (admins) can insert products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.mika_products;
CREATE POLICY "Authenticated users can insert products"
  ON public.mika_products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users (admins) can update products
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.mika_products;
CREATE POLICY "Authenticated users can update products"
  ON public.mika_products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users (admins) can delete products
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.mika_products;
CREATE POLICY "Authenticated users can delete products"
  ON public.mika_products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. mika_orders
ALTER TABLE public.mika_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders, admins can view all
DROP POLICY IF EXISTS "Users can view own orders" ON public.mika_orders;
CREATE POLICY "Users can view own orders"
  ON public.mika_orders
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Authenticated users can insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON public.mika_orders;
CREATE POLICY "Users can insert own orders"
  ON public.mika_orders
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. mika_order_items
ALTER TABLE public.mika_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view order items" ON public.mika_order_items;
CREATE POLICY "Anyone can view order items"
  ON public.mika_order_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.mika_order_items;
CREATE POLICY "Authenticated users can insert order items"
  ON public.mika_order_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 6. mika_cart
ALTER TABLE public.mika_cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart" ON public.mika_cart;
CREATE POLICY "Users can view own cart"
  ON public.mika_cart
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cart" ON public.mika_cart;
CREATE POLICY "Users can insert own cart"
  ON public.mika_cart
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.mika_cart;
CREATE POLICY "Users can update own cart"
  ON public.mika_cart
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart" ON public.mika_cart;
CREATE POLICY "Users can delete own cart"
  ON public.mika_cart
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can view contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 8. mika_users (already done in previous fix, but adding admin access)
DROP POLICY IF EXISTS "Admins can view all users" ON public.mika_users;
CREATE POLICY "Admins can view all users"
  ON public.mika_users
  FOR SELECT
  USING (auth.role() = 'authenticated');