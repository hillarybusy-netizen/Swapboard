# Security Notes - Role-Based Access Control

## Role System Overview

The application now has a strict 4-tier role system:

### 1. **Worker** (`worker`)
- Basic shift workers
- Can only view and manage their own shifts
- Cannot manage others or access admin functions

### 2. **Manager** (`manager`)  
- Team/department managers
- Can manage shifts, approve swap requests
- Limited to their assigned departments
- Cannot access organization-wide settings

### 3. **Organization Admin** (`org_admin`)
- Created automatically when a user signs up and creates an organization
- Full control over their organization
- Access dashboard: `/admin` → `/admin/dashboard`
- Can invite managers and workers
- Can manage organization settings and analytics
- Cannot access platform-wide admin functions

### 4. **Super Admin** (`super_admin`)
- Platform-level administrator
- Can view and manage ALL organizations and users
- Can see global analytics and platform metrics
- Access dashboard: `/super-admin` → `/super-admin/dashboard`
- **CRITICAL: Must ONLY be created via:**
  - Manual database insertion
  - Backend seed script
  - Direct SQL
  - **NEVER via signup or normal login**

## Security Mechanisms

### Route Protection
- `/admin` routes enforce `user_role === 'org_admin'` with organization scope check
- `/super-admin` routes enforce `user_role === 'super_admin'` with NO organization scope
- Unauthorized access is redirected to user's normal dashboard

### API Access Control
- `requireOrgAdmin(orgId)` - validates org_admin role and organization membership
- `requireSuperAdmin()` - validates super_admin role only
- `requireManager(orgId)` - validates manager or org_admin role
- All API endpoints validate user's role and organization scope

### Database Level
- Profiles table has CHECK constraint: `user_role IN ('worker', 'manager', 'org_admin', 'super_admin')`
- RLS (Row Level Security) policies enforce organization isolation

## Super Admin Creation

**To create a super admin user:**

```sql
UPDATE profiles 
SET user_role = 'super_admin'
WHERE id = '<user_uuid>';
```

**Or create new super admin account:**

```sql
-- Insert auth user
INSERT INTO auth.users (email, password_hash, email_confirmed_at)
VALUES (...);

-- Insert corresponding profile
INSERT INTO profiles (id, email, user_role, organization_id, ...)
VALUES (
  '<user_id>',
  '<email>',
  'super_admin',  -- Critical: must be 'super_admin', never 'admin'
  NULL  -- Super admins have no organization
);
```

## Migration Notes

The migration `023_update_user_role_types.sql`:
1. Updates the CHECK constraint to allow 'org_admin' and 'super_admin'
2. Migrates existing 'admin' roles to 'org_admin'
3. Documents the role types in column comments

## Verification Checklist

- [ ] No normal signup creates 'super_admin' users
- [ ] Organization admins can only access their organization's data
- [ ] Organization admins cannot redirect to /super-admin
- [ ] Super admin users cannot be created via login/signup
- [ ] All API endpoints validate organization_id match for org_admin users
- [ ] Admin routes properly redirect non-org_admin users
- [ ] Super-admin routes properly redirect non-super_admin users

## Environment Variables

For testing/development:
```bash
# These emails get treated as super_admin admins (fallback)
PLATFORM_ADMIN_EMAILS=admin@swapboard.app,brendan@swapboard.app
```

**WARNING:** This is a fallback for development. In production:
1. These emails should be for legitimate super admins only
2. Prefer using the database role assignment
3. Consider removing this env var for production safety
