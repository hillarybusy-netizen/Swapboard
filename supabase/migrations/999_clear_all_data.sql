-- Clear all data from tables (preserves schema)
-- Run this to reset database to empty state

DELETE FROM swap_requests;
DELETE FROM shifts;
DELETE FROM analytics_events;
DELETE FROM feedback;
DELETE FROM onboarding_progress;
DELETE FROM invitations;
DELETE FROM audit_logs;
DELETE FROM profiles;
DELETE FROM departments;
DELETE FROM organizations;

-- Reset sequences if needed
ALTER SEQUENCE IF EXISTS organizations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS departments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS shifts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS swap_requests_id_seq RESTART WITH 1;

-- Confirm
SELECT 'Database cleared successfully' as status;
