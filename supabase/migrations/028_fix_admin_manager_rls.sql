-- 028_fix_admin_manager_rls.sql
-- Fix database helper function is_manager() and update RLS policies to refer to org_admin instead of admin

-- 1. Redefine is_manager() to include 'org_admin' and 'super_admin' roles
CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT COALESCE(
    (SELECT user_role IN ('manager', 'org_admin', 'super_admin') FROM profiles WHERE id = auth.uid()),
    false
  )
$$;

-- 2. Update audit_logs select policy for organization admins
DROP POLICY IF EXISTS "Admin can read all org audit logs" ON audit_logs;
CREATE POLICY "Admin can read all org audit logs" 
  ON audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = audit_logs.organization_id 
      AND profiles.user_role = 'org_admin'
    )
  );

-- 3. Update user_notifications select policy for organization admins
DROP POLICY IF EXISTS "Users can read own notifications" ON user_notifications;
CREATE POLICY "Users can read own notifications" ON user_notifications
  FOR SELECT USING (user_id = auth.uid() OR (SELECT user_role FROM profiles WHERE id = auth.uid()) = 'org_admin');

-- 4. Update email_digests select policy for organization admins
DROP POLICY IF EXISTS "Admins can read email digests" ON email_digests;
CREATE POLICY "Admins can read email digests" ON email_digests
  FOR SELECT USING ((SELECT user_role FROM profiles WHERE id = auth.uid()) = 'org_admin');
