-- Migration: Make invitation email nullable and add index for tokens
-- Run this in Supabase SQL Editor

ALTER TABLE invitations ALTER COLUMN email DROP NOT NULL;

-- Ensure tokens are indexed for fast lookup (should already be from unique constraint, but just in case)
-- CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
