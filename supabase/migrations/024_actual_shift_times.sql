-- 024_actual_shift_times.sql
-- Add actual start and end times to shifts table to track exact clock in/out times

ALTER TABLE shifts ADD COLUMN IF NOT EXISTS actual_start_time timestamptz;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS actual_end_time timestamptz;
