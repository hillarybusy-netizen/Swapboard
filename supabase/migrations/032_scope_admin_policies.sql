-- Keep organization administrators within their own tenant, and ensure only
-- organization administrators can alter organization-owned configuration.
DROP POLICY IF EXISTS "Users can read own notifications" ON user_notifications;
CREATE POLICY "Users can read own notifications" ON user_notifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.user_role = 'org_admin'
        AND profiles.organization_id = user_notifications.organization_id
    )
  );

DROP POLICY IF EXISTS "Admins can read email digests" ON email_digests;
CREATE POLICY "Admins can read email digests" ON email_digests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.user_role = 'org_admin'
        AND profiles.organization_id = email_digests.organization_id
    )
  );

DROP POLICY IF EXISTS "Admins can update own org" ON organizations;
CREATE POLICY "Admins can update own org" ON organizations
  FOR UPDATE USING (
    id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  ) WITH CHECK (
    id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );

DROP POLICY IF EXISTS "Managers manage depts" ON departments;
CREATE POLICY "Admins manage depts" ON departments
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  ) WITH CHECK (
    organization_id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );

DROP POLICY IF EXISTS "Managers manage roles" ON roles;
CREATE POLICY "Admins manage roles" ON roles
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  ) WITH CHECK (
    organization_id = get_user_org_id()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );

-- Provisioning is handled by authenticated server actions using the service
-- role. These legacy client insert policies bypassed organization ownership.
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can create roles" ON roles;

-- Storage policies previously verified only the folder's organization, which
-- allowed any worker in the organization to overwrite or delete the logo.
DROP POLICY IF EXISTS "Managers upload own org logos" ON storage.objects;
DROP POLICY IF EXISTS "Managers update own org logos" ON storage.objects;
DROP POLICY IF EXISTS "Managers delete own org logos" ON storage.objects;

CREATE POLICY "Admins upload own org logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );

CREATE POLICY "Admins update own org logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  ) WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );

CREATE POLICY "Admins delete own org logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'org_admin')
  );
