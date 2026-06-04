-- Drop the check constraint permanently to avoid column position/type check mismatch
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
