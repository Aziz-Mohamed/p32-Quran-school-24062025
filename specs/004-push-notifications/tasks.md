# Tasks: Push Notifications

**Input**: Design documents from `/specs/004-push-notifications/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Manual testing via quickstart.md.

**Organization**: Tasks grouped by user story. US6 (Token Registration) is P3 in spec but placed before P1 stories because it is a blocking prerequisite for all notification delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US6)
- Paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Install dependencies, create feature directory structure, define types and config

- [x] T001 Install expo-notifications, expo-device, and expo-constants dependencies via `npx expo install expo-notifications expo-device expo-constants`
- [x] T002 Create feature directory structure: `src/features/notifications/{hooks,services,components,types,config}/` and `src/features/notifications/index.ts` barrel export
- [x] T003 [P] Create TypeScript interfaces in `src/features/notifications/types/notifications.types.ts` — PushToken, NotificationPreferences, NotificationCategory, NotificationPayload, DeepLinkData types based on data-model.md entities and contracts
- [x] T004 [P] Create notification category config in `src/features/notifications/config/notification-categories.ts` — define all 9 categories with role applicability mapping (which categories apply to student, teacher, parent), display labels (i18n keys), and deep-link screen targets per contracts/edge-functions.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, Edge Function skeleton, service layer — MUST complete before any user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create database migration in `supabase/migrations/00004_push_notifications.sql` — tables: `push_tokens` (with RLS, indexes, updated_at trigger), `notification_preferences` (with RLS, updated_at trigger), ALTER `schools` ADD `timezone TEXT NOT NULL DEFAULT 'UTC'`. Include RLS policies: users can SELECT/INSERT/UPDATE/DELETE own rows only. Per data-model.md
- [x] T006 Apply migration to remote Supabase project using the Supabase MCP `apply_migration` tool
- [x] T007 Regenerate TypeScript types from Supabase schema into `supabase/types/database.types.ts` using the Supabase MCP `generate_typescript_types` tool
- [x] T008 Create `src/features/notifications/services/notifications.service.ts` — implement: `registerToken(userId, token, platform)`, `removeToken(token)`, `removeAllUserTokens(userId)`, `getPreferences(userId)`, `upsertPreferences(userId, prefs)` using direct Supabase SDK calls per constitution VII
- [x] T009 Create `send-notification` Edge Function in `supabase/functions/send-notification/index.ts` — skeleton: parse webhook payload (table + record), determine notification category from table name, look up recipient user IDs (student_id from record, parent_id via students table join), query push_tokens for recipients, build Expo Push API payload, POST to `https://exp.host/--/api/v2/push/send`, handle `DeviceNotRegistered` errors by marking token `is_active = false`. Use `EXPO_ACCESS_TOKEN` from env. Per contracts/edge-functions.md §1
- [x] T010 Deploy `send-notification` Edge Function to Supabase using the Supabase MCP `deploy_edge_function` tool with `verify_jwt: false` (called by database webhook, not clients)
- [x] T011 Create database webhooks (AFTER INSERT triggers) on tables: `student_stickers`, `student_trophies`, `student_achievements`, `homework`, `attendance`, `sessions` — each trigger calls the `send-notification` Edge Function via `supabase_functions.http_request()`. Apply as a separate migration `supabase/migrations/00005_notification_webhooks.sql`
- [x] T012 Apply webhook migration to remote Supabase project

**Checkpoint**: Foundation ready — Edge Function deployed, webhooks active, service layer in place

---

## Phase 3: US6 - Device Token Registration & Multi-Device Support (Priority: P3 — placed first as blocking dependency)

**Goal**: App registers device push tokens on login, removes them on logout, handles permission flow with soft-ask screen

**Independent Test**: Log in on a device → verify token in `push_tokens` table. Log out → verify token removed. Deny permissions → verify graceful handling.

- [x] T013 [US6] Create `src/features/notifications/hooks/useNotificationSetup.ts` — on mount: check if first login on device (AsyncStorage flag), if first time show soft-ask, request permissions via `Notifications.requestPermissionsAsync()`, get Expo push token via `Notifications.getExpoPushTokenAsync()`, call `notificationsService.registerToken()`. Set up token refresh listener. Handle permission denial gracefully.
- [x] T014 [US6] Create `src/features/notifications/components/NotificationSoftAsk.tsx` — modal/bottom-sheet explaining notification value per role (use i18n keys), "Enable Notifications" button (triggers OS prompt), "Not Now" button (dismisses, sets AsyncStorage flag). Role-specific messaging from notification-categories config. Use logical CSS properties per constitution V.
- [x] T015 [US6] Integrate notification setup into `app/_layout.tsx` — call `useNotificationSetup()` inside AuthGuard after user is authenticated. Set up `Notifications.setNotificationHandler()` with `shouldShowBanner: false` for foreground suppression. Set up Android notification channel via `Notifications.setNotificationChannelAsync()`.
- [x] T016 [US6] Add token cleanup to auth logout flow — in `src/features/auth/services/auth.service.ts` add `removeCurrentToken()` call before `signOut()`. In `src/features/auth/hooks/useLogout.ts` (or equivalent logout hook) call token removal before clearing auth state.
- [x] T017 [P] [US6] Add notification i18n strings to `src/i18n/en.json` and `src/i18n/ar.json` — keys for: soft-ask title, soft-ask body per role, enable button, skip button, preference screen labels, category names, quiet hours labels

