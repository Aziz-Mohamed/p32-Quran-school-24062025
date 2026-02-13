# Feature Specification: Realtime Updates

**Feature Branch**: `003-realtime-updates`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Realtime updates — live sync for sticker awards, attendance changes, session logging, and dashboard data using Supabase Realtime subscriptions with TanStack Query cache invalidation

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Sees Sticker Award Live (Priority: P1)

A student is viewing their dashboard or stickers page. Meanwhile, their teacher awards them a sticker from the award screen. Within seconds, the student's screen updates to show the new sticker, updated point total, and (if applicable) a new level or achievement — all without the student needing to pull-to-refresh or navigate away and back.

**Why this priority**: This is the most impactful realtime interaction in the app. Sticker awards are the primary engagement mechanic, and seeing a reward appear live creates a moment of delight. The PRD explicitly calls out "Teacher awards a sticker → Student sees it live on dashboard" as the canonical realtime use case. It also exercises the full pipeline: database change → subscription event → cache invalidation → UI re-render.

**Independent Test**: Can be tested with two devices — one logged in as a teacher, one as a student in the same class. Award a sticker on the teacher device and observe the student device updating within 5 seconds without manual interaction.

**Acceptance Scenarios**:

1. **Given** a student is viewing their dashboard, **When** a teacher awards them a sticker, **Then** the dashboard's sticker count, total points, and recent achievements section update within 5 seconds without the student refreshing.
2. **Given** a student is viewing their stickers collection page, **When** a teacher awards them a sticker, **Then** the new sticker appears in the grid within 5 seconds.
3. **Given** a student earns enough points from a sticker award to cross a level threshold, **When** the sticker is awarded, **Then** the student's displayed level updates to the new level within 5 seconds.
4. **Given** a student is on the leaderboard screen, **When** any student in the class earns points (via sticker, session, or homework), **Then** the leaderboard rankings update within 5 seconds.
5. **Given** a student is on the trophy room screen, **When** a trophy or achievement is auto-awarded to them (triggered by a stats update), **Then** the newly earned trophy/achievement appears within 5 seconds.

---

### User Story 2 - Parent Sees Attendance Update Live (Priority: P1)

A parent is viewing their child's attendance calendar or the parent dashboard. An admin marks bulk attendance for the child's class. The parent's view updates to reflect the new attendance status — the calendar day changes color and the attendance rate adjusts — without requiring the parent to refresh.

**Why this priority**: The PRD explicitly identifies "Admin marks attendance → Parent sees update" as a key realtime scenario. Attendance is the most time-sensitive data for parents (they want to confirm their child arrived at school today), and seeing it appear live builds trust in the system.

**Independent Test**: Can be tested with two devices — one as admin marking attendance, one as a parent viewing their child's calendar. Mark the child present and observe the parent's calendar updating within 5 seconds.

**Acceptance Scenarios**:

1. **Given** a parent is viewing their child's attendance calendar, **When** an admin marks the child present/absent/late/excused for today, **Then** the calendar day updates with the correct color code within 5 seconds.
2. **Given** a parent is viewing the parent dashboard, **When** an admin marks attendance for any of the parent's children, **Then** the child's card on the dashboard reflects the updated status within 5 seconds.
3. **Given** a parent is viewing an attendance calendar, **When** an admin changes a previously marked attendance status (e.g., absent → excused), **Then** the calendar day color updates to reflect the new status within 5 seconds.

---

### User Story 3 - Student Sees New Session Evaluation Live (Priority: P2)

A student is viewing their dashboard or session history. A teacher creates a new session evaluation for them. The student's view updates to show the new session entry, updated scores, and any resulting point changes without manual refresh.

**Why this priority**: Session evaluations are the core data event in the app, feeding points, levels, and streaks. While slightly less "delightful" than a surprise sticker, students still benefit from seeing feedback immediately after a teacher logs it. This is P2 because sessions are typically logged after the student has left, so the student is less likely to be actively watching their screen at the exact moment.

**Independent Test**: Can be tested with a teacher logging a session for a student while the student's device shows their dashboard. Verify the session appears in history and points update within 5 seconds.

**Acceptance Scenarios**:

1. **Given** a student is viewing their session history, **When** a teacher creates a session for them, **Then** the new session appears at the top of the list within 5 seconds.
2. **Given** a student is viewing their dashboard, **When** a teacher creates a session for them, **Then** the dashboard's points total and session count update within 5 seconds.
3. **Given** a student is viewing their dashboard, **When** a teacher logs a session that includes homework, **Then** the homework card appears or updates on the dashboard within 5 seconds.

---

### User Story 4 - Teacher Dashboard Live Updates (Priority: P2)

