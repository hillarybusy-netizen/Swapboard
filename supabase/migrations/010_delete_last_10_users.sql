-- ============================================================
-- Backup last 10 registered profiles into trash
-- ============================================================
INSERT INTO trash (table_name, original_id, data)
SELECT
  'profiles',
  id,
  to_jsonb(profiles.*)
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- Delete auth accounts for those users
-- This cascades to: profiles (on delete cascade)
-- ============================================================
DELETE FROM auth.users
WHERE id IN (
  SELECT id
  FROM profiles
  ORDER BY created_at DESC
  LIMIT 10
);
