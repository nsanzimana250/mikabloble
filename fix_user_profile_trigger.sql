-- 1. Create the trigger function that runs when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mika_users (id, name, role, is_active, preferred_language, currency, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    'user',
    true,
    'en',
    'RWF',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to auth.users (runs AFTER any new user is inserted)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. (Optional) Add RLS policies so users can read/update their own profile
ALTER TABLE public.mika_users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.mika_users;
CREATE POLICY "Users can view own profile"
  ON public.mika_users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.mika_users;
CREATE POLICY "Users can update own profile"
  ON public.mika_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the trigger function (which runs as superuser) to insert
DROP POLICY IF EXISTS "Service role can insert" ON public.mika_users;
CREATE POLICY "Service role can insert"
  ON public.mika_users
  FOR INSERT
  WITH CHECK (true);