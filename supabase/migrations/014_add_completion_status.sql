ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check check (status in ('scheduled', 'open', 'swap_pending', 'swapped', 'cancelled', 'pending_completion', 'completed'));
