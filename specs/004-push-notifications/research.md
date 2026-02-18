# Research: Push Notifications

**Feature**: 004-push-notifications
**Date**: 2026-02-13

## 1. Client-Side Push Token Registration (expo-notifications)

**Decision**: Use `expo-notifications` SDK for token registration, permission handling, foreground notification management, and tap-through navigation.

**Rationale**: This is the official Expo SDK for push notifications and handles both iOS APNs and Android FCM under a single unified API. It integrates natively with Expo's push service.

**Alternatives considered**:
- `react-native-firebase` messaging — adds Firebase dependency, unnecessary when Expo Push API handles delivery
- `@notifee/react-native` — powerful for local notifications but overkill; Expo's SDK covers our needs

**Key API surface**:
- `Notifications.requestPermissionsAsync()` — prompt for OS permission
- `Notifications.getExpoPushTokenAsync({ projectId })` — returns `ExponentPushToken[xxx]` string
- `Notifications.setNotificationHandler()` — control foreground behavior
- `Notifications.addNotificationReceivedListener()` — foreground arrival
- `Notifications.addNotificationResponseReceivedListener()` — tap handling

**Constraints**:
- Push notifications do NOT work in Expo Go (SDK 54+). Requires a Development Build.
- Physical device required (no simulator/emulator support for push delivery).
- Android requires `setNotificationChannelAsync()` before requesting tokens.
- `projectId` must come from `Constants.expoConfig.extra.eas.projectId`.

## 2. Server-Side Notification Delivery (Expo Push API)

**Decision**: Use Expo Push API (`https://exp.host/--/api/v2/push/send`) for delivering push notifications. Call it from Supabase Edge Functions.

**Rationale**: Expo Push API is the standard delivery mechanism for Expo apps. It abstracts away APNs/FCM details and provides a single endpoint. No need to manage APNs certificates or FCM server keys directly.

**Alternatives considered**:
- Direct APNs/FCM — more control but much more complex setup, certificate management
- OneSignal/Firebase Cloud Messaging — adds external dependency, unnecessary complexity

**Key details**:
- Batch up to 100 notifications per request
- Rate limit: 600 notifications/second
- Receipt checking endpoint: `POST /getReceipts` (check ~15 minutes after send)
- `DeviceNotRegistered` error → delete push token from database
- `MessageRateExceeded` → exponential backoff
- Requires `EXPO_ACCESS_TOKEN` for Enhanced Security mode
- Payload: `{ to, title, body, data, sound, badge, ttl, priority, channelId }`

## 3. Event-Driven Notification Triggers (Database Webhooks)

**Decision**: Use Supabase Database Webhooks (AFTER INSERT triggers via `pg_net`) to call Edge Functions when notification-worthy events occur.

**Rationale**: Database webhooks are the officially recommended Supabase pattern for event-driven server-side logic. They are async (non-blocking), fire reliably on INSERT, and pass the full record to the Edge Function. This ensures notifications are sent regardless of which client triggered the change.

**Alternatives considered**:
- Client-side Edge Function calls from mutation hooks — unreliable if client disconnects mid-mutation; doesn't catch admin panel or direct SQL changes
- Pure `pg_notify` + listener — requires a persistent server process, not available in Supabase managed
- Supabase Realtime server-side listener — not supported; Realtime is client-only

**Implementation**:
- Webhooks on: `student_stickers`, `student_trophies`, `student_achievements`, `homework`, `attendance`, `sessions` (INSERT events)
- All webhooks call the same `send-notification` Edge Function with table name + record payload
- Edge Function determines notification type, looks up recipients and their preferences, fetches push tokens, sends via Expo Push API

## 4. Scheduled Notifications (pg_cron + pg_net)

**Decision**: Use `pg_cron` extension to schedule periodic Edge Function calls via `pg_net` HTTP requests.

**Rationale**: Supabase natively supports `pg_cron` and `pg_net` extensions. This is the documented pattern for scheduled server-side tasks. No external scheduler needed.

**Alternatives considered**:
- External cron service (GitHub Actions, AWS Lambda) — adds external dependency, harder to maintain
- Client-side local notifications — unreliable, depends on app being installed and running
- Supabase Edge Function with Deno.cron — not yet supported in Supabase hosted environment

**Implementation**:
- Homework reminders: pg_cron runs every 15 minutes, Edge Function checks which schools are at their 6 PM local time, queries pending homework, sends reminders
- Teacher daily summary: pg_cron runs every 15 minutes, Edge Function checks which schools are at their configured summary time, aggregates data, sends summary
- Credentials stored in Supabase Vault for secure access from cron jobs

## 5. Foreground Notification Handling

**Decision**: Suppress system notifications when app is foregrounded; show custom in-app banner using a toast/banner component.

**Rationale**: The spec requires in-app banners (FR-007) rather than system-level push notifications when the app is in the foreground. This prevents disrupting the user's current screen while still informing them of events.

**Alternatives considered**:
- Show system notification banner even in foreground (`shouldShowBanner: true`) — simpler but disrupts UX and doesn't match spec requirement
- Use `react-native-toast-message` for in-app banners — good option, already a common pattern

**Implementation**:
- `setNotificationHandler({ shouldShowBanner: false, shouldShowList: true })` at app root
- `addNotificationReceivedListener` triggers a custom in-app banner component
- Banner is tappable with same deep-link behavior as the push notification

## 6. School Timezone Handling

**Decision**: Add a `timezone` column to the `schools` table. All scheduled notification times are resolved using the school's timezone.

**Rationale**: The clarification phase decided on school-level timezone (not per-user). This aligns with the multi-tenant model — all users in a school share the same school day schedule.

**Implementation**:
- Add `timezone TEXT NOT NULL DEFAULT 'UTC'` to `schools` table
- pg_cron jobs run frequently (every 15 minutes) in UTC
- Edge Functions convert UTC to school timezone to determine if it's the right time for reminders/summaries
- Use `AT TIME ZONE` SQL function for timezone conversion in queries
