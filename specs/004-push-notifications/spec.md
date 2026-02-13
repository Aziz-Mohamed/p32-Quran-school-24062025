# Feature Specification: Push Notifications

**Feature Branch**: `004-push-notifications`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Push notifications for all roles using Expo Push API and Supabase Edge Functions, based on PRD Section 7.5 and Phase 2 plan

## Clarifications

### Session 2026-02-13

- Q: Should notification events be persisted long-term (in-app inbox) or fire-and-forget (delivery queue only)? → A: Fire-and-forget — events are queued for delivery/retry then discarded after resolution. No in-app notification inbox.
- Q: Whose timezone is used for scheduled notifications (homework reminders, quiet hours)? → A: School timezone — a single timezone per school stored in school settings. All users in a school share it.
- Q: When should the app first request push notification permissions from the OS? → A: Soft-ask first — show a brief in-app explanation screen before triggering the OS prompt. User can skip or proceed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Receives Live Sticker Notification (Priority: P1)

A student is using the app (or has it backgrounded) when their teacher awards them a sticker. The student immediately receives a push notification celebrating the award. Tapping the notification opens the stickers collection screen so the student can see their new sticker.

**Why this priority**: Sticker awards are the most frequent teacher-to-student interaction and the core gamification loop. Instant feedback on rewards drives student engagement and motivation — this is the single highest-value notification in the app.

**Independent Test**: Can be fully tested by having a teacher award a sticker and verifying the student's device receives a push notification within 10 seconds. Tapping the notification navigates to the stickers screen.

**Acceptance Scenarios**:

1. **Given** a student has the app installed and notifications enabled, **When** a teacher awards them a sticker, **Then** the student receives a push notification with the sticker name and teacher name within 10 seconds.
2. **Given** a student receives a sticker notification while the app is backgrounded, **When** they tap the notification, **Then** the app opens directly to the stickers collection screen.
3. **Given** a student receives a sticker notification while the app is in the foreground, **When** the notification arrives, **Then** an in-app banner is shown (not a system-level push) so the current screen is not disrupted.
4. **Given** a student has disabled sticker notifications in their preferences, **When** a teacher awards them a sticker, **Then** no push notification is sent.

---

### User Story 2 - Parent Receives Child Activity Notifications (Priority: P1)

A parent receives push notifications about their child's key school activities: attendance status, sticker awards, homework assignments, and session completions. This keeps the parent informed without needing to open the app repeatedly.

**Why this priority**: Parent engagement is a key value proposition of the app. Parents who receive timely updates about their child's progress are more likely to stay engaged and support their child's learning. This directly serves the PRD's parent role vision of "monitor & support."

**Independent Test**: Can be fully tested by marking a student's attendance and verifying the parent's device receives a notification. Repeat for homework assignment and sticker award.

**Acceptance Scenarios**:

1. **Given** a parent has notifications enabled and a linked child, **When** the child's attendance is marked (present, absent, late, or excused), **Then** the parent receives a push notification with the child's name and attendance status.
2. **Given** a parent has notifications enabled, **When** a teacher assigns homework to their child, **Then** the parent receives a notification with the homework description and due date.
3. **Given** a parent has notifications enabled, **When** their child earns a sticker or trophy, **Then** the parent receives a celebratory notification with the award name.
4. **Given** a parent has multiple children enrolled, **When** notifications arrive for different children, **Then** each notification clearly identifies which child it pertains to.
5. **Given** a parent has disabled attendance notifications but kept sticker notifications enabled, **When** attendance is marked, **Then** no attendance notification is sent, but sticker notifications still arrive.

---

### User Story 3 - Homework Reminder Notifications (Priority: P2)

Students (and their parents) receive a reminder notification when homework is due soon. This reduces missed homework and encourages timely completion.

**Why this priority**: Homework completion is a key learning metric. Proactive reminders directly improve completion rates without requiring the student or parent to remember to check the app. This is a high-value automated notification.

**Independent Test**: Can be fully tested by creating a homework assignment with a due date of tomorrow and verifying that the student receives a reminder notification the evening before.

**Acceptance Scenarios**:

