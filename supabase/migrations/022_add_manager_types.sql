-- 022_add_manager_types.sql
-- Add manager_type field and convert department_ids to single department_id for managers

-- Add manager_type enum type
CREATE TYPE manager_type_enum AS ENUM ('general', 'department');

-- Add manager_type column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_type manager_type_enum;

-- Migrate existing managers to 'general' type
UPDATE profiles
SET manager_type = 'general'::manager_type_enum
WHERE user_role = 'manager' AND manager_type IS NULL;

-- For any future non-manager rows, set a default (though this shouldn't apply)
ALTER TABLE profiles
ALTER COLUMN manager_type SET DEFAULT 'general'::manager_type_enum;

-- Now we need to handle the transition from department_ids to department_id
-- For managers, we'll set department_id based on whether they had department_ids
-- For workers, department_id already exists
-- Managers with empty department_ids stay NULL (general managers)
-- Managers with non-empty department_ids take the first one (legacy single department behavior)

UPDATE profiles
SET department_id = (department_ids)[1]
WHERE user_role = 'manager'
  AND department_ids IS NOT NULL
  AND array_length(department_ids, 1) > 0
  AND manager_type = 'general'::manager_type_enum;

-- Drop department_ids column (only after verifying the data migration above worked)
-- We'll keep it for now as a safety measure, but comment it out for the actual run
-- ALTER TABLE profiles DROP COLUMN IF EXISTS department_ids;

-- Create index for faster manager queries by type
CREATE INDEX IF NOT EXISTS idx_profiles_manager_type
ON profiles(organization_id, manager_type)
WHERE user_role = 'manager';

-- Create index for finding managers by department
CREATE INDEX IF NOT EXISTS idx_profiles_manager_department
ON profiles(department_id)
WHERE user_role = 'manager' AND manager_type = 'department'::manager_type_enum;

-- Add manager_type column to invitations table
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS manager_type manager_type_enum DEFAULT 'general'::manager_type_enum;

-- Create index for faster invitation lookups by manager type
CREATE INDEX IF NOT EXISTS idx_invitations_manager_type
ON invitations(organization_id, manager_type)
WHERE user_role = 'manager';
