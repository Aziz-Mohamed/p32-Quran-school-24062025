-- ============================================================================
-- Migration 00005: Notification Webhooks
-- Enable pg_net, create AFTER INSERT triggers to call send-notification Edge Function
-- ============================================================================

-- Enable pg_net extension for async HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ─── Webhook trigger function ───────────────────────────────────────────────
-- Calls the send-notification Edge Function with the webhook payload format

CREATE OR REPLACE FUNCTION notify_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
  payload JSONB;
BEGIN
  -- Build the Edge Function URL
  edge_function_url := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/send-notification';

  -- Get service role key from vault or settings
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If settings are not available, use env-based approach
  IF edge_function_url IS NULL OR edge_function_url = '' OR edge_function_url = '/functions/v1/send-notification' THEN
    edge_function_url := 'https://zngiszdfdowjvwxqmexl.supabase.co/functions/v1/send-notification';
  END IF;

  -- Build webhook payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', NULL
  );

  -- Fire async HTTP POST via pg_net
  PERFORM extensions.http_post(
    url := edge_function_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    )
  );

  RETURN NEW;
END;
$$;

-- ─── Create triggers on notification-worthy tables ──────────────────────────

CREATE TRIGGER on_student_sticker_insert
  AFTER INSERT ON student_stickers
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();

CREATE TRIGGER on_student_trophy_insert
  AFTER INSERT ON student_trophies
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();

CREATE TRIGGER on_student_achievement_insert
  AFTER INSERT ON student_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();

CREATE TRIGGER on_homework_insert
  AFTER INSERT ON homework
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();

CREATE TRIGGER on_attendance_insert
  AFTER INSERT ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();

CREATE TRIGGER on_session_insert
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_insert();
