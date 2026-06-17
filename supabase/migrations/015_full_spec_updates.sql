-- 015_full_spec_updates.sql
-- Drop constraint first
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;

-- Update existing shifts to use the new statuses mapping so the new constraint doesn't fail
UPDATE shifts SET status = 'not_started' WHERE status = 'scheduled';
UPDATE shifts SET status = 'up_for_swap' WHERE status = 'open';
UPDATE shifts SET status = 'pending_approval_swap' WHERE status = 'swap_pending';
UPDATE shifts SET status = 'done_pending_approval' WHERE status = 'pending_completion';
UPDATE shifts SET status = 'done_manager_approved' WHERE status = 'completed';

-- Now safely add the check constraint for the new status list
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

-- Alter shift default
ALTER TABLE shifts ALTER COLUMN status SET DEFAULT 'not_started';

-- Add deleted_at to shifts (Soft delete)
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update SwapRequest status check constraint
ALTER TABLE swap_requests DROP CONSTRAINT IF EXISTS swap_requests_status_check;
ALTER TABLE swap_requests ADD CONSTRAINT swap_requests_status_check 
  CHECK (status IN (
    'pending',
    'worker_accepted',
    'manager_approved',
    'rejected',
    'cancelled'
  ));

-- Add profile fields for "Complete Your Profile" spec
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "in_app": true}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_ids uuid[] DEFAULT '{}'::uuid[];

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all org audit logs" 
  ON audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = audit_logs.organization_id 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Manager can read org audit logs" 
  ON audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.organization_id = audit_logs.organization_id 
      AND profiles.user_role = 'manager'
    )
  );
