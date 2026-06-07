-- Security fixes: revert broad anon access, tighten cross-tenant RLS, scope storage

-- Revert overly permissive policies from old 012 migration
REVOKE ALL ON invitations FROM anon;
REVOKE ALL ON organizations FROM anon;

DROP POLICY IF EXISTS "Anyone can read invitation by token" ON invitations;
DROP POLICY IF EXISTS "Anyone can read organizations" ON organizations;
DROP POLICY IF EXISTS "Anyone can update invitations" ON invitations;

-- Remove cross-tenant read policies (invite flow uses service role server-side)
DROP POLICY IF EXISTS "Authenticated users can read all organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can read all departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can read all roles" ON roles;

-- Tighten profiles insert policy
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Scope logo storage to org-owned paths: {org_id}/filename
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;

CREATE POLICY "Managers upload own org logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers update own org logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers delete own org logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text FROM profiles WHERE id = auth.uid()
    )
  );
