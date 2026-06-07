-- Ensure anonymous users can load and accept invitations via the public invite page

GRANT SELECT, UPDATE ON invitations TO anon, authenticated;
GRANT SELECT ON organizations TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can read invitation by token" ON invitations;
CREATE POLICY "Anyone can read invitation by token" ON invitations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read organizations" ON organizations;
CREATE POLICY "Anyone can read organizations" ON organizations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update invitations" ON invitations;
CREATE POLICY "Anyone can update invitations" ON invitations
  FOR UPDATE USING (accepted_at IS NULL);
