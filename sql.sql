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
  role text DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  preferred_language text DEFAULT 'en'::text,
  currency text DEFAULT 'RWF'::text,
  CONSTRAINT mika_users_pkey PRIMARY KEY (id),
  CONSTRAINT mika_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);