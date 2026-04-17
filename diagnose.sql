-- =============================================================================
-- DIAGNOSTIC QUERIES FOR RLS / AUTH ISSUE
-- Run these in Supabase SQL Editor to diagnose the issue
-- =============================================================================

-- =============================================================================
-- 1. CHECK ALL RLS POLICIES ON mika_products
-- =============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'mika_products';

-- =============================================================================
-- 2. CHECK IF mika_products HAS ANY DATA
-- =============================================================================
SELECT 
    'Total rows in mika_products' as check_type,
    COUNT(*) as row_count
FROM public.mika_products;

-- Show sample data (first 5 rows)
SELECT id, name, price, category, brand, in_stock
FROM public.mika_products
LIMIT 5;

-- =============================================================================
-- 3. VERIFY auth.users EXISTS AND HAS USERS
-- =============================================================================
SELECT 
    'Total users in auth.users' as check_type,
    COUNT(*) as user_count
FROM auth.users;

-- Show recent users (last 5)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- =============================================================================
-- 4. CHECK mika_users LINKAGE TO auth.users
-- =============================================================================
SELECT 
    'Total rows in public.mika_users' as check_type,
    COUNT(*) as row_count
FROM public.mika_users;

-- Check for orphan records (in mika_users but NOT in auth.users)
SELECT 
    mu.id,
    mu.name,
    mu.role,
    'ORPHAN - no matching auth.users' as status
FROM public.mika_users mu
LEFT JOIN auth.users au ON mu.id = au.id
WHERE au.id IS NULL;

-- Check for users in auth.users but NOT in mika_users
SELECT 
    au.id,
    au.email,
    au.created_at,
    'NO PROFILE - not in mika_users' as status
FROM auth.users au
LEFT JOIN public.mika_users mu ON au.id = mu.id
WHERE mu.id IS NULL;

-- =============================================================================
-- 5. TEST RLS AS DIFFERENT ROLES
-- =============================================================================
-- Test as anon (unauthenticated)
SET ROLE anon;
SELECT id, name, price FROM mika_products LIMIT 3;

-- Test as authenticated (replace 'user-uuid-here' with an actual user UUID from auth.users)
SET ROLE authenticated;
-- Note: This won't work directly in SQL, but we can check policy definitions

-- =============================================================================
-- 6. DISABLE RLS TEMPORARILY TO TEST DATA (FOR DEBUGGING ONLY)
-- =============================================================================
-- Disable RLS on mika_products
ALTER TABLE mika_products DISABLE ROW LEVEL SECURITY;

-- Now test - should return all data if table has data
SELECT 
    'Data with RLS disabled' as test_type,
    COUNT(*) as row_count
FROM public.mika_products;

-- Re-enable RLS (run this after testing!)
ALTER TABLE mika_products ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. CHECK POLICY DEFINITIONS MORE CLEARLY
-- =============================================================================
SELECT 
    'Policy: Public read access to products' as policy_name,
    cmd,
    qual::text,
    with_check::text
FROM pg_policies
WHERE tablename = 'mika_products' AND policyname = 'Public read access to products';

-- =============================================================================
-- 8. QUICK SUMMARY - RUN THESE FIRST
-- =============================================================================
-- This will give you the key information:
SELECT '=== CHECK 1: Row count in mika_products ===' as query;
SELECT COUNT(*) FROM public.mika_products;

SELECT '=== CHECK 2: User count in auth.users ===' as query;
SELECT COUNT(*) FROM auth.users;

SELECT '=== CHECK 3: Profile count in mika_users ===' as query;
SELECT COUNT(*) FROM public.mika_users;

SELECT '=== CHECK 4: Product policies ===' as query;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'mika_products';