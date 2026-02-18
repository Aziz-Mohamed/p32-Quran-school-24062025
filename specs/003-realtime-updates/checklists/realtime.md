# Realtime Updates Checklist: Comprehensive Requirements Quality

**Purpose**: Validate completeness, clarity, consistency, and coverage of the realtime updates specification and plan before implementation
**Created**: 2026-02-13
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md) | [data-model.md](../data-model.md)
**Depth**: Standard | **Audience**: Author self-review | **Focus**: All areas

## Requirement Completeness

- [x] CHK001 - Are subscription requirements defined for all 7 subscribed tables listed in data-model.md? [Completeness, Spec §FR-006–FR-012] — Yes, 8 tables covered across FR-006–FR-012 (student_stickers, attendance, sessions, students, homework, student_trophies, student_achievements, classes)
- [x] CHK002 - Are event types (INSERT vs UPDATE vs both) explicitly specified for each subscribed table? [Completeness, Spec §FR-006–FR-012] — Yes, each FR specifies "inserts", "inserts and updates", or "updates" explicitly
- [x] CHK003 - Are query keys to invalidate documented for every table+event combination? [Completeness, Research §R-008] — Yes, research R-008 has complete mapping; contracts/event-query-map.ts has conceptual examples
- [x] CHK004 - Is the subscription lifecycle fully specified: creation, active state, error recovery, and cleanup? [Completeness, Spec §FR-001–FR-003] — Yes, FR-001 (creation), FR-002 (cleanup with order of operations), FR-003 (reconnect with SDK backoff), data-model.md state diagram
- [x] CHK005 - Are requirements defined for the initial data fetch after subscription is established (catching events missed during setup)? [Gap] — RESOLVED: Added FR-003a requiring invalidation of all query keys on SUBSCRIBED status
- [x] CHK006 - Is the behavior specified when `useRealtimeManager` is called before the user's profile/role data is available? [Gap] — RESOLVED: Added FR-003b specifying skip-and-retry behavior when profile not loaded
- [x] CHK007 - Are requirements for `expo-network` dependency documented in the plan, given `useRealtimeReconnect` relies on it for `onlineManager`? [Gap, Plan §Source Code] — RESOLVED: Added to plan.md New Dependencies and quickstart.md Prerequisites

## Requirement Clarity

- [x] CHK008 - Is "within 5 seconds" (NFR-001) defined with clear start/end measurement points (database commit → UI paint)? [Clarity, Spec §NFR-001] — Yes, NFR-001 states "measured end-to-end (database write → UI update) under normal network conditions"
- [x] CHK009 - Is the 1-second debounce window (FR-004) specified clearly enough — does it reset on each new event or is it a fixed window from the first event? [Clarity, Spec §FR-004] — RESOLVED: Updated FR-004 to specify "trailing-edge debounce (timer resets on each new event)" with per-role values (300ms/500ms)
- [x] CHK010 - Is "same record" in the deduplication rule (FR-005) defined precisely — by primary key, or by table+primary key? [Clarity, Spec §FR-005] — RESOLVED: Updated FR-005 to specify "identified by table name + primary key"
- [x] CHK011 - Is "relevant event" in FR-006–FR-012 defined — does it mean any event on the table, or only events matching the user's filter criteria? [Clarity, Spec §FR-006] — RESOLVED: Added clarification to FR-006 that "relevant event" means events passing both subscription filter AND RLS
- [x] CHK012 - Is "seamless" (FR-018) quantified — does it mean no visible loading indicators, no scroll position reset, or both? [Clarity, Spec §FR-018] — Yes, FR-018 already specifies "no full-screen loading states, flickers, or scroll position resets"
- [x] CHK013 - Is "no measurable battery impact" (SC-005) defined with a specific measurement methodology or threshold? [Measurability, Spec §SC-005] — RESOLVED: Updated SC-005 with practical measurement: single WebSocket, OS-managed background disconnect, no additional wake-ups in battery usage panel

## Requirement Consistency

