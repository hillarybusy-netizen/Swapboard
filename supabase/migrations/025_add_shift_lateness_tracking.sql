-- Preserve lateness independently from the shift workflow status.
ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS late_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS late_submitted_at timestamptz;

COMMENT ON COLUMN shifts.late_started_at IS 'Set when the worker starts more than five minutes after the scheduled start.';
COMMENT ON COLUMN shifts.late_submitted_at IS 'Set when the worker submits completion more than five minutes after the scheduled end.';
