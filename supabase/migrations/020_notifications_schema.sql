-- 020_notifications_schema.sql
-- Create user_notifications table and email_digests tracking

-- Create ENUM types for notifications
CREATE TYPE notification_type AS ENUM (
  'shift_assigned',
  'shift_claim_requested',
  'shift_claim_approved',
  'shift_claim_rejected',
  'shift_completion_pending',
  'completion_approved',
  'completion_rejected',
  'swap_posted',
  'cover_offered',
  'swap_approval_pending',
  'swap_approved',
  'swap_rejected',
  'swap_cancelled',
  'shift_starting_soon',
  'shift_overdue',
  'pending_approvals_digest',
  'upcoming_shifts_digest'
);

CREATE TYPE notification_entity_type AS ENUM (
  'shift',
  'swap_request'
);

-- Create user_notifications table
CREATE TABLE user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_entity_type notification_entity_type,
  related_entity_id uuid,
  read_at timestamp NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT user_org_match CHECK (user_id IS NOT NULL AND organization_id IS NOT NULL)
);

-- Create email_digests table for tracking digest sends
CREATE TABLE email_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  digest_date date NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamp NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count int NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),

  CONSTRAINT user_org_match CHECK (user_id IS NOT NULL AND organization_id IS NOT NULL),
  CONSTRAINT one_digest_per_day_type UNIQUE(user_id, digest_date, notification_type)
);

-- Update profiles to have more granular notification preferences
ALTER TABLE profiles
ALTER COLUMN notification_preferences SET DEFAULT '{
  "email": {
    "immediate": true,
    "digest": true,
    "frequency": "daily",
    "digest_time": "06:00",
    "quiet_hours": {"start": null, "end": null}
  },
  "in_app": true,
  "mute_types": []
}'::jsonb;

-- Create indexes for common queries
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id, created_at DESC);
CREATE INDEX idx_user_notifications_read_status ON user_notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_user_notifications_type ON user_notifications(user_id, type);
CREATE INDEX idx_user_notifications_organization ON user_notifications(organization_id);
CREATE INDEX idx_user_notifications_entity ON user_notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_email_digests_pending ON email_digests(user_id, digest_date) WHERE status = 'pending';

-- Enable Realtime on user_notifications for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- Create RLS policies for user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON user_notifications
  FOR SELECT USING (user_id = auth.uid() OR (SELECT user_role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Service can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications read status" ON user_notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create RLS policies for email_digests (admin only for now)
ALTER TABLE email_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email digests" ON email_digests
  FOR SELECT USING ((SELECT user_role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Service can manage email digests" ON email_digests
  FOR ALL USING (true);
