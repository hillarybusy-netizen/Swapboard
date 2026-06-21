ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;

-- Update any invalid status values to 'open'
UPDATE shifts SET status = 'open'
WHERE status NOT IN ('scheduled', 'open', 'swap_pending', 'swapped', 'cancelled', 'pending_completion', 'completed', 'not_started', 'started', 'up_for_swap', 'pending_approval_claim', 'pending_approval_swap', 'overdue_not_done', 'done_pending_approval', 'done_manager_approved', 'done_rejected', 'no_show');

ALTER TABLE shifts ADD CONSTRAINT shifts_status_check check (status in ('scheduled', 'open', 'swap_pending', 'swapped', 'cancelled', 'pending_completion', 'completed', 'not_started', 'started', 'up_for_swap', 'pending_approval_claim', 'pending_approval_swap', 'overdue_not_done', 'done_pending_approval', 'done_manager_approved', 'done_rejected', 'no_show'));
