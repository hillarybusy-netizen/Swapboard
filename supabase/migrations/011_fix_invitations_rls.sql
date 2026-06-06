-- Fix organizations RLS to allow anonymous users to view organization names for invitations
DROP POLICY IF EXISTS "Anyone can read organizations" ON organizations;
CREATE POLICY "Anyone can read organizations" ON organizations
  FOR SELECT USING (true);

-- Fix invitations RLS to allow invitees to accept invitations
DROP POLICY IF EXISTS "Anyone can update invitations" ON invitations;
CREATE POLICY "Anyone can update invitations" ON invitations
  FOR UPDATE USING (accepted_at IS NULL);
