-- 017_fix_constraints_and_rls.sql
-- 1. Fix shifts check constraint
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shift_status_check;
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check 
  CHECK (status IN (
    'not_started',
    'started',
    'up_for_swap',
    'pending_approval_claim',
    'pending_approval_swap',
    'swapped',
    'overdue_not_done',
    'done_pending_approval',
    'done_manager_approved',
    'done_rejected',
    'no_show',
    'cancelled'
  ));

-- 2. Fix swap requests RLS update policy
DROP POLICY IF EXISTS "Workers/managers update swap requests" ON swap_requests;
CREATE POLICY "Workers/managers update swap requests" ON swap_requests
  FOR UPDATE USING (
    organization_id = get_user_org_id() AND
    (
      requester_id = auth.uid() OR 
      covering_worker_id = auth.uid() OR 
      status = 'pending' OR 
      is_manager()
    )
  );