A teacher is viewing their dashboard. Another event occurs that affects their view — for example, an admin assigns a new student to their class, or the teacher's own session-creation is reflected on the dashboard count. The dashboard updates its statistics (sessions logged today, students seen) without a manual refresh.

**Why this priority**: Teachers benefit from a live dashboard that accurately reflects the current day's activity. However, teachers are usually the ones creating data (sessions, stickers), so they see updates from their own mutations already. The main value is seeing admin actions (student/class changes) reflected live. This is P2 because it's a convenience rather than a moment-of-delight scenario.

**Independent Test**: Can be tested by having an admin add a student to a teacher's class while the teacher views their dashboard. The student count should update within 5 seconds.

**Acceptance Scenarios**:

1. **Given** a teacher is viewing their dashboard, **When** an admin assigns a new student to their class, **Then** the teacher's student count and student list update within 5 seconds.
2. **Given** a teacher is viewing their student list, **When** an admin removes a student from their class, **Then** the student disappears from the list within 5 seconds.
3. **Given** a teacher is viewing their dashboard, **When** an admin changes the teacher's class assignment, **Then** the dashboard refreshes to show data for the new class within 5 seconds.

---

### User Story 5 - Admin Dashboard Live Statistics (Priority: P3)

An admin is viewing their dashboard. As teachers log sessions, mark attendance, or award stickers throughout the day, the admin dashboard's quick stats (today's attendance rate, sessions logged today) update in near-real-time without requiring the admin to refresh.

**Why this priority**: Admin dashboards aggregate data across the whole school. While having live stats is useful, admins typically check the dashboard periodically rather than watching it continuously. The existing 5-minute cache with pull-to-refresh is adequate for most admin workflows. This is P3 because the marginal benefit of live admin stats is lower than the other scenarios.

**Independent Test**: Can be tested by having a teacher log a session while the admin dashboard is open. Verify the session count or attendance rate updates within 5 seconds.

**Acceptance Scenarios**:

1. **Given** an admin is viewing their dashboard, **When** a teacher logs a new session, **Then** the "sessions today" count increments within 5 seconds.
2. **Given** an admin is viewing their dashboard, **When** bulk attendance is submitted (by the admin themselves or another admin), **Then** the attendance rate updates within 5 seconds.
3. **Given** an admin is viewing the students list, **When** another admin creates a new student, **Then** the new student appears in the list within 5 seconds.

---

### User Story 6 - Concurrent Admin Operations (Priority: P3)

Two admins are managing the same school simultaneously. When one admin creates a student, edits a class, or marks attendance, the other admin's view updates to reflect the change. This prevents conflicts such as both admins trying to add the same student or marking attendance for the same class without seeing each other's work.

**Why this priority**: Multi-admin concurrency is important for larger schools but relatively rare in the target user base (most schools have 1-2 admins). The risk of data conflicts is low, and the existing optimistic-update-with-refetch pattern handles most cases. This is P3 as a nice-to-have rather than essential.

**Independent Test**: Can be tested with two admin sessions open side-by-side. One admin creates a class; the other admin sees it appear. One admin marks attendance for a class; the other admin sees those records already marked.

**Acceptance Scenarios**:

1. **Given** two admins are viewing the students list, **When** one admin creates a new student, **Then** the other admin's list updates to include the new student within 5 seconds.
2. **Given** two admins are on the attendance page for the same class, **When** one admin submits bulk attendance, **Then** the other admin sees the attendance statuses update within 5 seconds.
3. **Given** an admin is viewing a class detail, **When** another admin edits that class (name, teacher, schedule), **Then** the first admin's view updates within 5 seconds.

---

### Edge Cases