**Checkpoint**: Token registration working. `push_tokens` table populated on login, cleaned on logout. Soft-ask screen shown on first login.

---

## Phase 4: US1 - Student Receives Live Sticker Notification (Priority: P1) MVP

**Goal**: When a teacher awards a sticker, the student receives a push notification. Foreground shows in-app banner. Background tap opens stickers screen.

**Independent Test**: Award sticker via SQL INSERT → student device receives push within 10 seconds. Tap notification → stickers screen opens.

- [x] T018 [US1] Add sticker notification content to `send-notification` Edge Function — for `student_stickers` table: query sticker name (join `stickers`), query teacher name (join `profiles` on `awarded_by`), query student's `preferred_language`, build localized title/body (e.g., EN: "New Sticker! {teacher} awarded you {sticker}"), include deep-link data `{ screen: '/(student)/(tabs)/stickers' }` (completed in Phase 2 — full content builders already in deployed Edge Function)
- [x] T019 [US1] Create `src/features/notifications/hooks/useNotificationHandler.ts` — set up `addNotificationResponseReceivedListener` for tap handling: extract deep-link `data.screen` and `data.params` from notification, use `router.push()` to navigate. Set up `addNotificationReceivedListener` for foreground: trigger in-app banner instead of system notification. Clean up listeners on unmount.
- [x] T020 [US1] Create `src/features/notifications/components/InAppBanner.tsx` — animated slide-down banner (react-native-reanimated, subtle per constitution VIII) showing notification title and body. Auto-dismiss after 4 seconds. Tappable — triggers same deep-link navigation as background tap. Dismissible via swipe-up. Use logical CSS per constitution V.
- [x] T021 [US1] Integrate `useNotificationHandler` into `app/_layout.tsx` — call hook inside AuthGuard after user authenticated. Pass InAppBanner component ref for foreground notification display.
- [x] T022 [US1] Redeploy `send-notification` Edge Function with sticker content builder using Supabase MCP `deploy_edge_function` (already deployed with full content builders in Phase 2)

**Checkpoint**: End-to-end sticker notification working. Teacher awards sticker → student gets push. Foreground → in-app banner. Background tap → stickers screen.

---

## Phase 5: US2 - Parent Receives Child Activity Notifications (Priority: P1)

**Goal**: Parents receive push notifications for child's attendance, stickers, trophies, achievements, homework, and session completions. Each notification identifies the child.

**Independent Test**: Mark attendance for a student → parent receives push with child name and status. Award sticker → parent receives celebratory notification.

- [x] T023 [US2] Add parent recipient lookup to `send-notification` Edge Function — for each event, after determining student_id from record, query `students` table for `parent_id`. If parent_id exists, add to recipients list. Include child's `full_name` (from `profiles`) in parent notification body. (completed in Phase 2 — getRecipients already includes parent_id lookup)
- [x] T024 [US2] Add notification content builders for all remaining event types in `send-notification` Edge Function — `attendance` (parent only: "{child} was marked {status} today"), `homework` ("{child} has new homework: {description}, due {date}"), `sessions` ("Session completed for {child} — scores: {recitation}/{tajweed}/{memorization}"), `student_trophies` ("{child} earned a trophy: {trophy_name}!"), `student_achievements` ("{child} unlocked: {achievement_name}!"). All localized EN/AR. (completed in Phase 2 — buildNotificationContent covers all 6 categories)
- [x] T025 [US2] Add parent deep-link routes to `useNotificationHandler.ts` — attendance → `/(parent)/attendance/[childId]`, sticker/trophy/achievement → `/(parent)/children/[childId]`, homework → `/(parent)/children/[childId]`, session → `/(parent)/children/[childId]`. Handle fallback: if entity deleted, navigate to `/(parent)/(tabs)/children` list. (deep-link targets embedded in Edge Function notification data; handler navigates to any data.screen path)
- [x] T026 [US2] Redeploy `send-notification` Edge Function with all content builders and parent lookup using Supabase MCP `deploy_edge_function` (already deployed with full implementation in Phase 2)

