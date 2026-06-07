-- ============================================================
-- Create trash table for deleted record backups
-- ============================================================
CREATE TABLE IF NOT EXISTS trash (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   text NOT NULL,
  original_id  uuid NOT NULL,
  data         jsonb NOT NULL,
  deleted_at   timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;

-- Only managers/admins in the relevant org can read trash
CREATE POLICY "Managers can read trash" ON trash
  FOR SELECT USING (is_manager());

-- ============================================================
-- Backup: copy all invitations into trash
-- ============================================================
INSERT INTO trash (table_name, original_id, data)
SELECT
  'invitations',
  id,
  to_jsonb(invitations.*)
FROM invitations;

-- ============================================================
-- Backup: copy all organizations into trash
-- ============================================================
INSERT INTO trash (table_name, original_id, data)
SELECT
  'organizations',
  id,
  to_jsonb(organizations.*)
FROM organizations;

-- ============================================================
-- Cleanup: delete all invitations first (no cascades needed)
-- ============================================================
DELETE FROM invitations;

-- ============================================================
-- Cleanup: delete all organizations
-- Cascades will automatically delete:
--   departments, roles, shifts, swap_requests,
--   analytics_events, feedback, onboarding_progress
-- Profiles will have organization_id set to NULL
-- ============================================================
DELETE FROM organizations;
