# Tasks: Realtime Updates

**Input**: Design documents from `/specs/003-realtime-updates/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated. Manual two-device testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Fix existing issue and create feature module structure

- [x] T001 Consolidate QueryClient singleton — import the configured client from `src/lib/queryClient.ts` into `app/_layout.tsx` instead of creating a separate instance inline (see research.md §R-006). Remove the duplicate `new QueryClient()` in `_layout.tsx` and use the shared singleton that has `staleTime: 5min`, `gcTime: 10min`, `retry: 2`
- [x] T002 Create the realtime feature directory structure under `src/features/realtime/` with subdirectories: `hooks/`, `config/`, `utils/`, `types/`
- [x] T003 [P] Define TypeScript interfaces in `src/features/realtime/types/realtime.types.ts` — implement `SubscriptionConfig`, `RoleSubscriptionProfile`, `RealtimeStatus`, and `PostgresChangesEvent` types per contracts/subscription-hooks.ts. Use `readonly` arrays for query keys. No `any` types.

---

## Phase 2: Foundational (Core Subscription Infrastructure)

**Purpose**: Build the reusable subscription engine that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Implement mutation tracker utility in `src/features/realtime/utils/mutation-tracker.ts` — a singleton `Map<string, number>` keyed by `table:recordId` with value as `Date.now()`. Implement `record(table, recordId)`, `isDuplicate(table, recordId)` (returns true if entry exists and is <2000ms old), and `prune()` (removes entries >5000ms old, called on each `isDuplicate` check). Export as a module-level singleton, not a class. Per contracts/subscription-hooks.ts §MutationTrackerContract
- [x] T005 [P] Implement debounced invalidation utility in `src/features/realtime/utils/debounce.ts` — export a `createDebouncedInvalidator(queryClient, debounceMs)` function that returns a handler. The handler accepts an array of query key arrays and coalesces multiple calls within `debounceMs` into a single `invalidateQueries` batch. Use `setTimeout`/`clearTimeout`. The timer resets on each new event (trailing-edge debounce). Return a cleanup function that clears the pending timer
- [x] T006 [P] Create event-to-query-key mapping config in `src/features/realtime/config/event-query-map.ts` — define a `getQueryKeysForEvent(table, eventType, payload)` function that returns the query keys to invalidate. Implement mappings for all 8 tables per research.md §R-008: `student_stickers` → `['student-stickers', studentId]`, `['student-dashboard', studentId]`, `['leaderboard']`; `attendance` → `['attendance']`, `['class-attendance']`, `['attendance-calendar']`, `['attendance-rate']`, `['admin-dashboard']`, `['parent-dashboard']`, `['student-dashboard']`; `sessions` → `['sessions']`, `['student-dashboard', studentId]`, `['teacher-dashboard']`; `students` → `['students']`, `['student-dashboard']`, `['leaderboard']`, `['children']`, `['child-detail']`; `homework` → `['homework']`, `['student-dashboard']`; `student_trophies` → `['student-trophies', studentId]`, `['student-dashboard', studentId]`; `student_achievements` → `['student-achievements', studentId]`, `['student-dashboard', studentId]`; `classes` → `['classes']`, `['admin-dashboard']`, `['teacher-dashboard']`. Extract IDs from `payload.new` when available (may be `{}` if RLS blocks — fall back to broad invalidation without specific IDs)
- [x] T007 Implement core `useRealtimeSubscription` hook in `src/features/realtime/hooks/useRealtimeSubscription.ts` — accepts a `RoleSubscriptionProfile` and returns `RealtimeStatus`. Inside a `useEffect` keyed on `profile.channelName`: (1) create channel via `supabase.channel(profile.channelName)`, (2) for each subscription in `profile.subscriptions`, chain `.on('postgres_changes', { event, schema: 'public', table, filter }, handler)`, (3) call `.subscribe(statusCallback)`. The handler: checks `mutationTracker.isDuplicate` → if not duplicate, calls `getQueryKeysForEvent` → passes keys to the debounced invalidator (created with `profile.debounceMs`). The status callback: on `SUBSCRIBED`, invalidate all query keys across all subscriptions (catch-up refetch per research.md §R-002.6); on `CHANNEL_ERROR`/`TIMED_OUT`, log warning and update `RealtimeStatus.lastError`. Cleanup: call `supabase.removeChannel(channel)` and the debounce cleanup function. Track `isConnected`, `lastError`, `lastEventAt` in `useRef` state returned as `RealtimeStatus`
- [x] T008 [P] Implement `useRealtimeReconnect` hook in `src/features/realtime/hooks/useRealtimeReconnect.ts` — sets up three integrations: (1) `AppState.addEventListener('change', ...)` — on transition from inactive/background → active, call `supabase.getChannels()` and re-subscribe any channels, then `queryClient.invalidateQueries()` to refetch all stale queries; (2) `focusManager.setFocused(status === 'active')` for TanStack Query's built-in stale refetch on foreground; (3) `onlineManager.setEventListener(...)` using network state detection (check if `expo-network` is available, otherwise use `NetInfo`). Cleanup all listeners on unmount. Call this hook once at the app root
- [x] T009 Implement `useRealtimeManager` hook in `src/features/realtime/hooks/useRealtimeManager.ts` — reads `profile` from `useAuthStore()` to get `role`, `school_id`, and `id`. Based on role, fetches additional context needed for the profile builder: student → fetch `class_id` from student record; teacher → fetch assigned `class_ids`; parent → fetch linked `child_ids`; admin → uses `school_id` directly. Calls the appropriate `build{Role}Profile()` function from `subscription-profiles.ts` and passes the result to `useRealtimeSubscription`. If profile/role is not yet available (loading state), skip subscription setup. Returns `RealtimeStatus` from the inner hook. Uses `useMemo` to prevent unnecessary re-subscriptions when profile data hasn't changed
- [x] T010 Create barrel export in `src/features/realtime/index.ts` — export `useRealtimeManager`, `useRealtimeReconnect`, `RealtimeStatus` type, and `mutationTracker` (for use in existing mutation hooks)

**Checkpoint**: Core subscription infrastructure is complete. No subscriptions are active yet — role profiles are added per user story.

---

## Phase 3: User Story 1 — Student Sees Sticker Award Live (P1) MVP

**Goal**: When a teacher awards a sticker, the student's dashboard/stickers/leaderboard/trophy-room update within 5 seconds without refresh

**Independent Test**: Two devices — teacher awards sticker, student sees update on dashboard/stickers page within 5 seconds

### Implementation for User Story 1

- [x] T011 [US1] Create student subscription profile builder in `src/features/realtime/config/subscription-profiles.ts` — implement `buildStudentProfile(studentId: string, classId: string | null): RoleSubscriptionProfile`. Channel name: `student-${studentId}`. Debounce: 300ms. Subscriptions: (1) `student_stickers` INSERT filter `student_id=eq.${studentId}`, (2) `attendance` INSERT+UPDATE filter `student_id=eq.${studentId}`, (3) `sessions` INSERT filter `student_id=eq.${studentId}`, (4) `students` UPDATE filter `id=eq.${studentId}`, (5) `homework` INSERT+UPDATE filter `student_id=eq.${studentId}`, (6) `student_trophies` INSERT filter `student_id=eq.${studentId}`, (7) `student_achievements` INSERT filter `student_id=eq.${studentId}`. If `classId` is null (unassigned student), omit class-scoped subscriptions. Query keys per event-query-map.ts
- [x] T012 [US1] Wire `useRealtimeManager()` and `useRealtimeReconnect()` into the authenticated root layout in `app/_layout.tsx` — call both hooks inside the component that renders after authentication is confirmed (where `session` and `profile` are available). `useRealtimeManager` should be called conditionally: only when `profile` is not null. `useRealtimeReconnect` can be called unconditionally (it handles the case where no channels exist). No UI changes — these hooks are invisible
- [x] T013 [P] [US1] Add `mutationTracker.record('student_stickers', data.id)` to `useAwardSticker` onSuccess handler in `src/features/gamification/hooks/useStickers.ts` — import `mutationTracker` from `@/features/realtime`. Add the record call before the existing `invalidateQueries` calls. The `data` object from the mutation response contains the new record's `id`
- [x] T014 [P] [US1] Add `mutationTracker.record('homework', data.id)` to `useCompleteHomework` onSuccess handler in `src/features/homework/hooks/useHomework.ts` — import `mutationTracker` from `@/features/realtime`. Add the record call before existing invalidations

**Checkpoint**: Student sticker award flow is live. Teacher awards sticker → student sees it on dashboard/stickers/leaderboard within 5 seconds. This is the MVP — stop and validate with two-device testing.

---

## Phase 4: User Story 2 — Parent Sees Attendance Update Live (P1)

**Goal**: When an admin marks bulk attendance, the parent's attendance calendar and dashboard update within 5 seconds

**Independent Test**: Two devices — admin marks attendance for a class, parent sees child's calendar update within 5 seconds

### Implementation for User Story 2

- [x] T015 [US2] Add parent subscription profile builder to `src/features/realtime/config/subscription-profiles.ts` — implement `buildParentProfile(parentId: string, childIds: string[]): RoleSubscriptionProfile`. Channel name: `parent-${parentId}`. Debounce: 500ms. If `childIds` is empty, return a profile with zero subscriptions (no channel created). Subscriptions: (1) `attendance` INSERT+UPDATE filter `student_id=in.(${childIds.join(',')})`, (2) `sessions` INSERT filter `student_id=in.(${childIds.join(',')})`, (3) `student_stickers` INSERT filter `student_id=in.(${childIds.join(',')})`, (4) `students` UPDATE filter `id=in.(${childIds.join(',')})`, (5) `homework` INSERT+UPDATE filter `student_id=in.(${childIds.join(',')})`. Query keys per event-query-map.ts. Also invalidate `['parent-dashboard']` and `['child-detail']` for parent-specific views
- [x] T016 [US2] Add `mutationTracker.record('attendance', data.id)` to `useMarkBulkAttendance` onSuccess handler in `src/features/attendance/hooks/useAttendance.ts` — since bulk attendance creates multiple records, iterate over the response array and record each: `data.forEach(record => mutationTracker.record('attendance', record.id))`. Import `mutationTracker` from `@/features/realtime`

**Checkpoint**: Parent attendance flow is live. Admin marks bulk attendance → parent sees child's calendar/dashboard update within 5 seconds.

---

## Phase 5: User Story 3 — Student Sees New Session Evaluation (P2)

**Goal**: When a teacher creates a session, the student's dashboard and session history update within 5 seconds

**Independent Test**: Teacher logs session for student, student sees new session in history within 5 seconds

### Implementation for User Story 3

Note: The student subscription profile (T011) already subscribes to `sessions` INSERT events. This phase only needs mutation tracking for teacher-side session creation.

- [x] T017 [US3] Add `mutationTracker.record('sessions', data.id)` to `useCreateSession` onSuccess handler in `src/features/sessions/hooks/useSessions.ts` — import `mutationTracker` from `@/features/realtime`. Add the record call before existing `invalidateQueries` calls
- [x] T018 [P] [US3] Add `mutationTracker.record('teacher_checkins', data.id)` to `useCheckIn` and `useCheckOut` onSuccess handlers in `src/features/sessions/hooks/useCheckin.ts` — import `mutationTracker` from `@/features/realtime`. Note: teacher_checkins is not subscribed to in realtime (low priority), but adding tracker calls is defensive for future extensibility. If the import is the first from `@/features/realtime` in this file, ensure the path alias resolves correctly

**Checkpoint**: Student session evaluation flow is live. Teacher creates session → student sees it in session history and dashboard within 5 seconds.

---

## Phase 6: User Story 4 — Teacher Dashboard Live Updates (P2)

**Goal**: When an admin changes class/student assignments, the teacher's dashboard and student list update within 5 seconds

**Independent Test**: Admin assigns student to teacher's class, teacher sees student appear in their list within 5 seconds

### Implementation for User Story 4

- [x] T019 [US4] Add teacher subscription profile builder to `src/features/realtime/config/subscription-profiles.ts` — implement `buildTeacherProfile(teacherId: string, schoolId: string, classIds: string[]): RoleSubscriptionProfile`. Channel name: `teacher-${teacherId}`. Debounce: 500ms. If `classIds` is empty, return a profile with zero subscriptions (teacher has no assigned classes). Subscriptions: (1) `students` UPDATE filter `class_id=in.(${classIds.join(',')})`, (2) `sessions` INSERT filter `school_id=eq.${schoolId}`, (3) `student_stickers` INSERT — no direct filter (RLS enforces school scope; `student_stickers` has no `school_id` column per data-model.md note), (4) `attendance` INSERT+UPDATE filter `school_id=eq.${schoolId}`, (5) `classes` UPDATE filter `teacher_id=eq.${teacherId}`. Query keys: `['students']`, `['leaderboard']`, `['top-performers']`, `['needs-support']`, `['teacher-dashboard']`, `['sessions']`, `['student-stickers']`, `['attendance']`, `['class-attendance']`, `['classes']`
- [x] T020 [P] [US4] Add `mutationTracker.record('students', data.id)` to `useCreateStudent` and `useUpdateStudent` onSuccess handlers in `src/features/students/hooks/useStudents.ts` — import `mutationTracker` from `@/features/realtime`
- [x] T021 [P] [US4] Add `mutationTracker.record('students', variables.studentId)` to `useAssignStudent` and `useRemoveStudent` onSuccess handlers in `src/features/classes/hooks/useClasses.ts` — these mutations update the student's `class_id` so track against the `students` table. Import `mutationTracker` from `@/features/realtime`

**Checkpoint**: Teacher dashboard live updates work. Admin assigns/removes students → teacher sees changes within 5 seconds.

---

## Phase 7: User Stories 5 & 6 — Admin Dashboard + Concurrent Admin (P3)

**Goal**: Admin dashboard stats update live when teachers log sessions/attendance. Two admins see each other's changes within 5 seconds.

**Independent Test**: (US5) Teacher logs session while admin dashboard is open — session count updates. (US6) Two admin sessions side-by-side — one creates student, other sees it appear.

### Implementation for User Stories 5 & 6

Note: US6 (concurrent admin operations) is inherently handled by the admin subscription profile from US5 — if admin A creates a student, admin B's subscription fires and refreshes the student list.

- [x] T022 [US5] Add admin subscription profile builder to `src/features/realtime/config/subscription-profiles.ts` — implement `buildAdminProfile(schoolId: string): RoleSubscriptionProfile`. Channel name: `admin-${schoolId}`. Debounce: 500ms. Subscriptions: (1) `students` INSERT+UPDATE filter `school_id=eq.${schoolId}`, (2) `sessions` INSERT filter `school_id=eq.${schoolId}`, (3) `attendance` INSERT+UPDATE filter `school_id=eq.${schoolId}`, (4) `student_stickers` INSERT — no direct filter (RLS enforces school scope), (5) `classes` INSERT+UPDATE filter `school_id=eq.${schoolId}`. Query keys: `['students']`, `['admin-dashboard']`, `['sessions']`, `['attendance']`, `['class-attendance']`, `['student-stickers']`, `['classes']`
- [x] T023 [P] [US5] Add `mutationTracker.record('classes', data.id)` to `useCreateClass` and `useUpdateClass` onSuccess handlers in `src/features/classes/hooks/useClasses.ts` — import `mutationTracker` from `@/features/realtime`. Note: `useAssignStudent`/`useRemoveStudent` tracking was already added in T021
- [x] T024 [P] [US5] Add `mutationTracker.record('profiles', data.id)` to `useCreateTeacher` and `useUpdateTeacher` onSuccess handlers in `src/features/teachers/hooks/useTeachers.ts` — import `mutationTracker` from `@/features/realtime`

**Checkpoint**: Admin dashboard is live. Teachers log activity → admin stats update. Two admins see each other's changes. All 6 user stories are functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, robustness, and validation

- [x] T025 Add edge case handling to subscription profile builders in `src/features/realtime/config/subscription-profiles.ts` — for each builder: (1) `buildStudentProfile`: if `classId` is null, return profile without class-scoped leaderboard subscriptions; (2) `buildParentProfile`: if `childIds` array is empty, return profile with empty subscriptions array (manager skips channel creation); (3) `buildTeacherProfile`: if `classIds` array is empty, return profile with empty subscriptions array; (4) validate that `in` filter values don't exceed 100 items (Supabase limit per research.md §R-001)
- [x] T026 [P] Add debug-level logging to `useRealtimeSubscription` in `src/features/realtime/hooks/useRealtimeSubscription.ts` — log channel status transitions (SUBSCRIBING → SUBSCRIBED, errors, timeouts) using `__DEV__` guard so logs are stripped in production. Log format: `[Realtime] ${channelName}: ${status}`. On event received, log table name and event type (not payload, for privacy)
- [x] T027 [P] Verify event-query-map completeness in `src/features/realtime/config/event-query-map.ts` — cross-reference every query key from the existing codebase (per research agent findings: ~50 unique query keys) against the mapping. Ensure parent-specific keys (`parent-dashboard`, `child-detail`) are included in `sessions` and `student_stickers` mappings. Ensure `leaderboard` invalidation includes `classId` parameter where available from payload
- [ ] T028 Run quickstart.md testing checklist — perform all 8 manual tests from `specs/003-realtime-updates/quickstart.md` §Testing Checklist: (1) sticker award two-device, (2) attendance two-device, (3) session log, (4) class assignment, (5) background/foreground, (6) logout cleanup, (7) network disconnect/reconnect, (8) rapid events no flicker

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational phase completion
  - US1 (Phase 3) must complete first (wires hooks into layout)
  - US2–US6 (Phases 4–7) can proceed after US1 in any order
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1, Phase 3)**: Depends on Phase 2 — wires hooks into `_layout.tsx`. **Must be first.**
- **US2 (P1, Phase 4)**: Depends on Phase 2 + T012 from US1 (layout wiring). Can run after US1.
- **US3 (P2, Phase 5)**: Depends on Phase 2 + T012 from US1. Student profile from US1 already covers sessions. Can run in parallel with US2.
- **US4 (P2, Phase 6)**: Depends on Phase 2 + T012 from US1. Can run in parallel with US2/US3.
- **US5+US6 (P3, Phase 7)**: Depends on Phase 2 + T012 from US1. Can run in parallel with US2–US4.

### Within Each Phase

- Tasks marked [P] within a phase can run in parallel
- Non-[P] tasks must run sequentially in order listed
- T007 (core hook) depends on T004, T005, T006 (utilities it uses)
- T009 (manager) depends on T007 (core hook it delegates to)

### Parallel Opportunities

```
Phase 2: T004 ─┐
         T005 ─┼──→ T007 ──→ T009 ──→ T010
         T006 ─┘         T008 ─┘
                      (parallel)

