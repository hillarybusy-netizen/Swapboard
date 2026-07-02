-- 025_add_performance_indexes.sql
-- Add performance indexes on high-traffic query columns

-- shifts: most common filters in dashboard/available-shifts/my-shifts
CREATE INDEX IF NOT EXISTS idx_shifts_organization_status
  ON shifts(organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_assigned_to
  ON shifts(assigned_to)
  WHERE deleted_at IS NULL AND assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_department_id
  ON shifts(department_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_shifts_start_time
  ON shifts(organization_id, start_time)
  WHERE deleted_at IS NULL;

-- compound index for the "available shifts" query (unassigned + not_started)
CREATE INDEX IF NOT EXISTS idx_shifts_available
  ON shifts(organization_id, department_id, status, start_time)
  WHERE deleted_at IS NULL AND assigned_to IS NULL AND status = 'not_started';

-- swap_requests: most common filters for manager approval queues
CREATE INDEX IF NOT EXISTS idx_swap_requests_organization_status
  ON swap_requests(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_swap_requests_shift_id
  ON swap_requests(shift_id);

CREATE INDEX IF NOT EXISTS idx_swap_requests_requester
  ON swap_requests(requester_id, status);

CREATE INDEX IF NOT EXISTS idx_swap_requests_covering_worker
  ON swap_requests(covering_worker_id)
  WHERE covering_worker_id IS NOT NULL;

-- profiles: fast role + org lookups (heavily used by RLS helper functions)
CREATE INDEX IF NOT EXISTS idx_profiles_organization_role
  ON profiles(organization_id, user_role);

CREATE INDEX IF NOT EXISTS idx_profiles_department_id
  ON profiles(department_id)
  WHERE department_id IS NOT NULL;
