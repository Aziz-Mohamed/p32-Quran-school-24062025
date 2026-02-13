# Data Model: Push Notifications

**Feature**: 004-push-notifications
**Date**: 2026-02-13

## New Tables

### push_tokens

Stores device push tokens for each user. Supports multiple devices per user.

| Column      | Type         | Constraints                                          | Description                        |
| ----------- | ------------ | ---------------------------------------------------- | ---------------------------------- |
| id          | UUID         | PK, DEFAULT gen_random_uuid()                        | Row identifier                     |
| user_id     | UUID         | NOT NULL, FK → profiles(id) ON DELETE CASCADE        | Token owner                        |
| token       | TEXT         | NOT NULL, UNIQUE                                     | Expo push token string             |
| platform    | TEXT         | NOT NULL, CHECK IN ('ios', 'android')                | Device platform                    |
| is_active   | BOOLEAN      | NOT NULL, DEFAULT true                               | False when token is invalidated    |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                              | Registration time                  |
| updated_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                              | Last refresh time                  |

**RLS Policies**:
- Users can INSERT/UPDATE/DELETE their own tokens only
- Edge Functions use service role key (bypasses RLS)

**Indexes**:
- `idx_push_tokens_user_id` on `user_id` (lookup by user for sending)
- Unique constraint on `token` already creates an index

---

### notification_preferences

Stores per-user notification category toggles and quiet hours. One row per user (created on first login with defaults).

| Column                | Type     | Constraints                                   | Description                               |
| --------------------- | -------- | --------------------------------------------- | ----------------------------------------- |
| user_id               | UUID     | PK, FK → profiles(id) ON DELETE CASCADE       | Preferences owner (1:1 with profile)      |
| sticker_awarded       | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on sticker award                   |
| trophy_earned         | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on trophy earned                   |
| achievement_unlocked  | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on achievement unlocked            |
| homework_assigned     | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on homework assigned               |
| attendance_marked     | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on attendance marked               |
| session_completed     | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify on session completed               |
| homework_reminder     | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify with homework due reminders        |
| daily_summary         | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify with teacher daily summary         |
| student_alert         | BOOLEAN  | NOT NULL, DEFAULT true                        | Notify teacher of student needing attention|
| quiet_hours_enabled   | BOOLEAN  | NOT NULL, DEFAULT false                       | Whether quiet hours are active            |
| quiet_hours_start     | TIME     | (nullable)                                    | Start of quiet period (e.g., 22:00)       |
| quiet_hours_end       | TIME     | (nullable)                                    | End of quiet period (e.g., 07:00)         |
| created_at            | TIMESTAMPTZ | NOT NULL, DEFAULT now()                    | Row creation time                         |
| updated_at            | TIMESTAMPTZ | NOT NULL, DEFAULT now()                    | Last preference change                    |

**Design rationale**: Column-per-category (vs. row-per-category) chosen because:
- Fixed, small set of notification types (9 categories)
- Single-row lookup per user (no joins needed when checking preferences)
- Easier to query: `SELECT sticker_awarded FROM notification_preferences WHERE user_id = $1`
- Quiet hours naturally live on the same row

**RLS Policies**:
- Users can SELECT/UPDATE their own row only
- INSERT allowed for own user_id only
- Edge Functions use service role key (bypasses RLS)

---

## Modified Tables

### schools

Add timezone column for scheduled notification timing.

| Column   | Type | Constraints                  | Description                    |
| -------- | ---- | ---------------------------- | ------------------------------ |
| timezone | TEXT | NOT NULL, DEFAULT 'UTC'      | IANA timezone (e.g., 'Asia/Riyadh') |

---

## Entity Relationships

```
profiles (1) ──── (0..N) push_tokens        [user has many devices]
profiles (1) ──── (0..1) notification_preferences  [user has one prefs row]
schools  (1) ──── (N)    profiles            [existing; timezone affects all school users]
```

## Notification Flow (Data Perspective)

```
Event INSERT (e.g., student_stickers)
    │
    ▼
Database Webhook fires (pg_net → Edge Function)
    │
    ▼
Edge Function:
  1. Determine event type from table name
  2. Look up recipient user_id(s) from record + relationships
  3. Query notification_preferences for each recipient
     → Skip if category disabled
     → Check quiet hours (hold if active)
  4. Query push_tokens WHERE user_id IN (...) AND is_active = true
  5. Build Expo Push API payload (localized title/body)
  6. POST to https://exp.host/--/api/v2/push/send
  7. Handle errors: DeviceNotRegistered → mark token is_active = false
```

## Category-to-Table Mapping

| Notification Category   | Trigger Table          | Trigger Event | Recipients              |
| ----------------------- | ---------------------- | ------------- | ----------------------- |
| sticker_awarded         | student_stickers       | INSERT        | student, parent         |
| trophy_earned           | student_trophies       | INSERT        | student, parent         |
| achievement_unlocked    | student_achievements   | INSERT        | student, parent         |
| homework_assigned       | homework               | INSERT        | student, parent         |
| attendance_marked       | attendance             | INSERT        | parent                  |
| session_completed       | sessions               | INSERT        | student, parent         |
| homework_reminder       | (scheduled — pg_cron)  | Cron          | student, parent         |
| daily_summary           | (scheduled — pg_cron)  | Cron          | teacher                 |
| student_alert           | (scheduled — pg_cron)  | Cron          | teacher                 |