**Checkpoint**: Parents receive notifications for all child events. Each notification shows child name. Deep-links route to correct parent screens.

---

## Phase 6: US3 - Homework Reminder Notifications (Priority: P2)

**Goal**: Students and parents receive reminder notifications the evening before homework is due. Completed homework is excluded. Multiple items grouped into one notification.

**Independent Test**: Create homework with `due_date` = tomorrow → invoke homework-reminder Edge Function → student and parent receive grouped reminder.

- [x] T027 [US3] Create `homework-reminder` Edge Function in `supabase/functions/homework-reminder/index.ts` — query all schools with timezones, filter schools where current local time is in the 6 PM window (±7 min), for each qualifying school: query `homework` WHERE `due_date` = tomorrow (school local time) AND `is_completed = false`, group by `student_id`, build grouped notification per student ("{count} homework items due tomorrow: {descriptions}"), look up parent for each student and send parent notification too. Per contracts/edge-functions.md §2
- [x] T028 [US3] Deploy `homework-reminder` Edge Function to Supabase using MCP `deploy_edge_function` with `verify_jwt: false` (called by pg_cron)
- [x] T029 [US3] Create pg_cron job migration in `supabase/migrations/00006_notification_cron_jobs.sql` — schedule `homework-reminder` to run every 15 minutes: `SELECT cron.schedule('homework-reminder', '*/15 * * * *', ...)` using `net.http_post()` to call the Edge Function URL. Store credentials in Supabase Vault.
- [x] T030 [US3] Apply cron job migration to remote Supabase project

**Checkpoint**: Homework reminders fire automatically. Students with pending homework get grouped notification at 6 PM school time.

---

## Phase 7: US4 - Teacher Daily Summary and Alerts (Priority: P2)

**Goal**: Teachers receive morning summary notification before class with student counts and alerts for students needing attention.

**Independent Test**: Invoke teacher-daily-summary Edge Function for a school at 7 AM local time → teacher receives summary with student count and alert info.

- [x] T031 [US4] Create `teacher-daily-summary` Edge Function in `supabase/functions/teacher-daily-summary/index.ts` — query schools where current local time is in the 7 AM window (±7 min), for each: query teachers with active classes, for each teacher: count students in their class(es), identify students needing attention (missed homework ≥ 3 consecutive, declining scores — query last 5 sessions), build summary notification ("{student_count} students today. {alert_count} need attention."), send push. Per contracts/edge-functions.md §3
- [x] T032 [US4] Deploy `teacher-daily-summary` Edge Function to Supabase using MCP `deploy_edge_function` with `verify_jwt: false`
- [x] T033 [US4] Add teacher-daily-summary cron job to `supabase/migrations/00006_notification_cron_jobs.sql` (or create 00007 if 00006 already applied) — schedule every 15 minutes: `SELECT cron.schedule('teacher-daily-summary', '*/15 * * * *', ...)` (included in 00006 migration)
- [x] T034 [US4] Apply cron job migration to remote Supabase project (applied in T030)

**Checkpoint**: Teachers receive morning summaries. Students needing attention are flagged in the notification.

---

## Phase 8: US5 - Notification Preferences Management (Priority: P2)

**Goal**: Users can toggle notification categories on/off and configure quiet hours. Preferences are respected by all notification delivery.

**Independent Test**: Disable sticker notifications → award sticker → no notification received. Re-enable → award sticker → notification received.

- [x] T035 [US5] Create `src/features/notifications/hooks/useNotificationPreferences.ts` — TanStack Query hooks: `useNotificationPreferences(userId)` for fetching, `useUpdateNotificationPreferences()` mutation for toggling categories and setting quiet hours. Query key: `['notification-preferences', userId]`. Invalidate on mutation success.
- [x] T036 [US5] Create `src/features/notifications/components/NotificationPreferences.tsx` — screen component with: section of toggles for each notification category applicable to current role (use `notification-categories.ts` config to filter), quiet hours section with enable toggle + time pickers for start/end, all labels via i18n. Use react-hook-form + zod per constitution. Logical CSS per constitution V.
- [x] T037 [US5] Add preferences screen route and navigation entry point for student — add route file or link from existing profile/settings screen in `app/(student)/` to notification preferences. Use the `NotificationPreferences` component.
- [x] T038 [P] [US5] Add preferences screen route and navigation entry point for teacher — add in `app/(teacher)/` linking to `NotificationPreferences` component
- [x] T039 [P] [US5] Add preferences screen route and navigation entry point for parent — add in `app/(parent)/` linking to `NotificationPreferences` component
- [x] T040 [US5] Add preference and quiet hours checking to `send-notification` Edge Function — before sending: query `notification_preferences` for recipient, check if the notification's category column is `true`, check quiet hours (if enabled, compare current school time against start/end times). Skip delivery if category disabled or in quiet hours. Redeploy Edge Function. (completed in Phase 2 — send-notification already includes preference and quiet hours checking)
- [x] T041 [US5] Add preference checking to `homework-reminder` and `teacher-daily-summary` Edge Functions — same logic: check category enabled + quiet hours before sending. Redeploy both Edge Functions. (both Edge Functions already implement preference and quiet hours checking)

