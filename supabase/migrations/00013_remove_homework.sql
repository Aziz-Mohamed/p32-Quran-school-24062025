-- ============================================================================
-- Migration 00013: Remove homework feature
-- ============================================================================
-- Homework was a free-form task system that overlapped with the structured
-- memorization assignment system. All student work now flows through
-- memorization_assignments + memorization_progress.
-- ============================================================================

-- 1. Remove homework from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS homework;

-- 2. Remove homework notification webhook trigger
DROP TRIGGER IF EXISTS homework_notify_trigger ON homework;

-- 3. Remove homework-reminder cron job (if pg_cron is available)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('homework-reminder');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available or job doesn't exist, safe to ignore
  NULL;
END;
$$;

-- 4. Remove homework notification preference columns
ALTER TABLE notification_preferences
  DROP COLUMN IF EXISTS homework_assigned,
  DROP COLUMN IF EXISTS homework_reminder;

-- 5. Drop homework table (CASCADE removes RLS policies, indexes, triggers)
DROP TABLE IF EXISTS homework CASCADE;
