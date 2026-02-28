-- ============================================================================
-- Migration 00004: Push Notifications
-- Tables: push_tokens, notification_preferences
-- Alter: schools (add timezone column)
-- ============================================================================

-- ─── 1. Add timezone column to schools ──────────────────────────────────────

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

-- ─── 2. Create push_tokens table ───────────────────────────────────────────

CREATE TABLE push_tokens (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token       TEXT          NOT NULL UNIQUE,
  platform    TEXT          NOT NULL CHECK (platform IN ('ios', 'android')),
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index for looking up tokens by user (used when sending notifications)
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- updated_at trigger
CREATE TRIGGER set_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ─── 3. Create notification_preferences table ──────────────────────────────

CREATE TABLE notification_preferences (
  user_id               UUID          PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  sticker_awarded       BOOLEAN       NOT NULL DEFAULT true,
  trophy_earned         BOOLEAN       NOT NULL DEFAULT true,
  achievement_unlocked  BOOLEAN       NOT NULL DEFAULT true,
  homework_assigned     BOOLEAN       NOT NULL DEFAULT true,
  attendance_marked     BOOLEAN       NOT NULL DEFAULT true,
  session_completed     BOOLEAN       NOT NULL DEFAULT true,
  homework_reminder     BOOLEAN       NOT NULL DEFAULT true,
  daily_summary         BOOLEAN       NOT NULL DEFAULT true,
  student_alert         BOOLEAN       NOT NULL DEFAULT true,
  quiet_hours_enabled   BOOLEAN       NOT NULL DEFAULT false,
  quiet_hours_start     TIME,
  quiet_hours_end       TIME,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- updated_at trigger
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ─── 4. RLS Policies ───────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- push_tokens: users manage their own tokens only
CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- notification_preferences: users manage their own row only
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);
