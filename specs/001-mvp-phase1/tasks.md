# Tasks: Quran School MVP (Phase 1)

**Input**: Design documents from `/specs/001-mvp-phase1/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md
**Created**: 2026-02-08

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US8) this belongs to
- Exact file paths in descriptions

---

## Phase 1: Setup (Schema & Edge Functions)

**Purpose**: Database migration, Edge Functions, and foundational backend changes that MUST exist before any client work.

- [X] T001 [US1] Apply migration `00002_add_username_and_points_triggers` — add `username` column to `profiles`, create unique index `(school_id, username)`, update `handle_new_profile()` to include username, create `handle_session_points()` (with High Scorer achievement check), `handle_homework_points()`, `handle_sticker_points()`, `handle_attendance_points()` (streak tracking + attendance points), and `check_trophy_achievement_awards()` (auto-award trophies/achievements after student stats change) triggers. Seed initial trophies (5) and achievements (3). Apply via Supabase MCP `apply_migration`. SQL defined in `specs/001-mvp-phase1/data-model.md` §Schema Changes Required.
- [X] T002 [US1] Deploy Edge Function `create-school` (EF-001) — public endpoint, creates school + admin auth user + session. Contract in `specs/001-mvp-phase1/contracts/api-contracts.md` §EF-001. Deploy via `supabase/functions/create-school/index.ts`.
- [X] T003 [US1] Deploy Edge Function `create-member` (EF-002) — admin-only, creates student/teacher/parent auth user. Contract in §EF-002. Deploy via `supabase/functions/create-member/index.ts`.
- [X] T004 [US1] Deploy Edge Function `reset-member-password` (EF-003) — admin-only, resets member password. Contract in §EF-003. Deploy via `supabase/functions/reset-member-password/index.ts`.
- [X] T005 Regenerate TypeScript types after migration — run `supabase gen types typescript` and update `src/types/database.types.ts`.

**Checkpoint**: Migration applied (username, 5 trigger functions, trophy/achievement seed data), 3 Edge Functions deployed, types regenerated. Backend ready for client work. Points triggers handle: session (+10/+5), homework (+10/+5), stickers (+value), attendance streaks (+3/+20). Trophy/achievement auto-award fires on student stats change.

---

## Phase 2: Foundational (Shared Client Infrastructure)

**Purpose**: Shared types, services, hooks, and components that multiple user stories depend on. MUST complete before story implementation.

### Auth Refactoring

- [X] T006 [US1] Update auth types — change `LoginInput` from email to `{ username, password, schoolSlug }` in `src/features/auth/auth.types.ts`. Add `buildSyntheticEmail(username, schoolSlug)` helper.
- [X] T007 [US1] Update auth service — modify `login()` in `src/features/auth/auth.service.ts` to build synthetic email internally and call `signInWithPassword`. Add `createSchool()` wrapper that calls the `create-school` Edge Function. Add `createMember()` and `resetMemberPassword()` wrappers for admin Edge Functions.
- [X] T008 [US1] Update auth store — update `src/stores/authStore.ts` to store `schoolSlug` in AsyncStorage for login persistence. Ensure profile includes `username`.

### Shared Feature Scaffolding

- [X] T009 [P] Create shared service types — create `src/types/common.ts` with shared interfaces: `PaginatedResult<T>`, `ServiceResult<T>`, `MutationResult<T>`, filter base types.
- [X] T010 [P] Create shared form components — create reusable form inputs in `src/components/forms/`: `TextInput`, `ScoreInput` (1-5 rating), `DatePicker`, `Select`, `MultiSelect`. Use `react-hook-form` + `zod`.
- [X] T011 [P] Create shared feedback components — create `src/components/feedback/`: `EmptyState` (icon + message + optional action), `ErrorState`, `LoadingState`, `ConfirmDialog`.
- [X] T012 [P] Create shared list components — create `src/components/lists/`: `SearchableList` (search bar + FlashList), `FilterChips`.
- [X] T013 [P] Create username generator utility — create `src/lib/username.ts` with `generateUsername(fullName): string` per contract SM-004. Pure function: lowercase, remove spaces, append `_` + 3 random digits (100-999).

### Feature Module Scaffolding

- [X] T014 [P] Scaffold dashboard feature — create `src/features/dashboard/` with `index.ts`, `types/dashboard.types.ts`, empty service files for each role dashboard (student, teacher, parent, admin).
- [X] T015 [P] Scaffold sessions feature — create `src/features/sessions/` with `index.ts`, `types/sessions.types.ts`, empty `sessions.service.ts`, `checkin.service.ts`.
- [X] T016 [P] Scaffold students feature — create `src/features/students/` with `index.ts`, `types/students.types.ts`, empty `students.service.ts`.
- [X] T017 [P] Scaffold classes feature — create `src/features/classes/` with `index.ts`, `types/classes.types.ts`, empty `classes.service.ts`.
- [X] T018 [P] Scaffold gamification feature — create `src/features/gamification/` with `index.ts`, `types/gamification.types.ts`, empty `gamification.service.ts`.
- [X] T019 [P] Scaffold attendance feature — create `src/features/attendance/` with `index.ts`, `types/attendance.types.ts`, empty `attendance.service.ts`.
- [X] T020 [P] Scaffold homework feature — create `src/features/homework/` with `index.ts`, `types/homework.types.ts`, empty `homework.service.ts`.
- [X] T021 [P] Scaffold lessons feature — create `src/features/lessons/` with `index.ts`, `types/lessons.types.ts`, empty `lessons.service.ts`.
- [X] T022 [P] Scaffold children feature — create `src/features/children/` with `index.ts`, `types/children.types.ts`, empty `children.service.ts`.
- [X] T023 [P] Scaffold profile feature — create `src/features/profile/` with `index.ts`, `types/profile.types.ts`, empty `profile.service.ts`.
- [X] T024 [P] Update `src/lib/constants.ts` — verify levels array matches 10-level seed data. Update points table constants per FR-031.

**Checkpoint**: Foundation ready — auth refactored, shared components created, feature modules scaffolded. Story implementation can begin.

---

## Phase 3: User Story 1 — School Creation, Login & Role Routing (Priority: P1)

**Goal**: A user can create a school (becoming admin), or log in with username/password and be routed to their role-specific dashboard.

**Independent Test**: Create school -> admin dashboard loads. Admin creates accounts for each role -> each logs in to correct dashboard.

### Auth Screens

- [X] T025 [US1] Rewrite login screen — replace `app/(auth)/login.tsx` with username + password + school slug fields. School slug remembered via AsyncStorage. Call `authService.login()`. Route to role dashboard on success. Handle errors (invalid credentials, network).
- [X] T026 [US1] Create school creation screen — replace `app/(auth)/register.tsx` with `app/(auth)/create-school.tsx`. Fields: school name, admin full name, username, password. Call `create-school` Edge Function. Route to admin dashboard on success.
- [X] T027 [US1] Remove forgot-password screen — delete `app/(auth)/forgot-password.tsx`. Password reset is admin-only (handled in US4).
- [X] T028 [US1] Update auth layout — update `app/(auth)/_layout.tsx` to show "Create a School" and "Login" options.

### Role Routing

- [X] T029 [US1] Implement AuthGuard with role routing — update `app/_layout.tsx` to: check session on mount, redirect unauthenticated to `(auth)`, redirect authenticated users to `/(student)/`, `/(teacher)/`, `/(parent)/`, or `/(admin)/` based on `profile.role`.
- [X] T030 [P] [US1] Create student layout — implement `app/(student)/_layout.tsx` with bottom tab navigator: Dashboard, Lessons, Stickers, Profile.
- [X] T031 [P] [US1] Create teacher layout — implement `app/(teacher)/_layout.tsx` with bottom tab navigator: Dashboard, Students, Sessions, Profile.
- [X] T032 [P] [US1] Create parent layout — implement `app/(parent)/_layout.tsx` with bottom tab navigator: Dashboard, Children, Settings.
- [X] T033 [P] [US1] Create admin layout — implement `app/(admin)/_layout.tsx` with sidebar or tab navigator: Dashboard, Students, Teachers, Classes, Attendance.

### Placeholder Dashboard Screens

- [X] T034 [P] [US1] Create student dashboard placeholder — implement `app/(student)/(tabs)/index.tsx` showing greeting + role label. Will be populated in US3.
- [X] T035 [P] [US1] Create teacher dashboard placeholder — implement `app/(teacher)/(tabs)/index.tsx` showing greeting + role label. Will be populated in US2.
- [X] T036 [P] [US1] Create parent dashboard placeholder — implement `app/(parent)/(tabs)/index.tsx` showing greeting + role label. Will be populated in US6.
- [X] T037 [P] [US1] Create admin dashboard placeholder — implement `app/(admin)/index.tsx` showing greeting + role label. Will be populated in US4.

**Checkpoint**: US1 complete. School creation, login, role routing, and all 4 layout shells work. Test by creating a school, creating accounts via Edge Function (curl/Postman), and logging in with each role.

---

## Phase 4: User Story 2 — Teacher Logs a Session & Awards Stickers (Priority: P1)

**Goal**: A teacher can log sessions with scores, assign homework, and award stickers to students. Points update automatically via DB triggers.

**Independent Test**: Log in as teacher -> create session for student -> verify session saved + points increment. Award sticker -> verify points increment.

### Services

- [X] T038 [US2] Implement sessions service — create `src/features/sessions/sessions.service.ts` with `createSession()`, `getSessions()`, `getSessionById()` per contracts SS-001/SS-002/SS-003.
- [X] T039 [P] [US2] Implement gamification service (sticker operations) — implement `getStickers()`, `getStudentStickers()`, `awardSticker()` in `src/features/gamification/gamification.service.ts` per contracts GS-001/GS-002/GS-003.
- [X] T040 [P] [US2] Implement homework service — implement `getStudentHomework()`, `completeHomework()` in `src/features/homework/homework.service.ts` per contracts HW-001/HW-002.
- [X] T041 [P] [US2] Implement students service (teacher-scoped reads) — implement `getStudents()`, `getStudentById()` in `src/features/students/students.service.ts` per contracts SM-001/SM-002. Teacher sees only class students.

### Hooks

- [X] T042 [US2] Create session hooks — create `src/features/sessions/hooks/useSessions.ts` with `useCreateSession`, `useSessions`, `useSessionById`. TanStack Query mutations with invalidation per contracts.
- [X] T043 [P] [US2] Create sticker hooks — create `src/features/gamification/hooks/useStickers.ts` with `useStickers`, `useStudentStickers`, `useAwardSticker`.
- [X] T044 [P] [US2] Create homework hooks — create `src/features/homework/hooks/useHomework.ts` with `useStudentHomework`, `useCompleteHomework`.
- [X] T045 [P] [US2] Create student list hooks — create `src/features/students/hooks/useStudents.ts` with `useStudents`, `useStudentById`.

### Teacher Dashboard

- [X] T046 [US2] Implement teacher dashboard service — create `src/features/dashboard/teacher-dashboard.service.ts` per contract DS-002. Query today's sessions, students seen, total students, recent sessions, checkin.
- [X] T047 [US2] Implement teacher dashboard screen — update `app/(teacher)/(tabs)/index.tsx`: show today's stats (sessions, students seen), quick actions (Log Session, Award Sticker), recent sessions list.

### Teacher Screens

- [X] T048 [US2] Create session creation screen — implement `app/(teacher)/sessions/create.tsx` with form: student select, date picker, lesson select (optional), 3 score inputs (1-5), notes, optional homework (description + due date). Uses `useCreateSession` hook.
- [X] T049 [US2] Create session list screen — implement `app/(teacher)/(tabs)/sessions.tsx` showing teacher's sessions sorted by date. Tap to view detail.
- [X] T050 [US2] Create session detail screen — implement `app/(teacher)/sessions/[id].tsx` showing full session data with scores, notes, homework status.
- [X] T051 [US2] Create teacher student list screen — implement `app/(teacher)/(tabs)/students.tsx` with searchable list of students in teacher's classes. Uses `useStudents` hook.
- [X] T052 [US2] Create award sticker screen — implement `app/(teacher)/awards/index.tsx` with student select, sticker grid picker, optional reason field. Uses `useAwardSticker` hook.

**Checkpoint**: US2 complete. Teacher can create sessions, award stickers, view session history. Points update via DB triggers.

---

## Phase 5: User Story 3 — Student Views Progress & Gamification (Priority: P1)

**Goal**: Student sees their dashboard with level/progress, browses lessons, views session history, sticker collection, trophy room, and leaderboard.

**Independent Test**: Log in as student with session history -> verify dashboard data, lesson list, session history, sticker grid, trophy room, leaderboard.

### Services

- [X] T053 [US3] Implement student dashboard service — create `src/features/dashboard/student-dashboard.service.ts` per contract DS-001. Query student data, level, homework, achievements, attendance, counts.
- [X] T054 [P] [US3] Implement lesson service — implement `getLessons()`, `getLessonProgress()`, `updateLessonProgress()` in `src/features/lessons/lessons.service.ts` per contracts LS-001/LS-002/LS-003.
- [X] T055 [P] [US3] Implement leaderboard service — implement `getLeaderboard()` in `src/features/gamification/gamification.service.ts` per contract GS-004. Support weekly (rolling 7-day) and all-time views.
- [X] T056 [P] [US3] Implement trophy/achievement services — implement `getStudentTrophies()`, `getStudentAchievements()`, `getLevels()` in `src/features/gamification/gamification.service.ts` per contracts GS-005/GS-006/GS-007.

### Hooks

- [X] T057 [US3] Create student dashboard hook — create `src/features/dashboard/hooks/useStudentDashboard.ts` with `useStudentDashboard` query.
- [X] T058 [P] [US3] Create lesson hooks — create `src/features/lessons/hooks/useLessons.ts` with `useLessons`, `useLessonProgress`, `useUpdateLessonProgress`.
- [X] T059 [P] [US3] Create leaderboard hook — create `src/features/gamification/hooks/useLeaderboard.ts` with `useLeaderboard(classId, period)`.
- [X] T060 [P] [US3] Create trophy/achievement hooks — create `src/features/gamification/hooks/useTrophies.ts` with `useStudentTrophies`, `useStudentAchievements`, `useLevels`.

### Student Screens

- [X] T061 [US3] Implement student dashboard screen — update `app/(student)/(tabs)/index.tsx`: greeting with name + level, progress overview, current homework with due date, quick actions, recent achievements.
- [X] T062 [US3] Create lessons tab screen — implement `app/(student)/(tabs)/lessons.tsx` showing lessons grouped by status (not started, in progress, completed) with title, surah/ayah range, type, progress bar.
- [X] T063 [US3] Create lesson detail screen — implement `app/(student)/lessons/[id].tsx` showing lesson details + progress.
- [X] T064 [US3] Create session history screen — implement `app/(student)/sessions/index.tsx` showing past sessions sorted by date with teacher name, scores, notes.
- [X] T065 [US3] Create session detail screen — implement `app/(student)/sessions/[id].tsx` showing full session with scores.
- [X] T066 [US3] Implement stickers tab screen — update `app/(student)/(tabs)/stickers.tsx` showing sticker grid with collected/locked states, total count.
- [X] T067 [US3] Create trophy room screen — implement `app/(student)/trophy-room.tsx` showing earned trophies prominently + locked trophies with criteria and progress.
- [X] T068 [US3] Create leaderboard screen — implement `app/(student)/leaderboard.tsx` showing top 10 + own rank with weekly/all-time toggle.

**Checkpoint**: US3 complete. Student sees full dashboard, lessons, sessions, stickers, trophies, leaderboard. All P1 stories done.

---

## Phase 6: User Story 4 — Admin Manages School Operations (Priority: P2)

**Goal**: Admin performs CRUD on students, teachers, and classes with username auto-generation and school-scoped data.

**Independent Test**: Admin creates teacher, class, student (with auto-generated username) -> assigns student to class -> verifies all records.

### Services

- [X] T069 [US4] Implement admin dashboard service — create `src/features/dashboard/admin-dashboard.service.ts` per contract DS-004. Query total students, teachers, classes, today's attendance rate.
- [X] T070 [P] [US4] Implement student management service (admin CRUD) — add `updateStudent()` to `src/features/students/students.service.ts` per contract SM-003. Connect `createMember` Edge Function for student creation.
- [X] T071 [P] [US4] Implement class management service — implement `getClasses()`, `createClass()`, `updateClass()`, `assignStudentToClass()`, `removeStudentFromClass()` in `src/features/classes/classes.service.ts` per contracts CM-001 through CM-005.
- [X] T072 [P] [US4] Create teacher management service — create `src/features/teachers/` module. Implement teacher listing (filtered from profiles where role='teacher') and deactivation. Connect `createMember` Edge Function for teacher creation.

### Hooks

- [X] T073 [US4] Create admin dashboard hook — create `src/features/dashboard/hooks/useAdminDashboard.ts` with `useAdminDashboard`.
- [X] T074 [P] [US4] Create class management hooks — create `src/features/classes/hooks/useClasses.ts` with `useClasses`, `useCreateClass`, `useUpdateClass`, `useAssignStudent`, `useRemoveStudent`.
- [X] T075 [P] [US4] Create teacher management hooks — create `src/features/teachers/hooks/useTeachers.ts` with `useTeachers`, `useCreateTeacher`, `useUpdateTeacher`.

### Admin Screens

- [X] T076 [US4] Implement admin dashboard screen — update `app/(admin)/index.tsx`: stats cards (total students, teachers, classes, today's attendance rate), quick actions.
- [X] T077 [US4] Create student list screen — implement `app/(admin)/students/index.tsx` with searchable list, filter by class/status. Shows name, class, level, status.
- [X] T078 [US4] Create student creation screen — implement `app/(admin)/students/create.tsx`: full name input -> auto-generated username (with refresh button, editable), password input, class select (optional), parent select (optional), date of birth. Calls `createMember` Edge Function.
- [X] T079 [US4] Create student detail screen — implement `app/(admin)/students/[id]/index.tsx`: student profile, class, level, points, parent, actions (edit, deactivate).
- [X] T080 [US4] Create student edit screen — implement `app/(admin)/students/[id]/edit.tsx`: edit class assignment, parent link, active status, date of birth.
- [X] T081 [US4] Create teacher list screen — implement `app/(admin)/teachers/index.tsx` with searchable list. Shows name, assigned classes, status.
- [X] T082 [US4] Create teacher creation screen — implement `app/(admin)/teachers/create.tsx`: full name -> auto-generated username, password, class assignment. Calls `createMember` Edge Function.
- [X] T083 [US4] Create teacher detail screen — implement `app/(admin)/teachers/[id]/index.tsx`: teacher profile, assigned classes, session count, actions.
- [X] T084 [US4] Create teacher edit screen — implement `app/(admin)/teachers/[id]/edit.tsx`: edit assigned classes, active status.
- [X] T085 [US4] Create class list screen — implement `app/(admin)/classes/index.tsx` with searchable list. Shows name, teacher, student count, status.
- [X] T086 [US4] Create class creation screen — implement `app/(admin)/classes/create.tsx`: name, description, teacher select, schedule, max students.
- [X] T087 [US4] Create class detail screen — implement `app/(admin)/classes/[id]/index.tsx`: class info, assigned teacher, student roster with add/remove.
- [X] T088 [US4] Create class edit screen — implement `app/(admin)/classes/[id]/edit.tsx`: edit name, teacher, schedule, max students, active status.
- [X] T089 [US4] Create admin password reset screen — implement `app/(admin)/members/reset-password.tsx`: select user, enter new password. Calls `resetMemberPassword` Edge Function.
- [X] T089b [P] [US4] Create sticker catalog management — implement sticker CRUD screens for admin per FR-029b. Add `app/(admin)/stickers/index.tsx` (list), `app/(admin)/stickers/create.tsx` (create: name, image, category, points_value), `app/(admin)/stickers/[id]/edit.tsx` (edit/deactivate). Add sticker management service functions to `src/features/gamification/gamification.service.ts`: `createSticker()`, `updateSticker()`.

**Checkpoint**: US4 complete. Admin can fully manage students, teachers, classes, sticker catalog, and reset passwords.

---

## Phase 7: User Story 5 — Admin Marks Bulk Attendance (Priority: P2)

**Goal**: Admin selects a class and date, marks attendance for all students (present/absent/late/excused) with "mark all present" shortcut.

**Independent Test**: Select class -> mark all present -> adjust exceptions -> submit -> verify attendance records created.

### Services & Hooks

- [X] T090 [US5] Implement attendance service — implement `markBulkAttendance()`, `getClassAttendance()`, `getAttendanceCalendar()`, `getAttendanceRate()` in `src/features/attendance/attendance.service.ts` per contracts AT-001 through AT-004.
- [X] T091 [US5] Create attendance hooks — create `src/features/attendance/hooks/useAttendance.ts` with `useMarkBulkAttendance`, `useClassAttendance`, `useAttendanceCalendar`, `useAttendanceRate`.

### Admin Attendance Screen

- [X] T092 [US5] Create bulk attendance screen — implement `app/(admin)/attendance/index.tsx`: class selector, date picker, student list with status selectors (present/absent/late/excused), "Mark All Present" button, submit action. Uses upsert for re-submissions per contract AT-001.

**Checkpoint**: US5 complete. Admin can mark attendance for full classes efficiently.

---

## Phase 8: User Story 6 — Parent Monitors Children (Priority: P2)

**Goal**: Parent sees a card per child, taps into detail with sessions/stickers, views attendance calendar and anonymous class standing.

**Independent Test**: Log in as parent linked to students -> verify child cards, detail view, attendance calendar, class standing.

### Services & Hooks

- [X] T093 [US6] Implement children service — implement `getChildren()`, `getChildDetail()`, `getClassStanding()` in `src/features/children/children.service.ts` per contracts CH-001/CH-002/CH-003.
- [X] T094 [US6] Implement parent dashboard service — create `src/features/dashboard/parent-dashboard.service.ts` per contract DS-003. Query children with profile, class, level, recent session, today's attendance.
- [X] T095 [P] [US6] Create children hooks — create `src/features/children/hooks/useChildren.ts` with `useChildren`, `useChildDetail`, `useClassStanding`.
- [X] T096 [P] [US6] Create parent dashboard hook — create `src/features/dashboard/hooks/useParentDashboard.ts` with `useParentDashboard`.

### Parent Screens

- [X] T097 [US6] Implement parent dashboard screen — update `app/(parent)/(tabs)/index.tsx`: card per child showing name, class, level, recent activity.
- [X] T098 [US6] Create child detail screen — implement `app/(parent)/children/[id].tsx`: child profile, level, points, recent sessions with scores, sticker summary.
- [X] T099 [US6] Create attendance calendar screen — implement `app/(parent)/attendance/[childId].tsx`: monthly calendar with color-coded days (green=present, red=absent, yellow=late, blue=excused), overall attendance rate. Uses `react-native-calendars`.
- [X] T100 [US6] Create class standing screen — implement `app/(parent)/class-standing/[childId].tsx`: anonymous leaderboard (ranks only, no names), child's rank highlighted.
- [X] T101 [US6] Create children tab screen — implement `app/(parent)/(tabs)/children.tsx`: list of children, tap to navigate to detail.

**Checkpoint**: US6 complete. All P2 stories done. Parent can monitor all children's progress.

---

## Phase 9: User Story 7 — Teacher Check-in & Student Insights (Priority: P3)

**Goal**: Teacher can check in/out and view student analytics (top performers, needs support) with detailed student profiles.

**Independent Test**: Teacher checks in -> checks out -> views top performers list -> views student detail with history.

### Services & Hooks

- [X] T102 [US7] Implement check-in service — implement `checkIn()`, `checkOut()`, `getTodayCheckin()` in `src/features/sessions/checkin.service.ts` per contracts TC-001/TC-002/TC-003.
- [X] T103 [US7] Create check-in hooks — create `src/features/sessions/hooks/useCheckin.ts` with `useCheckIn`, `useCheckOut`, `useTodayCheckin`.

### Teacher Screens

- [X] T104 [US7] Add check-in/out to teacher dashboard — update `app/(teacher)/(tabs)/index.tsx` to show "Check In" / "Check Out" button based on current checkin state. Uses `useTodayCheckin`, `useCheckIn`, `useCheckOut`.
- [X] T105 [US7] Create top performers screen — implement `app/(teacher)/students/top-performers.tsx`: students ranked by total points or average scores.
- [X] T106 [US7] Create needs support screen — implement `app/(teacher)/students/needs-support.tsx`: students with declining scores or overdue homework.
- [X] T107 [US7] Create teacher student detail screen — implement `app/(teacher)/students/[id].tsx`: performance chart (scores over time), recent sessions, sticker history, attendance record.

**Checkpoint**: US7 complete. Teacher has full check-in/out and student analytics.

---

## Phase 10: User Story 8 — Internationalization EN/AR (Priority: P3)

**Goal**: Full English/Arabic language switching with RTL/LTR layout mirroring. No hardcoded strings.

**Independent Test**: Switch to Arabic -> verify all screens RTL with Arabic text -> switch to English -> verify LTR restored.

- [X] T108 [US8] Complete English translations — audit all screens and populate `src/i18n/en.json` with every user-visible string. Organize by feature module keys.
- [X] T109 [US8] Complete Arabic translations — populate `src/i18n/ar.json` with Arabic translations for all keys in `en.json`.
- [X] T110 [US8] Implement language switcher — add language toggle to profile/settings screens (`app/(student)/(tabs)/profile.tsx`, `app/(parent)/(tabs)/settings.tsx`, etc.). Persist selection via `localeStore` and `AsyncStorage`. Apply i18n change + RTL layout flip on selection.
- [X] T111 [US8] Verify RTL layout across all screens — ensure all screens use logical CSS properties (start/end, not left/right), directional icons flip, `useRTL` hook drives layout. Fix any hardcoded directional styles.
- [X] T112 [US8] Audit for hardcoded strings — scan all screen files for string literals not routed through `t()`. Replace any found.

**Checkpoint**: US8 complete. All P3 stories done. Full EN/AR support with RTL.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories, edge case handling, and final validation.

- [X] T113 [P] Profile screens — implement `app/(student)/(tabs)/profile.tsx` and `app/(teacher)/(tabs)/profile.tsx` with profile view/edit. Uses `src/features/profile/profile.service.ts` per contracts PR-001/PR-002.
- [X] T114 [P] Edge case: empty states — add `EmptyState` components across all list screens: no sessions, no students, no classes, no homework, no stickers, no children. Per spec Edge Cases.
- [X] T115 [P] Edge case: class capacity — enforce `max_students` check client-side when assigning students to class (FR-028, edge case: class full).
- [X] T116 [P] Edge case: session token expiry — detect expired session in auth store listener, redirect to login with message.
- [X] T117 [P] Edge case: network errors — add error boundaries and retry UI for data-fetching screens.
- [ ] T118 Validate against checklist — run through `specs/001-mvp-phase1/checklists/mvp-full.md` items and resolve any open issues.
- [ ] T119 Run quickstart.md full testing sequence — follow manual testing sequence from `specs/001-mvp-phase1/quickstart.md` §Testing the Full Flow (steps 1-12).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. BLOCKS all phases.
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001-T005 must complete). BLOCKS all story phases.
- **Phase 3 (US1)**: Depends on Phase 2. BLOCKS Phases 4-10 (all stories need auth + routing).
- **Phases 4-5 (US2, US3)**: Depend on Phase 3. Can run in parallel. US2 + US3 complete P1 stories.
- **Phases 6-8 (US4, US5, US6)**: Depend on Phase 3. Can run in parallel (or after US2/US3). US4 before US5 is recommended (attendance needs classes/students set up).
- **Phase 9 (US7)**: Depends on Phase 4 (US2, teacher dashboard exists).
- **Phase 10 (US8)**: Depends on all screen phases (needs all strings to exist). Should run last.
- **Phase 11 (Polish)**: Depends on all story phases.

### Within Each Story Phase

1. Services first (data layer)
2. Hooks second (query/mutation layer)
3. Dashboard screens (data consumption)
4. CRUD/detail screens (feature screens)

### Parallel Opportunities

Tasks marked `[P]` within the same phase can run in parallel:

- **Phase 2**: All scaffolding tasks (T009-T024) are independent.
- **Phase 3**: Role layouts (T030-T033) and placeholders (T034-T037) are independent.
- **Phase 4**: Services (T038-T041) and hooks (T042-T045) within each service can run in parallel.
- **Phase 5**: Services (T053-T056) and hooks (T057-T060) are independent sets.
- **Phase 6**: Services (T069-T072) and hooks (T073-T075) are independent sets.

### Cross-Story Dependencies

| Story | Depends On | Reason |
|-------|-----------|--------|
| US2 (Teacher Sessions) | US1 (Auth) | Need login + teacher routing |
| US3 (Student Progress) | US1 (Auth) | Need login + student routing |
| US3 (Student Progress) | US2 (Teacher Sessions) | Need session data to display |
| US4 (Admin CRUD) | US1 (Auth) | Need login + admin routing |
| US5 (Attendance) | US4 (Admin CRUD) | Need classes/students to exist |
| US6 (Parent) | US1 (Auth) | Need login + parent routing |
| US6 (Parent) | US4 (Admin CRUD) | Need parent accounts linked to students |
| US7 (Teacher Insights) | US2 (Teacher Sessions) | Need session data for analytics |
| US8 (i18n) | US1-US7 | Need all screens to exist for string extraction |

---

## Implementation Strategy

### MVP-First (P1 Stories Only)

1. **Phase 1**: Setup (migration + Edge Functions) — ~2 tasks
2. **Phase 2**: Foundational (auth refactor + shared components) — ~19 tasks
3. **Phase 3**: US1 (auth screens + routing) — ~13 tasks
4. **Phase 4**: US2 (teacher sessions + stickers) — ~15 tasks
5. **Phase 5**: US3 (student dashboard + gamification) — ~16 tasks
6. **STOP**: Test P1 independently. Deployable MVP.

### Incremental Delivery (P1 -> P2 -> P3)

7. **Phase 6**: US4 (admin CRUD) — ~21 tasks
8. **Phase 7**: US5 (attendance) — ~3 tasks
9. **Phase 8**: US6 (parent monitoring) — ~9 tasks
10. **STOP**: Test P2 increment. Full operational app.
11. **Phase 9**: US7 (teacher insights) — ~6 tasks
12. **Phase 10**: US8 (i18n) — ~5 tasks
13. **Phase 11**: Polish — ~7 tasks

### Task Count Summary

| Phase | Story | Tasks | Priority |
|-------|-------|-------|----------|
| 1 | Setup | 5 (expanded scope) | — |
| 2 | Foundational | 19 | — |
| 3 | US1 - Auth & Routing | 13 | P1 |
| 4 | US2 - Teacher Sessions | 15 | P1 |
| 5 | US3 - Student Progress | 16 | P1 |
| 6 | US4 - Admin CRUD | 22 | P2 |
| 7 | US5 - Attendance | 3 | P2 |
| 8 | US6 - Parent Monitoring | 9 | P2 |
| 9 | US7 - Teacher Insights | 6 | P3 |
| 10 | US8 - i18n | 5 | P3 |
| 11 | Polish | 7 | — |
| **Total** | | **120** | |

---

## Notes

- [P] tasks = different files, no dependencies — safe to parallelize
- [US#] label maps task to spec user story for traceability
- Each story checkpoint is independently testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Points/levels/streaks are handled by 5 DB triggers (T001) — no client-side calculation needed
- Trophy/achievement auto-award is handled by `check_trophy_achievement_awards()` trigger on `students` table (T001)
- "High Scorer" achievement is checked inside `handle_session_points()` (T001)
- Edge Functions (T002-T004) use `service_role` key — set via `supabase secrets set`
