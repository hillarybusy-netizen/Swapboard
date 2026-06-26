# Deployment Checklist - Role Management System Fix

## Pre-Deployment Verification

### Code Changes
- [x] All TypeScript/TSX files compile without errors
- [x] All role references updated from 'admin' to 'org_admin'
- [x] New 'super_admin' role implemented
- [x] Database migration created and validated

### Security Validation
- [x] org_admin role cannot access /super-admin routes
- [x] super_admin role validation working in layout
- [x] Organization scope checks implemented
- [x] API endpoints validate user organization_id

### Database
- [x] Migration file created: `supabase/migrations/023_update_user_role_types.sql`
- [x] Migration updates CHECK constraint
- [x] Migration migrates existing 'admin' to 'org_admin'
- [x] No data loss on migration

### Routes
 organization admin dashboard
 platform admin dashboard  
- [x] Proper redirects on role mismatch
- [x] Layout protection enforced

## Deployment Steps

### 1. Database Migration
```bash
# Apply migration
supabase migration up

# Or run SQL directly in Supabase console:
# SELECT * FROM supabase/migrations/023_update_user_role_types.sql
```

### 2. Deploy Code
```bash
# Deploy to production
# All files are backward compatible
# Env vars PLATFORM_ADMIN_EMAILS still supported (fallback)
```

### 3. Verify Post-Deployment

#### Test Organization Admin Access
1. Sign up as new user
2. Create organization
3. Verify user has `org_admin` role
4. Verify redirect to `/admin/dashboard`
5. Verify can manage organization
6. Verify cannot access `/super-admin`

#### Test Super Admin (if created)
1. Manually assign `super_admin` role to test user
2. Verify can access `/super-admin/dashboard`
3. Verify can view all organizations
4. Verify can view all users

#### Test Regular User (worker)
1. Sign up as worker (invited to organization)
2. Verify redirect to `/my-shifts`
3. Verify cannot access admin functions

#### Test Manager
1. Create manager account in organization
2. Verify can approve/manage shifts
3. Verify cannot access admin settings
4. Verify can only see their departments

### 4. Create Super Admin Account (if needed)

```sql
-- Option 1: Create from scratch
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role
) VALUES (
  gen_random_uuid(),
  'super-admin@swapboard.app',
  -- Password hash for 'SecurePassword123!' (generate with bcrypt)
  now(),
  now(),
  'authenticated'
);

-- Then update profile:
INSERT INTO profiles (
  id,
  email,
  user_role,
  organization_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  -- Use the user id from insert above
  '<user_id>',
  'super-admin@swapboard.app',
  'super_admin',
  NULL,  -- Super admins have no organization
  true,
  now(),
  now()
);

-- Option 2: Convert existing user to super admin
UPDATE profiles 
SET user_role = 'super_admin'
WHERE email = 'existing@swapboard.app';
```

### 5. Verify User Environment Variables

If using PLATFORM_ADMIN_EMAILS fallback:
```bash
# In production, this should only include legitimate super admins
PLATFORM_ADMIN_EMAILS=admin@swapboard.app,brendan@swapboard.app
```

## Post-Deployment Validation

### Monitor
- [ ] Application starts without errors
- [ ] No TypeScript compilation warnings
- [ ] Database migrations applied successfully
- [ ] Error logs show no role-related issues

### Test All Role Types
- [ ] Worker: Can only see own shifts
- [ ] Manager: Can approve swaps in assigned departments
- [ ] Organization Admin: Can manage own organization
- [ ] Super Admin: Can view all organizations

### Verify Security
- [ ] Organization admins cannot access other org data
- [ ] Organization admins cannot access /super-admin
- [ ] Super admin access requires database modification
- [ ] No privilege escalation possible

### Performance
- [ ] No new query performance issues
- [ ] Admin dashboards load in <2 seconds
- [ ] No database lock timeouts

## Rollback Plan (if needed)

### Immediate Rollback
```bash
# Revert to previous commit
git revert <commit-hash>
git push
```

### Database Rollback
```bash
# Undo migration
supabase migration down

# OR restore from backup if using manual SQL
```

### Data Restoration
- Database migration is reversible
- New roles can be migrated back to 'admin' if needed
- No data deletion occurs in migration

## Known Limitations / Notes

1. **Backward Compatibility**
   - PLATFORM_ADMIN_EMAILS env var still supported
   - Legacy isPlatformAdmin() function aliased
   - No breaking changes for end users

2. **Future Enhancements**
   - Consider removing PLATFORM_ADMIN_EMAILS fallback
   - Add audit logging for role changes
   - Implement role change notifications
   - Add 2FA for super admin accounts

3. **Environment Considerations**
   - Ensure database connections are established before app starts
   - RLS policies are applied on all organization queries
   - Super admin role cannot be granted via signup (by design)

## Success Criteria

- [x] All organization admins are `org_admin` role (not `admin`)
- [x] Organization admins can only manage their organization
- [x] Super admin role exists and is secure
- [x] Super admin role can only be created manually
- [x] No privilege escalation vulnerabilities
- [x] All routes properly protect sensitive data
- [x] Tests pass and app builds successfully

---

**Deployment Status:** READY FOR PRODUCTION 
**Risk Level:** LOW (non-breaking changes)
**Rollback Risk:** LOW (reversible migration)
