-- Migration to add department_id to invitations if missing due to pre-existing schema cache
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id) ON DELETE SET NULL;
