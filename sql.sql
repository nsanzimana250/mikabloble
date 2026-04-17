-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.mika_brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  logo text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_brands_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mika_cart (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_cart_pkey PRIMARY KEY (id),
  CONSTRAINT mika_cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mika_users(id),
  CONSTRAINT mika_cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mika_products(id)
);
CREATE TABLE public.mika_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mika_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT mika_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.mika_orders(id),
  CONSTRAINT mika_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.mika_products(id)
);
CREATE TABLE public.mika_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  zip text,
  country text DEFAULT 'Rwanda'::text,
  subtotal numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  tax numeric NOT NULL,
  total numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['card'::text, 'momo'::text, 'bank'::text])),
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  order_status text DEFAULT 'processing'::text CHECK (order_status = ANY (ARRAY['processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_orders_pkey PRIMARY KEY (id),
  CONSTRAINT mika_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mika_users(id)
);
CREATE TABLE public.mika_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric,
  review_count integer DEFAULT 0,
  category text,
  category_id uuid,
  brand text,
  brand_id uuid,
  in_stock boolean DEFAULT true,
  low_stock boolean DEFAULT false,
  image text,
  images ARRAY,
  specs jsonb DEFAULT '{}'::jsonb,
  compatibility ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mika_products_pkey PRIMARY KEY (id),
  CONSTRAINT mika_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.mika_categories(id),
  CONSTRAINT mika_products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.mika_brands(id)
);
CREATE TABLE public.mika_users (
  id uuid NOT NULL,
  name text,
  phone text,
  address text,
  country text,
  city text,
  avatar text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'moderator'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  preferred_language text DEFAULT 'en'::text,
  currency text DEFAULT 'RWF'::text,
  CONSTRAINT mika_users_pkey PRIMARY KEY (id),
  CONSTRAINT mika_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);








-- Enable RLS on all tables
ALTER TABLE mika_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON mika_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON mika_users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON mika_users;
DROP POLICY IF EXISTS "Public read access to products" ON mika_products;
DROP POLICY IF EXISTS "Public read access to categories" ON mika_categories;
DROP POLICY IF EXISTS "Public read access to brands" ON mika_brands;
DROP POLICY IF EXISTS "Users can view their own orders" ON mika_orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON mika_order_items;

-- Policies for mika_users table (only authenticated users)
CREATE POLICY "Users can view their own profile" ON mika_users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON mika_users
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM mika_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON mika_users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON mika_users
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM mika_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own profile" ON mika_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policies for public read access (anyone can read products, categories, brands)
CREATE POLICY "Public read access to products" ON mika_products
  FOR SELECT USING (true);

CREATE POLICY "Public read access to categories" ON mika_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access to brands" ON mika_brands
  FOR SELECT USING (true);

-- Policies for orders (users can only see their own orders)
CREATE POLICY "Users can view their own orders" ON mika_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON mika_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for order items (users can only see items from their orders)
CREATE POLICY "Users can view their own order items" ON mika_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mika_orders
      WHERE mika_orders.id = mika_order_items.order_id
      AND mika_orders.user_id = auth.uid()
    )
  );