**Checkpoint**: Users can manage notification preferences. Disabled categories produce no notifications. Quiet hours suppress delivery.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, cleanup, and final validation

- [x] T042 Add Expo Push API receipt checking to `send-notification` Edge Function — after sending batch, store ticket IDs, schedule receipt check (or inline delay), process receipts: mark `DeviceNotRegistered` tokens as `is_active = false` in `push_tokens` table. Redeploy. (deployed as v2 with checkReceipts function)
- [x] T043 Add 30-second batching/dedup logic to `send-notification` Edge Function — track recent notifications per recipient+category in a short-lived cache (Edge Function memory or a temporary DB check), skip if same category sent to same user within 30 seconds. Addresses FR-008. (deployed as v2 with isDuplicate function and in-memory recentSends map)
- [x] T044 [P] Update all notification i18n strings in `src/i18n/en.json` and `src/i18n/ar.json` — ensure all 9 notification categories have complete title/body templates in both languages (all 9 categories present in both EN and AR)
- [ ] T045 Run quickstart.md validation — execute all 10 test scenarios from `specs/004-push-notifications/quickstart.md` on physical device with Development Build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US6 Token Registration (Phase 3)**: Depends on Phase 2 — BLOCKS US1-US5 (no tokens = no delivery)
- **US1 Sticker Notifications (Phase 4)**: Depends on Phase 3
- **US2 Parent Notifications (Phase 5)**: Depends on Phase 4 (extends send-notification Edge Function)
- **US3 Homework Reminders (Phase 6)**: Depends on Phase 2 only (independent Edge Function)
- **US4 Teacher Summary (Phase 7)**: Depends on Phase 2 only (independent Edge Function)
- **US5 Preferences (Phase 8)**: Depends on Phase 3 (needs token registration working), Phase 4/5 (modifies send-notification)
- **Polish (Phase 9)**: Depends on all story phases

### User Story Dependencies

```
Phase 1 → Phase 2 → Phase 3 (US6) → Phase 4 (US1) → Phase 5 (US2)
                                  ↘                        ↗
                                   Phase 8 (US5) ─────────
                   ↘
                    Phase 6 (US3) ─── independent
                    Phase 7 (US4) ─── independent
```

- **US6** must come first (token plumbing)
- **US1** depends on US6 (needs tokens to deliver to)
- **US2** extends US1's Edge Function (adds parent lookup + more content builders)
- **US3 and US4** are independent (separate Edge Functions, can run in parallel with US1/US2)
- **US5** modifies all Edge Functions (adds preference checks), best done after US1/US2

### Parallel Opportunities

- T003 + T004 (types and config — different files)
- T013 + T017 (setup hook and i18n — different files)
- T038 + T039 (teacher and parent preferences entry points — different route groups)
- US3 (Phase 6) can run in parallel with US1 (Phase 4) since they use different Edge Functions
- US4 (Phase 7) can run in parallel with US3 (Phase 6)

---

## Implementation Strategy

### MVP First (US6 + US1 = Token Registration + Sticker Notification)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (DB + Edge Function + Service — ~2 hours)
3. Complete Phase 3: US6 Token Registration (~1.5 hours)
4. Complete Phase 4: US1 Sticker Notification (~1.5 hours)
5. **STOP and VALIDATE**: Award sticker → student gets push → tap opens stickers screen
6. This is a working MVP demonstrating end-to-end push notifications

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US6 (tokens) + US1 (stickers) → MVP — first working notification
3. US2 (parent notifications) → Parents get child activity updates
4. US3 (homework reminders) → Automated scheduled notifications working
5. US4 (teacher summaries) → Teacher morning prep notifications
6. US5 (preferences) → User control over notifications
7. Polish → Receipt checking, batching, i18n completion

### Parallel Track Strategy

With two developers:
- **Track A**: Phase 1 → Phase 2 → Phase 3 (US6) → Phase 4 (US1) → Phase 5 (US2) → Phase 8 (US5)
- **Track B**: After Phase 2 completes → Phase 6 (US3) → Phase 7 (US4)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- Edge Functions require redeployment after each change (use Supabase MCP deploy tool)
- Push notifications require Development Build — Expo Go will not work
- Physical device required for end-to-end testing
- Database webhooks must be created AFTER Edge Functions are deployed
- pg_cron jobs must be created AFTER Edge Functions are deployed
- All notification content must be localized in both EN and AR
