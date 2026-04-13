-- ============================================
-- Enable UUID extension (run this once)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Create categories table
-- ============================================
CREATE TABLE mika_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create brands table
-- ============================================
CREATE TABLE mika_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create products table (depends on categories & brands)
-- ============================================
CREATE TABLE mika_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  review_count INTEGER DEFAULT 0,
  category TEXT,
  category_id UUID REFERENCES mika_categories(id) ON DELETE SET NULL,
  brand TEXT,
  brand_id UUID REFERENCES mika_brands(id) ON DELETE SET NULL,
  in_stock BOOLEAN DEFAULT true,
  low_stock BOOLEAN DEFAULT false,
  image TEXT,
  images TEXT[],
  specs JSONB DEFAULT '{}'::jsonb,
  compatibility TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for products
CREATE INDEX idx_mika_products_category ON mika_products(category_id);
CREATE INDEX idx_mika_products_brand ON mika_products(brand_id);
CREATE INDEX idx_mika_products_price ON mika_products(price);

-- ============================================
-- Create update timestamp function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Create users table (depends on auth.users)
-- ============================================
CREATE TABLE mika_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  city TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  preferred_language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'RWF'
);

-- Create indexes for users
CREATE INDEX idx_mika_users_role ON mika_users(role);
CREATE INDEX idx_mika_users_created_at ON mika_users(created_at);
CREATE INDEX idx_mika_users_name ON mika_users(name);

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS update_mika_users_updated_at ON mika_users;
CREATE TRIGGER update_mika_users_updated_at 
  BEFORE UPDATE ON mika_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Create function to auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.mika_users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Enable Row Level Security for users
-- ============================================
ALTER TABLE mika_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON mika_users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON mika_users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own profile" ON mika_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admins can view all users" ON mika_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mika_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can do everything" ON mika_users
  USING (auth.role() = 'service_role');

-- ============================================
-- Create cart table (depends on users & products)
-- ============================================
CREATE TABLE mika_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES mika_users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES mika_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for cart
CREATE INDEX idx_mika_cart_user ON mika_cart(user_id);
CREATE INDEX idx_mika_cart_product ON mika_cart(product_id);

-- Add trigger for cart updated_at
CREATE TRIGGER update_mika_cart_updated_at
  BEFORE UPDATE ON mika_cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for cart
ALTER TABLE mika_cart ENABLE ROW LEVEL SECURITY;

-- Cart RLS policies
CREATE POLICY "Users can view own cart" ON mika_cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON mika_cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON mika_cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart" ON mika_cart
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Enable RLS for products
-- ============================================
ALTER TABLE mika_products ENABLE ROW LEVEL SECURITY;

-- Products can be viewed by everyone
CREATE POLICY "Products are publicly readable" ON mika_products
  FOR SELECT USING (true);

-- Only admins can modify products
CREATE POLICY "Admins can manage products" ON mika_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM mika_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Create orders table (depends on users)
-- ============================================
CREATE TABLE IF NOT EXISTS mika_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES mika_users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT,
  country TEXT DEFAULT 'Rwanda',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'momo', 'bank')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'processing' CHECK (order_status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_mika_orders_user ON mika_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_mika_orders_email ON mika_orders(email);
CREATE INDEX IF NOT EXISTS idx_mika_orders_order_number ON mika_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_mika_orders_created_at ON mika_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_mika_orders_status ON mika_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_mika_orders_payment_status ON mika_orders(payment_status);

-- Orders updated_at trigger
DROP TRIGGER IF EXISTS update_mika_orders_updated_at ON mika_orders;
CREATE TRIGGER update_mika_orders_updated_at
  BEFORE UPDATE ON mika_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Create order items table (depends on orders & products)
-- ============================================
CREATE TABLE IF NOT EXISTS mika_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES mika_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES mika_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_mika_order_items_order ON mika_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_mika_order_items_product ON mika_order_items(product_id);

-- ============================================
-- Function to generate order number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  random_part TEXT;
BEGIN
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  order_num := 'MG-' || random_part;
  
  WHILE EXISTS (SELECT 1 FROM mika_orders WHERE order_number = order_num) LOOP
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    order_num := 'MG-' || random_part;
  END LOOP;
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function to create order (with items)
-- ============================================
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_zip TEXT,
  p_country TEXT,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_subtotal DECIMAL(10,2);
  v_tax DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_item RECORD;
  v_order_number TEXT;
  v_result JSONB;
BEGIN
  v_subtotal := 0;
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, product_name TEXT, quantity INT, price DECIMAL)
  LOOP
    v_subtotal := v_subtotal + (v_item.price * v_item.quantity);
  END LOOP;
  
  v_tax := v_subtotal * 0.18;
  v_total := v_subtotal + v_tax;
  v_order_number := generate_order_number();
  
  INSERT INTO mika_orders (
    order_number, user_id, first_name, last_name, email, phone,
    address, city, zip, country, subtotal, shipping_cost, tax, total,
    payment_method, payment_status, order_status, created_at, updated_at
  ) VALUES (
    v_order_number, p_user_id, p_first_name, p_last_name, p_email, p_phone,
    p_address, p_city, p_zip, p_country, v_subtotal, 0, v_tax, v_total,
    p_payment_method, 'pending', 'processing', NOW(), NOW()
  ) RETURNING id INTO v_order_id;
  
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, product_name TEXT, quantity INT, price DECIMAL)
  LOOP
    INSERT INTO mika_order_items (
      order_id, product_id, product_name, product_price, quantity, total
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_item.product_name,
      v_item.price,
      v_item.quantity,
      v_item.price * v_item.quantity
    );
  END LOOP;
  
  DELETE FROM mika_cart WHERE user_id = p_user_id;
  
  SELECT jsonb_build_object(
    'id', id,
    'order_number', order_number,
    'total', total,
    'created_at', created_at
  ) INTO v_result
  FROM mika_orders
  WHERE id = v_order_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to get user orders with items
-- ============================================
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'date', o.created_at,
      'status', o.order_status,
      'payment_status', o.payment_status,
      'total', o.total,
      'items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.product_price,
            'total', oi.total
          )
        )
        FROM mika_order_items oi
        WHERE oi.order_id = o.id
      )
    )
    ORDER BY o.created_at DESC
  ) INTO v_result
  FROM mika_orders o
  WHERE o.user_id = p_user_id;
  
  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Enable RLS for orders and order items
-- ============================================
ALTER TABLE mika_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mika_order_items ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
DROP POLICY IF EXISTS "Users can view own orders" ON mika_orders;
CREATE POLICY "Users can view own orders" ON mika_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON mika_orders;
CREATE POLICY "Users can create own orders" ON mika_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON mika_orders;
CREATE POLICY "Users can update own orders" ON mika_orders
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON mika_orders;
CREATE POLICY "Admins can view all orders" ON mika_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mika_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all orders" ON mika_orders;
CREATE POLICY "Admins can update all orders" ON mika_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mika_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Order items RLS policies
DROP POLICY IF EXISTS "Users can view own order items" ON mika_order_items;
CREATE POLICY "Users can view own order items" ON mika_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mika_orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own order items" ON mika_order_items;
CREATE POLICY "Users can create own order items" ON mika_order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM mika_orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON mika_order_items;
CREATE POLICY "Admins can view all order items" ON mika_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mika_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Grant permissions
-- ============================================
GRANT ALL ON mika_orders TO authenticated;
GRANT ALL ON mika_order_items TO authenticated;
GRANT EXECUTE ON FUNCTION create_order TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_orders TO authenticated;