Phase 3: T011 ──→ T012
         T013 ─┐ (parallel, independent files)
         T014 ─┘

Phases 4–7: Can overlap once US1 layout wiring (T012) is done
```

---

## Parallel Example: User Story 1

```bash
# After T011 completes (student profile), these can run in parallel:
Task T013: "Add mutationTracker to useAwardSticker in src/features/gamification/hooks/useStickers.ts"
Task T014: "Add mutationTracker to useCompleteHomework in src/features/homework/hooks/useHomework.ts"

# T012 (wire into layout) can also run in parallel with T013/T014
# since it modifies app/_layout.tsx while T013/T014 modify feature hook files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T011–T014)
4. **STOP and VALIDATE**: Two-device test — teacher awards sticker, student sees it live
5. If working: proceed to remaining stories

### Incremental Delivery

1. Setup + Foundational → Core engine ready
2. Add US1 (student stickers) → Test → MVP live
3. Add US2 (parent attendance) → Test → Two P1 stories live
4. Add US3 (student sessions) → Test → Session flow live
5. Add US4 (teacher dashboard) → Test → Teacher flow live
6. Add US5+US6 (admin) → Test → All roles live
7. Polish → Edge cases, logging, full validation

### Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 3 | 1 |
| Phase 2: Foundational | 7 | 3 |
| Phase 3: US1 (P1 MVP) | 4 | 2 |
| Phase 4: US2 (P1) | 2 | 0 |
| Phase 5: US3 (P2) | 2 | 1 |
| Phase 6: US4 (P2) | 3 | 2 |
| Phase 7: US5+US6 (P3) | 3 | 2 |
| Phase 8: Polish | 4 | 2 |
| **Total** | **28** | **13** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [USn] label maps task to specific user story for traceability
- No new database tables, migrations, or RPC functions needed
- All subscription filtering relies on existing RLS policies + Supabase Realtime server-side enforcement
- `student_stickers` has no `school_id` column — teacher/admin subscriptions omit filters on this table and rely on RLS for school-scoping (documented in data-model.md)
- Debounce values: 300ms for student (real-time-sensitive), 500ms for teacher/parent/admin (dashboard views) — resolves spec §FR-004 vs research §R-002 discrepancy in favor of per-role values
- The spec says no toasts/notifications for realtime events (FR-019) — no i18n strings needed for this feature