1. **User not on an affected screen**: When a realtime event occurs but the user is on an unrelated screen (e.g., profile page), the event is still processed — the relevant query cache is invalidated so data is fresh when the user navigates to the affected screen. No UI toast or alert is shown for background events.
2. **Subscription disconnects**: When the device loses network connectivity, the realtime subscription disconnects. The app continues to show the last known data. When connectivity is restored, the subscription automatically reconnects. Upon reconnection, all visible queries are refetched to catch any events missed during the disconnection.
3. **Rapid successive events**: When multiple events arrive within a short window (e.g., admin marking attendance for 20 students in quick succession), the system debounces cache invalidations. Multiple events for the same query key within a 1-second window are coalesced into a single refetch to avoid excessive network requests and UI flicker.
4. **User logs out while subscription is active**: When a user logs out, all active realtime subscriptions are cleaned up (channels unsubscribed). No orphan subscriptions persist. On login, new subscriptions are established for the new user's context.
5. **School-scoping of events**: The subscription must only deliver events for the user's own school. A sticker awarded in School A must not trigger a refetch for a student in School B.
6. **App backgrounded**: When the app is sent to the background, subscriptions may disconnect (OS behavior). On foregrounding, the app checks subscription status and reconnects if needed, followed by a refetch of visible queries.
7. **User's own mutations**: When a user performs a mutation (e.g., teacher awards a sticker), the existing TanStack Query `onSuccess` invalidation handles the immediate UI update. The realtime event for their own mutation is received but should not trigger a redundant refetch. A deduplication window (same table + same record within 2 seconds of a local mutation) prevents double refetches.
8. **High-frequency tables**: If a table receives very frequent changes (e.g., attendance during a morning check-in rush across many classes), the subscription filters ensure only relevant events are processed (matching the user's class or student scope). School-wide unfiltered subscriptions on high-frequency tables are avoided.
9. **Stale subscription after role/class change**: If a teacher's class assignment changes while they are using the app, the subscription scope becomes stale. The realtime system re-establishes subscriptions when the user's profile or class context changes (detected via query invalidation of the profile/classes queries).
10. **Multiple tabs/devices**: If a user is logged in on multiple devices, each device maintains its own subscription. Events are delivered to all active sessions independently.

## Requirements *(mandatory)*

### Functional Requirements

**Subscription Lifecycle**

- **FR-001**: System MUST establish realtime subscriptions when a user authenticates and navigates to a subscribed screen. Subscriptions are scoped to the user's school.
- **FR-002**: System MUST clean up all active subscriptions when the user logs out, and re-establish subscriptions for the new user on subsequent login.
- **FR-003**: System MUST automatically reconnect subscriptions when the app returns to the foreground or regains network connectivity. Upon reconnection, all visible queries MUST be refetched.
- **FR-004**: System MUST debounce realtime events — multiple events for the same query key arriving within 1 second are coalesced into a single cache invalidation and refetch.
- **FR-005**: System MUST deduplicate realtime events that result from the current user's own mutations. If a local mutation just invalidated a query, an incoming realtime event for the same record within 2 seconds does not trigger an additional refetch.

**Subscribed Data Changes**

- **FR-006**: System MUST subscribe to new sticker awards (`student_stickers` inserts) and invalidate student dashboard, stickers collection, leaderboard, and trophy room queries when a relevant event is received.
- **FR-007**: System MUST subscribe to attendance changes (`attendance` inserts and updates) and invalidate parent dashboard, attendance calendar, and admin dashboard queries when a relevant event is received.
- **FR-008**: System MUST subscribe to new session evaluations (`sessions` inserts) and invalidate student dashboard, session history, and teacher dashboard queries when a relevant event is received.
- **FR-009**: System MUST subscribe to student record changes (`students` updates — specifically points, level, and streak changes) and invalidate leaderboard, student detail, and dashboard queries when a relevant event is received.
- **FR-010**: System MUST subscribe to class assignment changes (`students` updates to `class_id`, `classes` updates to `teacher_id`) and invalidate teacher student lists, class detail, and dashboard queries when a relevant event is received.
- **FR-011**: System MUST subscribe to homework changes (`homework` inserts and updates) and invalidate student dashboard homework cards when a relevant event is received.
- **FR-012**: System MUST subscribe to trophy and achievement awards (`student_trophies` and `student_achievements` inserts) and invalidate trophy room and student dashboard queries when a relevant event is received.

**Event Filtering**

- **FR-013**: System MUST filter subscription events by school scope — events from other schools are not delivered to or processed by the client.
- **FR-014**: For student-role users, subscription events MUST be filtered to only events relevant to that specific student (their own stickers, sessions, attendance, homework, trophies, achievements) and their class (leaderboard changes).
- **FR-015**: For teacher-role users, subscription events MUST be filtered to events relevant to their assigned class(es) — student changes, session logs, attendance, and sticker awards within those classes.
- **FR-016**: For parent-role users, subscription events MUST be filtered to events relevant to their linked children — attendance, sessions, stickers, and homework for those specific students.
- **FR-017**: For admin-role users, subscription events are school-wide (all student, teacher, class, attendance, and session changes within the school).

**User Experience**

- **FR-018**: Realtime updates MUST be seamless — no full-screen loading states, flickers, or scroll position resets when data updates in the background. Updated data merges into the existing view.
- **FR-019**: System MUST NOT show toast notifications or alerts for realtime data changes. Updates appear silently in the UI. Celebratory moments (sticker received, trophy earned) are deferred to a future notification feature.
- **FR-020**: Existing pull-to-refresh functionality MUST continue to work alongside realtime subscriptions. Pull-to-refresh forces a full refetch regardless of subscription state.

### Non-Functional Requirements

- **NFR-001**: Realtime events MUST propagate to the user's screen within 5 seconds of the database change, measured end-to-end (database write → UI update) under normal network conditions.
- **NFR-002**: The subscription system MUST NOT degrade app performance. Subscription processing (event handling, debouncing, cache invalidation) should add no perceptible delay to UI interactions.
- **NFR-003**: The system MUST handle graceful degradation — if the realtime service is temporarily unavailable, the app continues to function normally using the existing polling/cache strategy (5-minute staleTime). No error is shown to the user.
- **NFR-004**: Subscription connections MUST use the authenticated user's JWT for authorization, ensuring server-side enforcement that users only receive events they are permitted to see.

### Key Entities

- **Subscription Channel**: A named realtime connection scoped to a specific table and filter criteria (e.g., school_id, student_id). Each channel listens for INSERT, UPDATE, or DELETE events and maps them to query cache invalidation actions.
- **Subscription Scope**: The set of filter criteria that determines which events a user receives. Varies by role: student (own records + class), teacher (assigned classes), parent (linked children), admin (entire school).
- **Event-to-Query Mapping**: A configuration that defines which query keys should be invalidated when an event is received on a given table. This is the bridge between the realtime event and the UI update.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a teacher awards a sticker, the student's dashboard reflects the new sticker, updated points, and (if applicable) new level within 5 seconds — verified with two devices side by side.
- **SC-002**: When an admin marks bulk attendance, a parent viewing their child's attendance calendar sees the updated status within 5 seconds.
- **SC-003**: The app maintains stable performance (no frame drops below 30fps, no memory leaks) with realtime subscriptions active over a 30-minute session.
- **SC-004**: After a network disconnection and reconnection, the app resumes receiving realtime events within 10 seconds and refetches all stale data automatically.
- **SC-005**: Realtime subscriptions do not cause unnecessary battery drain — the app's background power usage does not increase measurably compared to the pre-realtime version.
- **SC-006**: During a "morning rush" scenario (20 students marked present in rapid succession), the parent's attendance calendar updates correctly and the app does not show flickering or intermediate states.
- **SC-007**: Pull-to-refresh continues to work on all screens regardless of subscription state.

## Assumptions

- **A-001**: Supabase Realtime's postgres_changes feature is used for all subscriptions. The system subscribes to database changes on specific tables with filter criteria. No custom Broadcast or Presence features are needed for this feature.
- **A-002**: Subscription filters (e.g., `school_id=eq.{schoolId}`) are applied server-side, so the client does not receive events from other schools. Row-level security further enforces this.
- **A-003**: The number of concurrent subscriptions per user is kept small (estimated 3-6 channels depending on role). This is well within per-connection limits.
- **A-004**: Realtime events trigger query cache invalidation (not direct state mutation). The actual data refetch uses the existing service/query layer, ensuring data consistency and reusing existing error handling.
- **A-005**: No pre-aggregation or denormalization is needed. Realtime events on source tables (student_stickers, attendance, sessions) trigger refetches of the same queries the UI already uses.
- **A-006**: The subscription system is additive — it enhances the existing data flow without replacing it. If subscriptions fail or are unavailable, the app falls back to the existing 5-minute staleTime polling model.
- **A-007**: Celebratory UI for receiving stickers/trophies live (confetti, pop-ups, sound effects) is explicitly out of scope. Updates appear as silent data refreshes. A future "live notifications" feature may add in-app celebration moments.
- **A-008**: Supabase Realtime requires the `replication` role on subscribed tables. This is enabled by default for all tables in the public schema on Supabase-hosted projects.
- **A-009**: The 1-second debounce window for event coalescing is a starting point. It can be tuned per table if needed without spec changes.
- **A-010**: Report data (admin reports, teacher class progress, parent child progress) is NOT subscribed to in realtime. Reports are analytical views with a 5-minute cache that is acceptable as-is per the reports spec (A-012).

## Scope Boundaries

### In Scope
- Realtime subscriptions for student sticker awards
- Realtime subscriptions for attendance changes
- Realtime subscriptions for session evaluations
- Realtime subscriptions for student stat changes (points, level, streak)
- Realtime subscriptions for class/student assignment changes
- Realtime subscriptions for homework changes
- Realtime subscriptions for trophy and achievement awards
- Role-based subscription filtering (student, teacher, parent, admin)
- Subscription lifecycle management (connect, reconnect, cleanup)
- Event debouncing and deduplication
- Graceful degradation when realtime is unavailable

### Out of Scope
- In-app celebration UI for sticker/trophy moments (future notification feature)
- Push notifications for offline users (separate Phase 2 feature)
- Realtime updates for report/analytics data
- Supabase Realtime Presence (online/offline indicators)
- Supabase Realtime Broadcast (custom message passing)
- Typing indicators or live collaboration features
- Realtime for lesson progress changes (low frequency, not time-sensitive)
- Custom WebSocket implementation (uses Supabase SDK's built-in realtime)
