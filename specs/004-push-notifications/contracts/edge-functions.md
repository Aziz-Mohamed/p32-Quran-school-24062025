# Edge Function Contracts: Push Notifications

**Feature**: 004-push-notifications
**Date**: 2026-02-13

## 1. send-notification

**Purpose**: Receives database webhook payloads on INSERT events, determines notification type and recipients, checks preferences, and delivers push notifications via Expo Push API.

**Trigger**: Database webhook (AFTER INSERT on notification-worthy tables)

**JWT Verification**: Disabled (called by database webhook with service role key in header, not by clients)

### Request (Webhook Payload)

```typescript
interface WebhookPayload {
  type: 'INSERT';
  table: string;          // e.g., 'student_stickers', 'attendance'
  schema: 'public';
  record: Record<string, unknown>;  // full new row
  old_record: null;
}
```

### Behavior

1. Map `table` name to notification category:
   - `student_stickers` → `sticker_awarded`
   - `student_trophies` → `trophy_earned`
   - `student_achievements` → `achievement_unlocked`
   - `homework` → `homework_assigned`
   - `attendance` → `attendance_marked`
   - `sessions` → `session_completed`
2. Determine recipient user IDs from record:
   - `student_id` → student user
   - Look up `parent_id` from `students` table → parent user
   - For `attendance_marked`: parent only (no student notification)
3. For each recipient:
   - Query `notification_preferences` → check if category enabled
   - Check quiet hours (compare current school time against quiet_hours_start/end)
   - If quiet hours active: skip (notification is dropped — fire-and-forget)
   - Query `push_tokens` WHERE `user_id` = recipient AND `is_active` = true
4. Build localized notification content:
   - Query recipient's `preferred_language` from `profiles`
   - Construct title/body in appropriate language
   - Include deep-link `data` payload: `{ screen, params }`
5. Batch send to Expo Push API (up to 100 per request)
6. Process tickets: if `DeviceNotRegistered` → mark token `is_active = false`

### Response

```typescript
// 200 OK
{ success: true, sent: number, skipped: number, errors: number }

// 500 Error
{ success: false, error: string }
```

### Environment Variables

- `EXPO_ACCESS_TOKEN` — Expo push service authentication
- `SUPABASE_URL` — for database queries (auto-provided)
- `SUPABASE_SERVICE_ROLE_KEY` — for bypassing RLS (auto-provided)

---

## 2. homework-reminder

**Purpose**: Scheduled function that finds students with homework due tomorrow (in their school's timezone) and sends reminder notifications.

**Trigger**: pg_cron (every 15 minutes)

### Request

```typescript
// Called by pg_cron via pg_net HTTP POST
interface CronPayload {
  time: string;  // ISO timestamp of cron execution
}
```

### Behavior

1. Query all schools with their timezones
2. For each school where current local time is between 17:45 and 18:00 (6 PM window):
   - Query `homework` WHERE `due_date` = tomorrow (school local) AND `is_completed` = false
   - Group homework by `student_id`
   - For each student:
     - Check `notification_preferences.homework_reminder` is enabled
     - Check quiet hours
     - Look up push tokens
     - Build grouped notification (list all pending items)
   - For each student's parent:
     - Same preference/quiet hours/token checks
     - Build parent notification (includes child name)
3. Batch send all notifications via Expo Push API
4. Handle delivery errors (mark invalid tokens)

### Response

```typescript
{ success: true, schools_processed: number, reminders_sent: number }
```

---

## 3. teacher-daily-summary

**Purpose**: Scheduled function that sends morning summary notifications to teachers with classes scheduled for the day.

**Trigger**: pg_cron (every 15 minutes)

### Request

```typescript
interface CronPayload {
  time: string;
}
```

### Behavior

1. Query all schools with their timezones
2. For each school where current local time is between 06:45 and 07:00 (7 AM window):
   - Query all teachers with active classes in this school
   - For each teacher with `daily_summary` preference enabled:
     - Count students in their class(es)
     - Count students needing attention (homework_missed >= 3, declining scores)
     - Build summary notification
   - Check quiet hours, look up push tokens
3. For teachers where `student_alert` is enabled:
   - Identify students with concerning patterns (missed homework streak, declining scores)
   - Include alert count in summary or send separate alert notifications
4. Batch send via Expo Push API

### Response

```typescript
{ success: true, schools_processed: number, summaries_sent: number, alerts_sent: number }
```

---

## Client-Side Service Contracts

### notifications.service.ts

```typescript
interface NotificationService {
  // Push token management
  registerToken(userId: string, token: string, platform: 'ios' | 'android'): Promise<void>;
  removeToken(token: string): Promise<void>;
  removeAllUserTokens(userId: string): Promise<void>;

  // Preferences
  getPreferences(userId: string): Promise<NotificationPreferences>;
  upsertPreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<void>;
}
```

### Deep-Link Screen Mapping

| Notification Category   | Deep-Link Screen               | Params            |
| ----------------------- | ------------------------------ | ----------------- |
| sticker_awarded         | `/(student)/(tabs)/stickers`   | —                 |
| trophy_earned           | `/(student)/trophy-room`       | —                 |
| achievement_unlocked    | `/(student)/(tabs)/stickers`   | tab: achievements |
| homework_assigned       | `/(student)/(tabs)/index`      | —                 |
| attendance_marked       | `/(parent)/attendance/[childId]` | childId          |
| session_completed       | `/(student)/sessions/[id]`     | sessionId         |
| homework_reminder       | `/(student)/(tabs)/index`      | —                 |
| daily_summary           | `/(teacher)/(tabs)/index`      | —                 |
| student_alert           | `/(teacher)/students/[id]`     | studentId         |

**Parent deep-links**: When a parent receives a notification about a child, the deep-link targets the parent's view of that child (e.g., `/(parent)/children/[childId]`).