1. **Given** a student has homework due the next day, **When** the evening reminder time arrives (default: 6:00 PM in the school's timezone), **Then** the student receives a push notification listing the homework description and due date.
2. **Given** a student has already completed the homework before the reminder time, **When** the reminder time arrives, **Then** no reminder notification is sent.
3. **Given** a parent has homework reminder notifications enabled for their child, **When** the child has homework due tomorrow, **Then** the parent also receives a reminder notification identifying the child and homework.
4. **Given** a student has multiple homework items due the next day, **When** the reminder fires, **Then** a single grouped notification is sent listing all pending items (not one notification per item).

---

### User Story 4 - Teacher Daily Summary and Alerts (Priority: P2)

A teacher receives a morning summary notification before class and alert notifications for students needing attention (declining performance, missed homework streaks). This helps teachers prepare for the day and intervene early.

**Why this priority**: Teachers benefit from proactive alerts that help them focus on students who need the most support. A morning summary replaces the need to manually check the dashboard before class. This directly supports the teacher dashboard "alerts for students needing attention" feature from the PRD.

**Independent Test**: Can be fully tested by scheduling a morning summary for a teacher with students in their class and verifying the notification arrives at the configured time with correct student counts and alert information.

**Acceptance Scenarios**:

1. **Given** a teacher has notifications enabled and an upcoming class today, **When** the morning summary time arrives (default: 30 minutes before first class), **Then** the teacher receives a notification with: number of students, any pending alerts, and a preview of the day's schedule.
2. **Given** a student has missed homework 3 times in a row, **When** the next missed homework is recorded, **Then** the teacher receives an alert notification identifying the student and the pattern.
3. **Given** a teacher has no classes scheduled today, **When** the morning summary time arrives, **Then** no summary notification is sent.

---

### User Story 5 - Notification Preferences Management (Priority: P2)

Every user can manage their notification preferences from within the app. They can enable/disable specific notification categories and configure quiet hours. Preferences are respected across all notification delivery.

**Why this priority**: User control over notifications is essential for preventing notification fatigue and respecting user preferences. Without this, users may disable notifications entirely at the OS level, losing all engagement benefits.

**Independent Test**: Can be fully tested by toggling a notification category off, triggering the associated event, and verifying no notification is delivered. Toggle it back on and verify notifications resume.

**Acceptance Scenarios**:

1. **Given** a user opens their notification settings, **When** the settings screen loads, **Then** they see toggles for each notification category relevant to their role, with the current state accurately shown.
2. **Given** a user disables a notification category, **When** the associated event occurs, **Then** no push notification is sent for that category.
3. **Given** a user sets quiet hours (e.g., 10 PM to 7 AM), **When** a notification event occurs during quiet hours, **Then** the notification is held and delivered when quiet hours end.
4. **Given** a user re-enables a previously disabled category, **When** the next associated event occurs, **Then** notifications resume immediately.

---

### User Story 6 - Device Token Registration and Multi-Device Support (Priority: P3)

The app automatically registers the device's push token with the server on login and manages token lifecycle (refresh, logout cleanup). Users who log in on multiple devices receive notifications on all active devices.

**Why this priority**: This is the foundational plumbing that all other notification stories depend on. It is P3 because it has no direct user-visible value — users don't interact with token registration. However, it must be implemented before any notifications can be delivered.

**Independent Test**: Can be fully tested by logging in on a device, verifying a push token is stored server-side, then logging out and verifying the token is removed.

**Acceptance Scenarios**:

1. **Given** a user logs in on a new device, **When** the app initializes, **Then** the device's push token is registered with the server and associated with the user's profile.
2. **Given** a user is logged in on two devices, **When** a notification event occurs, **Then** both devices receive the push notification.
3. **Given** a user logs out of the app, **When** logout completes, **Then** the device's push token is removed from the server so no further notifications are delivered to that device.
4. **Given** a device's push token is refreshed by the OS, **When** the app detects the new token, **Then** the old token is replaced with the new one on the server.
5. **Given** a user denies notification permissions at the OS level, **When** the app attempts to register a token, **Then** the app gracefully handles the denial and does not repeatedly prompt for permissions.
6. **Given** a user logs in for the first time on a device, **When** the dashboard loads, **Then** a soft-ask screen explains the value of notifications for their role and offers to proceed to the OS prompt or skip.

---

### Edge Cases

- What happens when a user's push token becomes invalid (e.g., app uninstalled)? The server must handle delivery failures gracefully and clean up stale tokens.
- What happens when multiple events of the same type occur rapidly (e.g., teacher awards 5 stickers in quick succession)? Notifications should be batched or throttled to prevent spam (max 1 notification per event type per 30-second window).
- What happens when the notification delivery service (Expo Push API) is temporarily unavailable? Failed deliveries should be retried with exponential backoff (up to 3 retries).
- What happens when a user has no push token registered (never granted permissions)? The system should skip notification delivery without errors.
- What happens when a parent's child is deactivated (graduated/left)? Notifications for that child should stop immediately.
- What happens when a notification references an entity that was deleted before the user taps it (e.g., sticker revoked)? The app should handle deep-link failures gracefully by showing the relevant list screen instead.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST register a device push token upon successful user login and associate it with the user's profile and device.
- **FR-002**: System MUST remove the device push token upon user logout to prevent stale notifications.
- **FR-003**: System MUST deliver push notifications for the following event types:
  - Sticker awarded to student (recipients: student, parent)
  - Trophy earned by student (recipients: student, parent)
  - Achievement unlocked by student (recipients: student, parent)
  - Homework assigned to student (recipients: student, parent)
  - Attendance marked for student (recipients: parent)
  - Session completed for student (recipients: student, parent)
  - Homework due reminder (recipients: student, parent)
  - Teacher daily summary (recipients: teacher)
  - Student needs attention alert (recipients: teacher)
- **FR-004**: System MUST respect per-user, per-category notification preferences when deciding whether to send a notification.
- **FR-005**: System MUST support quiet hours per user — notifications generated during quiet hours are held and delivered when quiet hours end.
- **FR-006**: System MUST include deep-link data in each notification so tapping opens the relevant screen in the app.
- **FR-007**: System MUST display in-app notification banners when the app is in the foreground instead of system-level push notifications.
- **FR-008**: System MUST batch rapid-fire notifications of the same type within a 30-second window into a single grouped notification.
- **FR-009**: System MUST retry failed notification deliveries up to 3 times with exponential backoff.
- **FR-010**: System MUST support multiple devices per user — all active devices receive notifications.
- **FR-011**: System MUST clean up invalid/expired push tokens when the delivery service reports them as unregisterable.
- **FR-012**: System MUST provide a notification preferences screen accessible from each role's settings or profile area.
- **FR-013**: System MUST localize notification content based on the recipient's preferred language (English or Arabic).
- **FR-014**: System MUST present a soft-ask explanation screen on first login (per device) before triggering the OS notification permission prompt. The screen explains the value of notifications for the user's role (e.g., "Get notified when your child earns a sticker!"). The user can proceed to the OS prompt or skip. If skipped, the soft-ask is not shown again until the user navigates to notification preferences.

### Key Entities

- **Push Token**: Represents a device's push notification token. Attributes: user reference, device identifier, token value, platform (iOS/Android), active status, creation and update timestamps.
- **Notification Preference**: Represents a user's notification settings. Attributes: user reference, notification category, enabled/disabled flag, quiet hours start time, quiet hours end time.
- **Notification Event**: A transient delivery record (fire-and-forget). Used only for queuing, retry tracking, and delivery confirmation — discarded after final resolution (sent or max retries exhausted). Attributes: event type, recipient(s), payload data (title, body, deep-link), status (pending, sent, failed), retry count, timestamps. Not persisted for user-facing history.

### Assumptions

- The app already uses Supabase Auth for authentication — push token registration will hook into the existing auth flow.
- Expo Push Notification service is used as the delivery mechanism (handles both iOS APNs and Android FCM).
- The existing Supabase Realtime infrastructure (from 003-realtime-updates) handles live in-app updates; push notifications complement this for backgrounded/closed app states.
- Notification content will be kept short (title: max 50 characters, body: max 150 characters) to fit standard push notification display constraints.
- Homework reminder scheduling uses a server-side scheduled function (cron-like) that runs periodically to check for upcoming due dates. All time-based scheduling (reminders, quiet hours, teacher summaries) uses the school's configured timezone.
- Default notification preferences: all categories enabled, no quiet hours set. Users opt-out rather than opt-in.
- The notification preferences UI will be added to existing settings/profile screens rather than creating a new dedicated tab.
- Out of scope for this feature: in-app notification inbox/history, email notifications, SMS notifications, admin-specific notifications. These may be added in future iterations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Notifications are delivered to the recipient's device within 10 seconds of the triggering event for real-time notifications (sticker awards, attendance, etc.).
- **SC-002**: 95% of push notifications are successfully delivered on first attempt (measured by delivery service receipt status).
- **SC-003**: Users can configure their notification preferences in under 30 seconds (toggle categories and set quiet hours).
- **SC-004**: Homework reminder notifications result in a measurable increase in on-time homework completion rate compared to pre-notification baseline.
- **SC-005**: Zero notifications are delivered for disabled categories or during active quiet hours.
- **SC-006**: Notification tap-through correctly deep-links to the relevant screen 100% of the time (or gracefully falls back to the list screen if the entity no longer exists).
- **SC-007**: Users on multiple devices receive notifications on all active devices simultaneously.
- **SC-008**: Stale push tokens (from uninstalled apps or logged-out sessions) are cleaned up within 24 hours of becoming invalid.
