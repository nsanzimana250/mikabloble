# Supabase RLS Debugging Checklist: Data Blocking After Login

## PHASE 1: Supabase Dashboard - Policy Verification

### 1.1 Verify RLS is Enabled
**Location:** Supabase Dashboard > Table Editor > mika_products > Policies

**What to look for:**
- Green checkmark next to "Row Level Security"
- If you see "Enable RLS" button, RLS is NOT enabled

**SQL Command:**
```sql
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'mika_products';
-- Should return: relrowsecurity = true
```

### 1.2 Check All Policies on mika_products
**Location:** Supabase Dashboard > Table Editor > mika_products > Policies

**You should see policies like:**
- [ ] "Public read access to products" (SELECT)
- [ ] Possibly other policies for INSERT/UPDATE/DELETE

**SQL Command (run in SQL Editor):**
```sql
SELECT 
    policyname,
    cmd,
    roles,
    qual::text,
    with_check::text
FROM pg_policies
WHERE tablename = 'mika_products';
```

### 1.3 Verify Policy is Active (Not Just Written)
**Common Issue:** Policy exists but is misconfigured

**Check the policy definition:**
```sql
-- Look for these red flags:
-- 1. Missing TO clause
-- 2. USING expression returning wrong value
-- 3. WITH CHECK that blocks everything

-- Check if policy is actually being evaluated:
SELECT 
    policyname,
    enabled,
    force_rowsecurity,
    count(1) as policy_count
FROM pg_policies
WHERE tablename = 'mika_products'
AND enabled = true;
```

---

## PHASE 2: Supabase Dashboard - Data & Auth Verification

### 2.1 Check if Data Exists
**SQL Command:**
```sql
SELECT COUNT(*) as product_count FROM mika_products;
-- If 0: Table is empty (not an RLS issue!)

-- Show sample data:
SELECT id, name, price FROM mika_products LIMIT 5;
```

### 2.2 Test Query as Different Roles in Table Editor

**Step 1:** Go to Table Editor > mika_products

**Step 2:** Click "RLS" toggle to see what role you're testing as:
- **Testing as ANON:** Should work (public read policy)
- **Testing as AUTHENTICATED:** This is where issues occur

**Step 3:** Run this in SQL Editor to test both:
```sql
-- Test as anon role
SET ROLE anon;
SELECT id, name FROM mika_products LIMIT 3;

-- Test as authenticated role  
SET ROLE authenticated;
SELECT id, name FROM mika_products LIMIT 3;

-- Reset
RESET ROLE;
```

### 2.3 Verify auth.users and mika_users Linkage
**SQL Command:**
```sql
-- Check counts match
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM mika_users) as mika_users_count;

-- Check for orphans (in auth but no profile)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN mika_users mu ON au.id = mu.id
WHERE mu.id IS NULL;

-- Check specific user ID match
-- Replace 'USER_ID_HERE' with actual logged-in user's ID
SELECT mu.*
FROM mika_users mu
WHERE mu.id = 'USER_ID_HERE';
```

---

## PHASE 3: Browser DevTools - Session Verification

### 3.1 Check Console for Session Info
**Location:** Browser > DevTools > Console

**What to search for:**
```
[Auth] State changed: SIGNED_IN
[Auth] Session check:
[Products] Session check:
```

**Expected output when logged in:**
```javascript
[Auth] State changed: SIGNED_IN { 
  hasSession: true, 
  userId: "actual-user-uuid" 
}
```

### 3.2 Check for Auth Errors in Console
**Search console for:**
- "Session error"
- "Auth state"
- "PGRST" (PostgREST errors)
- "RLS"

**Red flags:**
```
[Products] Products fetch error: { 
  code: "PGRST116", 
  message: "could not find...",
  details: "...",
  hint: "..." 
}
```

### 3.3 Check Application Tab for Supabase Token
**Location:** Browser > DevTools > Application > Local Storage

**Look for:**
| Key | Value |
|-----|-------|
| `sb-[project-ref]-auth-token` | Should exist and contain JWT |
| `sb-[project-ref]-refresh-token` | Should exist |

**Check Storage tab:** Click the URL > storage > local storage

