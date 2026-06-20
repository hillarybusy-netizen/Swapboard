-- Add timezone column to profiles table
ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'UTC' NOT NULL;

-- Create an index on timezone for faster queries
CREATE INDEX idx_profiles_timezone ON profiles(timezone);

-- Add a constraint to validate timezone format
ALTER TABLE profiles ADD CONSTRAINT valid_timezone CHECK (timezone ~ '^[A-Za-z_]+(/[A-Za-z_]+)?$|^UTC([+-][0-9]{1,2})?$');
