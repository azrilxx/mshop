
-- Fix RLS Security Issues for MSHOP B2B Marketplace
-- This script addresses all security audit findings

-- =============================================================================
-- ERROR 1: Table `public.ads` has RLS policies but RLS is not enabled
-- =============================================================================
-- Root Cause: RLS policies exist but table-level RLS is disabled
-- Fix: Enable RLS on ads table
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ERROR 2: Table `public.ratings` has RLS policies but RLS is not enabled  
-- =============================================================================
-- Root Cause: RLS policies exist but table-level RLS is disabled
-- Fix: Enable RLS on ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ERROR 3: Table `public.storefronts` has RLS policies but RLS is not enabled
-- =============================================================================
-- Root Cause: RLS policies exist but table-level RLS is disabled
-- Fix: Enable RLS on storefronts table
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ERROR 4: Table `public.ratings` is public, but RLS has not been enabled
-- =============================================================================
-- Root Cause: Same as ERROR 2 - RLS not enabled despite public access
-- Fix: Already addressed above with ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ERROR 5: Table `public.storefronts` is public, but RLS has not been enabled
-- =============================================================================
-- Root Cause: Same as ERROR 3 - RLS not enabled despite public access  
-- Fix: Already addressed above with ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ADDITIONAL SECURITY HARDENING
-- =============================================================================

-- Ensure all critical tables have RLS enabled (idempotent operations)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VERIFY RLS POLICIES ARE CORRECT FOR MULTI-TENANT SECURITY
-- =============================================================================

-- Drop potentially problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Public profiles for active users" ON public.profiles;

-- Recreate safe profile viewing policy
CREATE POLICY "Public profiles for active users" ON public.profiles
  FOR SELECT USING (status = 'active' AND role IN ('seller', 'buyer'));

-- =============================================================================
-- TEST QUERIES TO VERIFY FIXES
-- =============================================================================

-- Test 1: Verify RLS is enabled on all tables
-- Expected: All should return 't' (true)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'products', 'orders', 'ads', 'ratings', 'storefronts', 'subscriptions');

-- Test 2: Verify policies exist and are properly configured
-- Expected: Should return policy names without errors
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Test 3: Test tenant isolation works correctly
-- Expected: Should only return data for authenticated user's tenant
-- (This would be run with actual user authentication in application)

-- =============================================================================
-- RATIONALE FOR EACH FIX
-- =============================================================================

/*
ERROR 1-3 & 4-5 RATIONALE:
- Tables had RLS policies defined in schema but RLS was not enabled at table level
- Without table-level RLS enabled, policies are ignored and all data is accessible
- Enabling RLS ensures policies are enforced for data access control
- Critical for multi-tenant B2B marketplace where data isolation is essential

SECURITY BENEFITS:
- Prevents cross-tenant data leakage
- Enforces seller/buyer/admin role separation  
- Protects sensitive business data (ads, ratings, storefronts)
- Maintains data privacy compliance

POST-FIX VERIFICATION:
- RLS enabled status can be verified via pg_tables system view
- Policy enforcement can be tested with role-based queries
- Application should maintain proper user context for policy evaluation
*/