- [x] CHK014 - Is the debounce value consistent between the spec (FR-004: 1 second) and research (R-002: 300ms/500ms per view type)? [Conflict, Spec §FR-004 vs Research §R-002] — RESOLVED: Updated FR-004 to match research: 300ms student, 500ms teacher/parent/admin. Also updated Edge Case 3 and A-009
- [x] CHK015 - Is the dedup window consistent between the spec (FR-005: 2 seconds) and research (R-005: 2 seconds)? [Consistency, Spec §FR-005 vs Research §R-005] — Yes, both say 2 seconds
- [x] CHK016 - Are the query keys in the event-query-map contract (event-query-map.ts) consistent with the actual query keys used in existing hooks? [Consistency, Contracts vs Research §R-008] — RESOLVED: Added missing `parent-dashboard`, `child-detail` to sessions and student_stickers mappings; added `top-performers`, `needs-support` to students UPDATE mapping. TanStack Query prefix matching handles parameterized keys (e.g., `['leaderboard']` matches `['leaderboard', classId, period]`)
- [x] CHK017 - Does the plan's file structure (plan.md §Source Code) match the quickstart.md §New Files listing? [Consistency, Plan vs Quickstart] — Yes, both list identical 9 files in same structure
- [x] CHK018 - Are the subscription profiles in data-model.md consistent with the role filtering requirements in FR-013–FR-017? [Consistency, Data-Model vs Spec] — Yes, verified: student→own data (FR-014), teacher→assigned classes (FR-015), parent→linked children (FR-016), admin→school-wide (FR-017)
- [x] CHK019 - Is the `student_stickers` filter strategy consistent — data-model says "RLS for teacher/admin" but the research table (R-007) shows `school_id=eq.{schoolId}` for teacher, yet `student_stickers` has no `school_id` column? [Conflict, Data-Model vs Research §R-007] — RESOLVED: Fixed R-007 table to say "No direct filter (RLS enforces school scope)" for teacher and admin on student_stickers

## Subscription Lifecycle & Reliability

- [x] CHK020 - Are requirements defined for the channel status callback states: SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED? [Completeness, Research §R-001] — Yes, data-model.md has full state diagram; FR-003a handles SUBSCRIBED; FR-022 requires logging all status transitions; SDK handles CHANNEL_ERROR/TIMED_OUT with auto-reconnect
- [x] CHK021 - Is the maximum reconnection attempt count or backoff strategy specified, or is it deferred to Supabase SDK defaults? [Clarity, Spec §Edge Case 2] — RESOLVED: FR-003 now explicitly states "Reconnection uses the Supabase SDK's built-in exponential backoff strategy (no custom retry logic)"
- [x] CHK022 - Are requirements defined for what happens when the JWT expires while a subscription is active? [Gap, Research §R-001] — RESOLVED: Added FR-021 specifying transparent JWT refresh via Supabase SDK's onAuthStateChange
- [x] CHK023 - Is the behavior specified when `supabase.removeChannel()` fails or hangs during logout cleanup? [Gap, Spec §FR-002] — RESOLVED: Updated FR-002 with 3-second timeout — proceed with cleanup if channel removal fails
- [x] CHK024 - Are requirements clear for the order of operations during logout: unsubscribe channels → clear query cache → clear auth state? [Gap, Spec §FR-002 + Edge Case 4] — RESOLVED: Updated FR-002 with explicit order: (1) remove channels, (2) clear query cache, (3) clear auth state
- [x] CHK025 - Is the re-subscription strategy after foregrounding defined — re-subscribe all channels, or only check status and re-subscribe if disconnected? [Clarity, Spec §FR-003 + Edge Case 6] — Yes, Edge Case 6 says "checks subscription status and reconnects if needed" — check-then-reconnect strategy

## Role-Based Filtering Correctness

- [x] CHK026 - Are filter expressions specified for every role × table combination in data-model.md? [Completeness, Data-Model §Subscription Profiles] — Yes, data-model.md has 4 complete profile tables with filter column for every row
- [x] CHK027 - Is the behavior defined when a student has no `class_id` (unassigned) — what subscription filter is used for class-scoped leaderboard updates? [Edge Case, Spec §Edge Case not listed] — RESOLVED: Added Edge Case 11 — class-scoped subscriptions omitted; personal data events still received
- [x] CHK028 - Is the behavior defined when a parent has zero linked children — is a subscription still established with an empty `in.()` filter? [Edge Case, Gap] — RESOLVED: Added Edge Case 12 — empty subscriptions array, no channel created
- [x] CHK029 - Is the behavior defined when a teacher has zero assigned classes — what filter is used for class-scoped subscriptions? [Edge Case, Gap] — RESOLVED: Added Edge Case 13 — empty subscriptions array, no channel created
- [x] CHK030 - Are the `in` filter value limits documented — Supabase supports max 100 values per `in` filter (research R-001); is this sufficient for all roles? [Constraint, Research §R-001] — Yes, research R-001 documents 100-value limit. Scale: <100 concurrent users, max 500 students per school. A parent won't have >100 children; a teacher won't have >100 classes. Well within limits.
- [x] CHK031 - Is the RLS interaction with realtime events explicitly validated — does the spec confirm that RLS-denied events are silently dropped, not errored? [Clarity, Spec §A-002 + Research §R-001] — RESOLVED: FR-006 clarification states "events that don't match the user's scope are silently dropped by the server and never reach the client"

## Integration Completeness (Event → Query Mapping)

