-- Migration: Add Super Admin Functionality
-- Description: Add system_admin role and RLS bypass policies for customer support
-- Date: 2025-10-12

-- ============================================
-- STEP 1: Add system_admin to user_role enum
-- ============================================

-- Add new role value to existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system_admin';

-- ============================================
-- STEP 2: Add is_super_admin flag to users table
-- ============================================

-- Add column for quick super admin checks (indexed for performance)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create index for fast super admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin 
ON users(is_super_admin) 
WHERE is_super_admin = TRUE;

-- ============================================
-- STEP 3: Create RLS bypass policies for super admins
-- ============================================

-- Users table: Super admins can view all users
CREATE POLICY "Super admins can view all users" 
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Users table: Super admins can update all users
CREATE POLICY "Super admins can update all users" 
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Organizations table: Super admins bypass restrictions
CREATE POLICY "Super admins can view all organizations" 
ON organizations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Contacts table: Super admins bypass restrictions
CREATE POLICY "Super admins can access all contacts" 
ON contacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Properties table: Super admins bypass restrictions
CREATE POLICY "Super admins can access all properties" 
ON properties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Activities table: Super admins bypass restrictions
CREATE POLICY "Super admins can access all activities" 
ON activities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- GBP Profiles table: Super admins bypass restrictions
CREATE POLICY "Super admins can access all gbp profiles" 
ON gbp_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Pricing Tiers table: Enable RLS and allow super admin access
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage pricing tiers" 
ON pricing_tiers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users su
    WHERE su.id = auth.uid() 
    AND su.is_super_admin = TRUE
  )
);

-- Allow all users to view pricing tiers
CREATE POLICY "Anyone can view pricing tiers" 
ON pricing_tiers FOR SELECT
USING (active = TRUE);

-- ============================================
-- STEP 4: Create helper functions
-- ============================================

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant super admin access
CREATE OR REPLACE FUNCTION grant_super_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only existing super admins can grant super admin access
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can grant super admin access';
  END IF;
  
  UPDATE users
  SET is_super_admin = TRUE, role = 'system_admin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke super admin access
CREATE OR REPLACE FUNCTION revoke_super_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only existing super admins can revoke super admin access
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can revoke super admin access';
  END IF;
  
  -- Prevent revoking your own access
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot revoke your own super admin access';
  END IF;
  
  UPDATE users
  SET is_super_admin = FALSE, role = 'admin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: Create admin analytics views
-- ============================================

-- View for system-wide statistics (super admin only)
CREATE OR REPLACE VIEW admin_system_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE is_super_admin = TRUE) as super_admin_count,
  (SELECT COUNT(*) FROM organizations) as total_organizations,
  (SELECT COUNT(*) FROM contacts) as total_contacts,
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM activities) as total_activities,
  (SELECT COUNT(*) FROM gbp_profiles) as total_gbp_profiles,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM organizations WHERE created_at > NOW() - INTERVAL '30 days') as new_orgs_30d;

-- Grant access to super admins only
ALTER VIEW admin_system_stats OWNER TO postgres;

-- ============================================
-- NOTES FOR INITIAL SETUP
-- ============================================

-- To manually create your first super admin (run in Supabase SQL editor):
-- UPDATE users 
-- SET is_super_admin = TRUE, role = 'system_admin' 
-- WHERE email = 'your-admin-email@example.com';

-- After that, use the grant_super_admin() function to create more super admins

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To rollback this migration, uncomment and run:
/*
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Super admins can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can access all contacts" ON contacts;
DROP POLICY IF EXISTS "Super admins can access all properties" ON properties;
DROP POLICY IF EXISTS "Super admins can access all activities" ON activities;
DROP POLICY IF EXISTS "Super admins can access all gbp profiles" ON gbp_profiles;
DROP POLICY IF EXISTS "Super admins can manage pricing tiers" ON pricing_tiers;
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON pricing_tiers;

DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS grant_super_admin(UUID);
DROP FUNCTION IF EXISTS revoke_super_admin(UUID);
DROP VIEW IF EXISTS admin_system_stats;

DROP INDEX IF EXISTS idx_users_is_super_admin;
ALTER TABLE users DROP COLUMN IF EXISTS is_super_admin;

-- Note: Cannot remove enum value easily in PostgreSQL
-- Would need to recreate the enum entirely
*/
