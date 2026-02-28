-- ============================================================================
-- Migration 00006: Notification Cron Jobs
-- Enable pg_cron, schedule homework-reminder and teacher-daily-summary
-- ============================================================================

-- Enable pg_cron extension (runs in pg_cron schema, managed by Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Grant usage to postgres role (required for Supabase)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ─── Homework Reminder ──────────────────────────────────────────────────────
-- Runs every 15 minutes. The Edge Function itself checks school timezones
-- and only sends reminders when the school's local time is ~6 PM.

SELECT cron.schedule(
  'homework-reminder',
  '*/15 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://zngiszdfdowjvwxqmexl.supabase.co/functions/v1/homework-reminder',
    body := '{"time": "' || now()::text || '"}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

-- ─── Teacher Daily Summary ──────────────────────────────────────────────────
-- Runs every 15 minutes. The Edge Function itself checks school timezones
-- and only sends summaries when the school's local time is ~7 AM.

SELECT cron.schedule(
  'teacher-daily-summary',
  '*/15 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://zngiszdfdowjvwxqmexl.supabase.co/functions/v1/teacher-daily-summary',
    body := '{"time": "' || now()::text || '"}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
