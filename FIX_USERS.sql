-- ============================================================
-- FIX: "Database error saving new user" on signup
-- FIX: auth.users not matching the dashboard (mika_users)
-- Run this whole script in the Supabase SQL Editor.
-- ============================================================

-- 1. Make the role column accept the values the app uses.
--    (Old constraint only allowed 'customer'/'admin', and the
--     signup trigger was inserting an invalid role -> 500 error.)
ALTER TABLE public.mika_users
  DROP CONSTRAINT IF EXISTS mika_users_role_check;

ALTER TABLE public.mika_users
  ALTER COLUMN role SET DEFAULT 'customer';

ALTER TABLE public.mika_users
  ADD CONSTRAINT mika_users_role_check
  CHECK (role IN ('customer', 'admin'));

-- 2. (Re)create a SAFE trigger that auto-creates a profile row
--    for every new auth user. SECURITY DEFINER + exception guard
--    so signups can never fail because of this trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mika_users (id, name, role, is_active, preferred_language, currency, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User'),
    'customer',
    true,
    'en',
    'RWF',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup if profile creation hits an issue.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill: create profile rows for any existing auth users
--    that are missing from the dashboard (fixes the mismatch).
INSERT INTO public.mika_users (id, name, role, is_active, preferred_language, currency, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User'),
  'customer',
  true,
  'en',
  'RWF',
  now(),
  now()
FROM auth.users u
LEFT JOIN public.mika_users m ON m.id = u.id
WHERE m.id IS NULL;

-- 4. Make sure the Data API can reach the table.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mika_users TO authenticated;
GRANT SELECT ON public.mika_users TO anon;
GRANT ALL ON public.mika_users TO service_role;
