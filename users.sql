-- Create the mika_users table linked to Supabase Auth
CREATE TABLE mika_users (
  -- This MUST match the auth.users id
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User profile information (matches your Profile component)
  name TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  city TEXT,
  avatar TEXT,
  
  -- Role and permissions
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  
  -- Timestamps (matches your Profile component)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Additional useful fields
  is_active BOOLEAN DEFAULT true,
  preferred_language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'RWF'
);

-- Create indexes for better performance
CREATE INDEX idx_mika_users_role ON mika_users(role);
CREATE INDEX idx_mika_users_created_at ON mika_users(created_at);
CREATE INDEX idx_mika_users_name ON mika_users(name);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_mika_users_updated_at ON mika_users;
CREATE TRIGGER update_mika_users_updated_at 
  BEFORE UPDATE ON mika_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-create user profile on signup
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

-- Enable Row Level Security
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

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can do everything" ON mika_users
  USING (auth.role() = 'service_role');