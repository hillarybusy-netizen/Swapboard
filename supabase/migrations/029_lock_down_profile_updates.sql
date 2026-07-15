-- Profile fields such as user_role and organization_id are authorization
-- boundaries. Client-side UPDATE access would let users promote themselves or
-- move to another organization. All profile mutations now go through
-- authenticated server actions (or the service role).
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers update any profile in org" ON profiles;

-- These tables are populated by server-side notification jobs, which use the
-- service role and therefore do not need client-accessible write policies.
DROP POLICY IF EXISTS "Service can insert notifications" ON user_notifications;
DROP POLICY IF EXISTS "Service can manage email digests" ON email_digests;
