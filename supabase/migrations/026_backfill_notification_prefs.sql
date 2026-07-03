-- 026_backfill_notification_prefs.sql
--
-- Before migration 020, notification_preferences defaulted to the flat format:
--   { "email": true, "in_app": true }
--
-- Migration 020 updated the DEFAULT to the new nested format, but existing rows
-- were NOT updated, causing shouldSendNotification() to treat `prefs.email?.immediate`
-- as `undefined` (falsy) and silently block all email notifications.
--
-- This migration backfills every profile that still has the old flat format.

UPDATE profiles
SET notification_preferences = '{
  "email": {
    "immediate": true,
    "digest": true,
    "frequency": "daily",
    "digest_time": "06:00",
    "quiet_hours": {"start": null, "end": null}
  },
  "in_app": true,
  "mute_types": []
}'::jsonb
WHERE
  -- Old flat format: email is a boolean (true or false), not an object
  jsonb_typeof(notification_preferences -> 'email') = 'boolean'
  -- Don't overwrite rows that already have the new nested format
  AND jsonb_typeof(notification_preferences -> 'email') != 'object';
