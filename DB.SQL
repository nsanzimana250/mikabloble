-- Enable UUID extension (run this once)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE MIKA_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brands table
CREATE TABLE MIKA_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE MIKA_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  review_count INTEGER DEFAULT 0,
  category_id UUID REFERENCES MIKA_categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES MIKA_brands(id) ON DELETE SET NULL,
  in_stock BOOLEAN DEFAULT true,
  low_stock BOOLEAN DEFAULT false,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}'::jsonb,
  compatibility TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mika_products_category ON MIKA_products(category_id);
CREATE INDEX idx_mika_products_brand ON MIKA_products(brand_id);
CREATE INDEX idx_mika_products_price ON MIKA_products(price);


-- Create users table with location
CREATE TABLE MIKA_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'admin', 'vendor'
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_mika_users_email ON MIKA_users(email);

-- Create index for location-based queries
CREATE INDEX idx_mika_users_country ON MIKA_users(country);
CREATE INDEX idx_mika_users_city ON MIKA_users(city);

-- Add trigger for updated_at (if function exists)
CREATE TRIGGER update_mika_users_updated_at
  BEFORE UPDATE ON MIKA_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- Create cart table
CREATE TABLE MIKA_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES MIKA_users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES MIKA_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure a user can't add the same product twice (handle quantity updates instead)
  UNIQUE(user_id, product_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_mika_cart_user ON MIKA_cart(user_id);
CREATE INDEX idx_mika_cart_product ON MIKA_cart(product_id);

-- Add trigger for updated_at
CREATE TRIGGER update_mika_cart_updated_at
  BEFORE UPDATE ON MIKA_cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


  -- Create wishes/wishlist table
CREATE TABLE MIKA_wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES MIKA_users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES MIKA_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure a user can't add the same product twice to wishlist
  UNIQUE(user_id, product_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_mika_wishes_user ON MIKA_wishes(user_id);
CREATE INDEX idx_mika_wishes_product ON MIKA_wishes(product_id);
CREATE INDEX idx_mika_wishes_created ON MIKA_wishes(created_at DESC);


-- Create orders table
CREATE TABLE MIKA_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID REFERENCES MIKA_users(id) ON DELETE SET NULL,
  order_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_method VARCHAR(50), -- card, momo, bank
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table (for items in each order)
CREATE TABLE MIKA_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES MIKA_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES MIKA_products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL, -- Snapshot of product name at time of order
  product_price DECIMAL(10, 2) NOT NULL, -- Snapshot of price at time of order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL, -- product_price * quantity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_addresses table
CREATE TABLE MIKA_shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES MIKA_orders(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Rwanda',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_details table (for storing payment information)
CREATE TABLE MIKA_payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES MIKA_orders(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  -- Card fields (if payment_method = 'card')
  card_last_four VARCHAR(4),
  card_holder_name VARCHAR(255),
  -- Mobile money fields (if payment_method = 'momo')
  momo_number VARCHAR(20),
  -- Bank transfer fields (if payment_method = 'bank')
  bank_reference VARCHAR(255),
  transaction_id VARCHAR(255),
  payment_response JSONB, -- Store full payment gateway response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mika_orders_user ON MIKA_orders(user_id);
CREATE INDEX idx_mika_orders_order_number ON MIKA_orders(order_number);
CREATE INDEX idx_mika_orders_status ON MIKA_orders(order_status);
CREATE INDEX idx_mika_orders_payment_status ON MIKA_orders(payment_status);
CREATE INDEX idx_mika_orders_created ON MIKA_orders(created_at DESC);

CREATE INDEX idx_mika_order_items_order ON MIKA_order_items(order_id);
CREATE INDEX idx_mika_order_items_product ON MIKA_order_items(product_id);

CREATE INDEX idx_mika_shipping_addresses_order ON MIKA_shipping_addresses(order_id);
CREATE INDEX idx_mika_payment_details_order ON MIKA_payment_details(order_id);

-- Add triggers for updated_at
CREATE TRIGGER update_mika_orders_updated_at
  BEFORE UPDATE ON MIKA_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


  -- Create contact_messages table for storing contact form submissions
CREATE TABLE MIKA_contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45), -- Store user IP for security
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mika_contact_messages_status ON MIKA_contact_messages(status);
CREATE INDEX idx_mika_contact_messages_email ON MIKA_contact_messages(email);
CREATE INDEX idx_mika_contact_messages_created ON MIKA_contact_messages(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_mika_contact_messages_updated_at
  BEFORE UPDATE ON MIKA_contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();