### 3.4 Check Network Tab for Query Response
**Location:** Browser > DevTools > Network

**What to do:**
1. Open Network tab
2. Filter: Fetch/XHR
3. Reload the products page
4. Look for the mika_products request
5. Click it and check:
   - **Response tab:** Should show data or empty array
   - **Timing tab:** Should complete, not pending

---

## PHASE 4: React Component - Cache & Query Verification

### 4.1 Check if Using Cached/Stale Data
**Add this logging to your component:**

```typescript
// In the useEffect that fetches:
console.log("[Debug] Fetch triggered, authReady:", authReady);
console.log("[Debug] Session:", session?.user?.id);

// After fetch:
console.log("[Debug] Raw response:", productsData);
console.log("[Debug] Products length:", productsData?.length);
```

### 4.2 Force Refresh (Clear React Query Cache)
If using React Query:
```typescript
// Add to component
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// In error handler or retry button:
queryClient.invalidateQueries(['products']);
```

### 4.3 Add Browser Network Log
**Add before the supabase call:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log("[Debug] Session state:", {
  expiresAt: session?.expires_at,
  expiresIn: session?.expires_in,
  token: session?.access_token?.substring(0, 20) + "...",
});
```

---

## PHASE 5: Quick Diagnostic SQL (Run All at Once)

Copy and paste this entire block into SQL Editor:

```sql
-- === DIAGNOSTIC 1: Check RLS enabled ===
SELECT 'DIAGNOSTIC 1: RLS Status' as check_name;
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'mika_products';

-- === DIAGNOSTIC 2: List all policies ===
SELECT 'DIAGNOSTIC 2: All Policies' as check_name;
SELECT policyname, cmd, roles, enabled FROM pg_policies WHERE tablename = 'mika_products';

-- === DIAGNOSTIC 3: Check data exists ===
SELECT 'DIAGNOSTIC 3: Product Count' as check_name;
SELECT COUNT(*) as row_count FROM mika_products;

-- === DIAGNOSTIC 4: Check user counts ===
SELECT 'DIAGNOSTIC 4: User Counts' as check_name;
SELECT 
    (SELECT COUNT(*) FROM auth.users) as auth_count,
    (SELECT COUNT(*) FROM mika_users) as profile_count;

-- === DIAGNOSTIC 5: Test without RLS (temporarily) ===
SELECT 'DIAGNOSTIC 5: No-RLS Test' as check_name;
ALTER TABLE mika_products DISABLE ROW LEVEL SECURITY;
SELECT COUNT(*) as rows_without_rls FROM mika_products;
ALTER TABLE mika_products ENABLE ROW LEVEL SECURITY;

-- === DIAGNOSTIC 6: Policy definitions ===
SELECT 'DIAGNOSTIC 6: Policy Details' as check_name;
SELECT 
    policyname,
    cmd,
    qual::text,
    with_check::text
FROM pg_policies
WHERE tablename = 'mika_products'
AND cmd = 'SELECT';
```

---

## EXPECTED RESULTS TABLE

| Check | Expected | Fix if Wrong |
|-------|----------|-------------|
| RLS Enabled | true | Enable in dashboard |
| Policies exist | ≥1 SELECT policy | Add policy |
| Policy has TO clause | "anon, authenticated" | Recreate policy |
| Product count | >0 | Insert data |
| Auth count | ≥1 (if logged in) | Check login |
| Profile count | = Auth count | Fix linkage |
| Table Editor test (anon) | Returns data | Check policy |
| Table Editor test (auth) | Returns data | Fix policy |

---

## MOST LIKELY FIXES

### Fix 1: Policy needs explicit role
```sql
DROP POLICY IF EXISTS "Public read access to products" ON mika_products;
CREATE POLICY "Public read access to products" ON mika_products
  FOR SELECT TO anon, authenticated USING (true);
```

### Fix 2: No data in table
```sql
INSERT INTO mika_products (name, price, description) 
VALUES ('Test Product', 10000, 'Test description');
```

### Fix 3: User profile not linked
```sql
-- Check IDs match
SELECT mu.id, au.id 
FROM mika_users mu 
JOIN auth.users au ON mu.id = au.id;
```