- [x] CHK032 - Are all existing mutation hooks that need `mutationTracker.record()` additions listed in the plan? [Completeness, Plan §Modified Files] — Yes, verified against full codebase mutation list: useAwardSticker (T013), useCompleteHomework (T014), useMarkAttendance (T016), useCreateSession (T017), useCheckIn/useCheckOut (T018), useCreateStudent/useUpdateStudent (T020), useAssignStudent/useRemoveStudent (T021), useCreateClass/useUpdateClass (T023), useCreateTeacher/useUpdateTeacher (T024). useLogin/useLogout excluded (auth, not data). useUpdateLessonProgress excluded (out of scope).
- [x] CHK033 - Is the `useCreateClass`, `useUpdateClass`, `useAssignStudent`, `useRemoveStudent` mutations included in the mutation tracker additions? [Completeness, Plan §Modified Files] — Yes, T021 covers useAssignStudent/useRemoveStudent (useAddStudentsToClass/useRemoveStudentsFromClass), T023 covers useCreateClass/useUpdateClass
- [x] CHK034 - Is the `useUpdateLessonProgress` mutation excluded from tracker additions with documented rationale (lesson progress not subscribed)? [Clarity, Plan §Scope Boundaries] — Yes, Scope Boundaries lists "Realtime for lesson progress changes (low frequency, not time-sensitive)" as out of scope
- [x] CHK035 - Are the leaderboard query key invalidations scoped correctly — should `['leaderboard']` be `['leaderboard', classId]` for targeted invalidation? [Clarity, Research §R-008] — Yes, `['leaderboard']` as a prefix correctly matches all parameterized keys via TanStack Query's `invalidateQueries` prefix matching. `invalidateQueries({ queryKey: ['leaderboard'] })` invalidates `['leaderboard', classId, period]` for all classId/period combinations.
- [x] CHK036 - Is the parent dashboard invalidation included in the `sessions` INSERT mapping, since parents see recent session activity? [Gap, Research §R-008] — RESOLVED: Added `['parent-dashboard']` and `['child-detail', payload.student_id]` to sessions INSERT mapping in R-008 and event-query-map.ts
- [x] CHK037 - Are the `children` and `child-detail` query keys included in `student_stickers` INSERT mapping for parent role? [Gap, Data-Model §Parent Profile] — RESOLVED: Added `['parent-dashboard']` and `['child-detail', payload.student_id]` to student_stickers INSERT mapping in R-008 and event-query-map.ts. Note: data-model.md parent profile already included these.

## Edge Case & Failure Coverage

- [x] CHK038 - Is the behavior defined for when a realtime event payload is empty `{}` due to RLS filtering — does the invalidation still fire? [Edge Case, Research §R-001] — RESOLVED: Added Edge Case 14 — system fires broad invalidation (without specific IDs) when payload is empty. Also documented in event-query-map.ts contract JSDoc.
- [x] CHK039 - Are requirements defined for Supabase Realtime service outage — how long before the app recognizes degradation vs. temporary blip? [Gap, Spec §NFR-003] — RESOLVED: Updated NFR-003 — app doesn't need to distinguish blips from outages; TanStack Query's staleTime polling provides automatic catch-up regardless. Added SC-008 for negative scenario.
- [x] CHK040 - Is the behavior specified when the debounce timer fires but the app has been backgrounded between event receipt and timer expiry? [Edge Case, Gap] — RESOLVED: Added Edge Case 15 — timer fires in background (harmless), foreground reconnect invalidates all stale queries as safety net
- [x] CHK041 - Are requirements defined for the scenario where a user's role changes while they're logged in (e.g., promoted from teacher to admin)? [Edge Case, Gap] — RESOLVED: Added Edge Case 17 — role changes require re-authentication, handled by FR-002 (cleanup) + FR-001 (new subscriptions)
- [x] CHK042 - Is the rapid-event scenario (Edge Case 3) tested against the specific morning attendance rush — 20 students × 1 attendance record each = 20 events within seconds? [Coverage, Spec §Edge Case 3] — Yes, Edge Case 3 mentions "admin marking attendance for 20 students in quick succession", SC-006 tests this scenario, quickstart.md testing checklist item 8 covers it
- [x] CHK043 - Are requirements defined for the scenario where a subscription filter becomes invalid (e.g., class deleted while teacher is subscribed with `class_id` filter)? [Edge Case, Gap] — RESOLVED: Added Edge Case 16 — events stop matching (correct behavior), subscription rebuilt on class/profile data change

## Non-Functional Requirements

