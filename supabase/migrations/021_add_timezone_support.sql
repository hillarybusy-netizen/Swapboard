-- Add timezone column to profiles table
ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'UTC' NOT NULL;

-- Create an index on timezone for faster queries
CREATE INDEX idx_profiles_timezone ON profiles(timezone);
