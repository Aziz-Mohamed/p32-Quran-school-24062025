# Quickstart: Push Notifications Testing Guide

**Feature**: 004-push-notifications
**Date**: 2026-02-13

## Prerequisites

- Physical iOS or Android device (push notifications do NOT work in simulators or Expo Go)
- Expo Development Build installed on device
- Supabase project running with push notification tables migrated
- Edge Functions deployed (`send-notification`, `homework-reminder`, `teacher-daily-summary`)
- `EXPO_ACCESS_TOKEN` set in Supabase Edge Function secrets
- At least one school, teacher, student, and parent in the database with proper relationships

## Test Scenarios

### Scenario 1: Token Registration on Login

**Steps**:
1. Install Development Build on physical device
2. Log in as any user (student, teacher, parent)
3. Soft-ask screen should appear explaining notification value
4. Tap "Enable Notifications" → OS permission prompt appears
5. Grant permission

**Verify**:
- Query `push_tokens` table: a new row exists with the user's ID and an `ExponentPushToken[...]` value
- `platform` column matches device OS
- `is_active` is `true`

**SQL check**:
```sql
SELECT * FROM push_tokens WHERE user_id = '<user-id>' ORDER BY created_at DESC;
```

### Scenario 2: Sticker Award → Student Notification

**Steps**:
1. Log in as student on Device A (ensure notifications enabled)
2. Log in as teacher on Device B (or use SQL)
3. Teacher awards a sticker to the student

**Verify**:
- Student's Device A receives push notification within 10 seconds
- Notification shows sticker name and teacher name
- If app is backgrounded: system notification appears; tapping opens stickers screen
- If app is foregrounded: in-app banner appears (not system notification)

**SQL alternative** (trigger without teacher device):
```sql
INSERT INTO student_stickers (student_id, sticker_id, awarded_by)
VALUES ('<student-id>', '<sticker-id>', '<teacher-id>');
```

### Scenario 3: Attendance → Parent Notification

**Steps**:
1. Log in as parent on Device A (ensure notifications enabled, child linked)
2. Mark the child's attendance as "present" (via admin or teacher)

**Verify**:
- Parent receives notification: "[Child Name] was marked present today"
- Student does NOT receive a notification (attendance_marked is parent-only)

**SQL alternative**:
```sql
INSERT INTO attendance (school_id, student_id, class_id, status, marked_by)
VALUES ('<school-id>', '<student-id>', '<class-id>', 'present', '<teacher-id>');
```

### Scenario 4: Notification Preferences Toggle

**Steps**:
1. Log in as student
2. Navigate to notification preferences screen
3. Disable "Sticker Awards" toggle
4. Have teacher award a sticker

**Verify**:
- No notification received for sticker award
- Re-enable "Sticker Awards" toggle
- Have teacher award another sticker → notification received

### Scenario 5: Quiet Hours

**Steps**:
1. Log in as any user
2. Enable quiet hours: set start to current time minus 1 hour, end to current time plus 1 hour
3. Trigger a notification event (e.g., award sticker)

**Verify**:
- No notification received during quiet hours
- Wait until quiet hours end (or adjust times) → notification is NOT delivered (fire-and-forget)

### Scenario 6: Homework Reminder (Scheduled)

**Steps**:
1. Create homework for a student with `due_date` = tomorrow
2. Wait for the pg_cron job to run (or invoke the `homework-reminder` Edge Function manually)

**Verify**:
- Student receives reminder notification listing the homework
- Parent also receives reminder (includes child name)
- If homework is already completed (`is_completed = true`), no reminder sent

**Manual Edge Function invoke**:
```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/homework-reminder' \
  -H 'Authorization: Bearer <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"time": "2026-02-13T18:00:00Z"}'
```

### Scenario 7: Multi-Device Support

**Steps**:
1. Log in as the same user on two physical devices
2. Trigger a notification event

**Verify**:
- Both devices receive the notification
- Query `push_tokens`: two rows exist for the same user_id

### Scenario 8: Token Cleanup on Logout

**Steps**:
1. Log in on a device, verify token exists in `push_tokens`
2. Log out

**Verify**:
- The token row is removed (or marked `is_active = false`)
- No further notifications arrive on that device

### Scenario 9: Soft-Ask Skip

**Steps**:
1. Log in on a fresh device (no prior permission)
2. When soft-ask screen appears, tap "Skip" / "Not Now"

**Verify**:
- OS permission prompt is NOT shown
- No token registered in `push_tokens`
- App functions normally without notifications
- Soft-ask does NOT reappear on subsequent app launches
- User can later enable notifications from preferences screen

### Scenario 10: Deep-Link Navigation

**Steps**:
1. Receive a sticker notification while app is closed
2. Tap the notification

**Verify**:
- App opens and navigates directly to stickers collection screen
- If the sticker/entity has been deleted, app shows the relevant list screen instead of crashing

## Edge Case Tests

| Test | Expected Behavior |
|------|-------------------|
| Rapid-fire: award 5 stickers in 5 seconds | Max 1 notification per 30-second window |
| Invalid token (uninstall app, then trigger event) | Edge Function handles gracefully, marks token inactive |
| No push tokens registered (permissions denied) | Notification skipped silently, no errors |
| Parent's child deactivated (`is_active = false`) | No notifications sent for that child |
| Notification for deleted entity (tap after deletion) | Falls back to list screen |
| Network error during Expo Push API call | Retry up to 3 times with exponential backoff |