- [x] CHK044 - Is the maximum number of concurrent WebSocket connections per school estimated and compared against Supabase plan limits? [Coverage, Research §R-001 Limits Table] — RESOLVED: Added capacity estimation table to research.md — <100 connections per school vs 200 (Free) / 500 (Pro) limits
- [x] CHK045 - Is the messages-per-second throughput estimated for the busiest school scenario and compared against Supabase limits? [Coverage, Research §R-001 Limits Table] — RESOLVED: Added to capacity estimation — peak ~2 msg/s vs 100 (Free) / 500 (Pro) limits
- [x] CHK046 - Are memory usage requirements specified for the mutation tracker Map — is there a max entry count or size limit? [Gap] — RESOLVED: Added to capacity estimation — worst case 20 entries × ~50 bytes = ~1KB, pruned after 5 seconds
- [x] CHK047 - Is the 5-second SLA (NFR-001) achievable given the debounce window (300-500ms) + query refetch time? Does the time budget add up? [Measurability, Spec §NFR-001 vs Research §R-002] — RESOLVED: Added time budget breakdown to research.md — total ~700ms–1600ms, well within 5-second SLA
- [x] CHK048 - Are logging/observability requirements defined for subscription events (at least debug-level logging of connect/disconnect/error states)? [Gap] — RESOLVED: Added FR-022 requiring debug-level logging with `__DEV__` guards and specified log format

## Dependencies & Assumptions

- [x] CHK049 - Is assumption A-002 (server-side filter enforcement) validated — does Supabase Realtime actually apply column filters server-side, or only RLS? [Assumption, Spec §A-002] — Yes, research R-001 confirms: "RLS automatically filters events per-subscriber using their JWT". Both explicit filters AND RLS apply server-side. Filter is performance optimization; RLS is security boundary.
- [x] CHK050 - Is assumption A-003 (3-6 channels per user) still valid given the plan uses 1 channel per user with multiple listeners? [Assumption, Spec §A-003 vs Plan] — RESOLVED: Updated A-003 from "3-6 channels" to "1 channel with multiple .on() listeners"
- [x] CHK051 - Is assumption A-008 (replication role enabled by default) validated for the specific Supabase project `zngiszdfdowjvwxqmexl`? [Assumption, Spec §A-008] — Yes, this is standard default behavior for all Supabase-hosted projects on public schema tables. Confirmed by Supabase documentation.
- [x] CHK052 - Is the dependency on the existing QueryClient singleton consolidation (research R-006) documented as a prerequisite task? [Dependency, Research §R-006] — Yes, Tasks T001 is the first task: "Consolidate QueryClient singleton"
- [x] CHK053 - Is the `expo-network` package listed as a new dependency to add, or is it already installed? [Dependency, Gap] — RESOLVED: `expo-network` is NOT installed. Added to plan.md (New Dependencies) and quickstart.md (Prerequisites: `npx expo install expo-network`)

## Acceptance Criteria Quality

- [x] CHK054 - Can SC-001 (sticker award → student update in 5s) be tested without manual timing — is an automated or semi-automated verification method suggested? [Measurability, Spec §SC-001] — Two-device side-by-side testing is the accepted method (per SC-001 and quickstart.md). Automated timing measurement is out of scope for this feature — would require test harness infrastructure.
- [x] CHK055 - Is SC-003 (no frame drops, no memory leaks over 30 minutes) testable with available tools — are profiling tools or thresholds specified? [Measurability, Spec §SC-003] — RESOLVED: Updated SC-003 to specify measurement tools: React Native Perf Monitor (fps), Xcode Instruments / Android Profiler (memory trending)
- [x] CHK056 - Is SC-006 (morning rush, no flickering) defined with a specific visual assertion — what constitutes "flickering" (e.g., >1 re-render per second visible to user)? [Clarity, Spec §SC-006] — RESOLVED: Updated SC-006 to define flickering as "visible content swap where data momentarily disappears then reappears" and "no more than one visible re-render per debounce window"
- [x] CHK057 - Are the 6 user stories' acceptance scenarios complete — do they cover the negative case (what happens when the realtime event does NOT arrive within 5 seconds)? [Coverage, Spec §US1–US6] — RESOLVED: Added acceptance scenario 6 to US1 covering Realtime unavailability fallback. Added SC-008 for the general negative case. NFR-003 covers graceful degradation.

## Notes

- Check items off as completed: `[x]`
- Items marked `[Gap]` identify missing requirements that should be added to the spec or plan before implementation
- Items marked `[Conflict]` identify inconsistencies between artifacts that must be resolved
- Items marked `[Assumption]` identify assumptions that should be validated before implementation
- ~~CHK014 (debounce conflict) is the highest-priority conflict to resolve~~ RESOLVED: spec updated to per-role values (300ms/500ms)
- ~~CHK019 (student_stickers filter) needs resolution~~ RESOLVED: research R-007 updated to "No direct filter (RLS)"
- All 57 items resolved on 2026-02-13
