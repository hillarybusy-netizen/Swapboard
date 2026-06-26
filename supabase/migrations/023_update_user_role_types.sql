-- Update user_role type to support org_admin and super_admin
-- This migration changes the role structure:
-- - 'admin' → 'org_admin' (organization-level admin)
-- - NEW 'super_admin' (platform-level admin)

-- 1. Update check constraint on profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_role_check 
  CHECK (user_role IN ('worker', 'manager', 'org_admin', 'super_admin'));

-- 2. Migrate existing 'admin' roles to 'org_admin'
UPDATE profiles SET user_role = 'org_admin' WHERE user_role = 'admin';

-- 3. Add comment documenting the change
COMMENT ON COLUMN profiles.user_role IS 'User role within the system:
- worker: Basic shift worker
- manager: Team/department manager
- org_admin: Organization administrator (created on org signup)
- super_admin: Platform administrator (manually created only)';
