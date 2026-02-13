# Realtime Updates Checklist: Comprehensive Requirements Quality

**Purpose**: Validate completeness, clarity, consistency, and coverage of the realtime updates specification and plan before implementation
**Created**: 2026-02-13
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md) | [data-model.md](../data-model.md)
**Depth**: Standard | **Audience**: Author self-review | **Focus**: All areas

## Requirement Completeness

- [ ] CHK001 - Are subscription requirements defined for all 7 subscribed tables listed in data-model.md? [Completeness, Spec §FR-006–FR-012]
- [ ] CHK002 - Are event types (INSERT vs UPDATE vs both) explicitly specified for each subscribed table? [Completeness, Spec §FR-006–FR-012]
- [ ] CHK003 - Are query keys to invalidate documented for every table+event combination? [Completeness, Research §R-008]
- [ ] CHK004 - Is the subscription lifecycle fully specified: creation, active state, error recovery, and cleanup? [Completeness, Spec §FR-001–FR-003]
- [ ] CHK005 - Are requirements defined for the initial data fetch after subscription is established (catching events missed during setup)? [Gap]
- [ ] CHK006 - Is the behavior specified when `useRealtimeManager` is called before the user's profile/role data is available? [Gap]
- [ ] CHK007 - Are requirements for `expo-network` dependency documented in the plan, given `useRealtimeReconnect` relies on it for `onlineManager`? [Gap, Plan §Source Code]

## Requirement Clarity

- [ ] CHK008 - Is "within 5 seconds" (NFR-001) defined with clear start/end measurement points (database commit → UI paint)? [Clarity, Spec §NFR-001]
- [ ] CHK009 - Is the 1-second debounce window (FR-004) specified clearly enough — does it reset on each new event or is it a fixed window from the first event? [Clarity, Spec §FR-004]
- [ ] CHK010 - Is "same record" in the deduplication rule (FR-005) defined precisely — by primary key, or by table+primary key? [Clarity, Spec §FR-005]
- [ ] CHK011 - Is "relevant event" in FR-006–FR-012 defined — does it mean any event on the table, or only events matching the user's filter criteria? [Clarity, Spec §FR-006]
- [ ] CHK012 - Is "seamless" (FR-018) quantified — does it mean no visible loading indicators, no scroll position reset, or both? [Clarity, Spec §FR-018]
- [ ] CHK013 - Is "no measurable battery impact" (SC-005) defined with a specific measurement methodology or threshold? [Measurability, Spec §SC-005]

## Requirement Consistency

- [ ] CHK014 - Is the debounce value consistent between the spec (FR-004: 1 second) and research (R-002: 300ms/500ms per view type)? [Conflict, Spec §FR-004 vs Research §R-002]
- [ ] CHK015 - Is the dedup window consistent between the spec (FR-005: 2 seconds) and research (R-005: 2 seconds)? [Consistency, Spec §FR-005 vs Research §R-005]
- [ ] CHK016 - Are the query keys in the event-query-map contract (event-query-map.ts) consistent with the actual query keys used in existing hooks? [Consistency, Contracts vs Research §R-008]
- [ ] CHK017 - Does the plan's file structure (plan.md §Source Code) match the quickstart.md §New Files listing? [Consistency, Plan vs Quickstart]
- [ ] CHK018 - Are the subscription profiles in data-model.md consistent with the role filtering requirements in FR-013–FR-017? [Consistency, Data-Model vs Spec]
- [ ] CHK019 - Is the `student_stickers` filter strategy consistent — data-model says "RLS for teacher/admin" but the research table (R-007) shows `school_id=eq.{schoolId}` for teacher, yet `student_stickers` has no `school_id` column? [Conflict, Data-Model vs Research §R-007]

## Subscription Lifecycle & Reliability

- [ ] CHK020 - Are requirements defined for the channel status callback states: SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED? [Completeness, Research §R-001]
- [ ] CHK021 - Is the maximum reconnection attempt count or backoff strategy specified, or is it deferred to Supabase SDK defaults? [Clarity, Spec §Edge Case 2]
- [ ] CHK022 - Are requirements defined for what happens when the JWT expires while a subscription is active? [Gap, Research §R-001]
- [ ] CHK023 - Is the behavior specified when `supabase.removeChannel()` fails or hangs during logout cleanup? [Gap, Spec §FR-002]
- [ ] CHK024 - Are requirements clear for the order of operations during logout: unsubscribe channels → clear query cache → clear auth state? [Gap, Spec §FR-002 + Edge Case 4]
- [ ] CHK025 - Is the re-subscription strategy after foregrounding defined — re-subscribe all channels, or only check status and re-subscribe if disconnected? [Clarity, Spec §FR-003 + Edge Case 6]

## Role-Based Filtering Correctness

- [ ] CHK026 - Are filter expressions specified for every role × table combination in data-model.md? [Completeness, Data-Model §Subscription Profiles]
- [ ] CHK027 - Is the behavior defined when a student has no `class_id` (unassigned) — what subscription filter is used for class-scoped leaderboard updates? [Edge Case, Spec §Edge Case not listed]
- [ ] CHK028 - Is the behavior defined when a parent has zero linked children — is a subscription still established with an empty `in.()` filter? [Edge Case, Gap]
- [ ] CHK029 - Is the behavior defined when a teacher has zero assigned classes — what filter is used for class-scoped subscriptions? [Edge Case, Gap]
- [ ] CHK030 - Are the `in` filter value limits documented — Supabase supports max 100 values per `in` filter (research R-001); is this sufficient for all roles? [Constraint, Research §R-001]
- [ ] CHK031 - Is the RLS interaction with realtime events explicitly validated — does the spec confirm that RLS-denied events are silently dropped, not errored? [Clarity, Spec §A-002 + Research §R-001]

## Integration Completeness (Event → Query Mapping)

- [ ] CHK032 - Are all existing mutation hooks that need `mutationTracker.record()` additions listed in the plan? [Completeness, Plan §Modified Files]
- [ ] CHK033 - Is the `useCreateClass`, `useUpdateClass`, `useAssignStudent`, `useRemoveStudent` mutations included in the mutation tracker additions? [Completeness, Plan §Modified Files]
- [ ] CHK034 - Is the `useUpdateLessonProgress` mutation excluded from tracker additions with documented rationale (lesson progress not subscribed)? [Clarity, Plan §Scope Boundaries]
- [ ] CHK035 - Are the leaderboard query key invalidations scoped correctly — should `['leaderboard']` be `['leaderboard', classId]` for targeted invalidation? [Clarity, Research §R-008]
- [ ] CHK036 - Is the parent dashboard invalidation included in the `sessions` INSERT mapping, since parents see recent session activity? [Gap, Research §R-008]
- [ ] CHK037 - Are the `children` and `child-detail` query keys included in `student_stickers` INSERT mapping for parent role? [Gap, Data-Model §Parent Profile]

## Edge Case & Failure Coverage

- [ ] CHK038 - Is the behavior defined for when a realtime event payload is empty `{}` due to RLS filtering — does the invalidation still fire? [Edge Case, Research §R-001]
- [ ] CHK039 - Are requirements defined for Supabase Realtime service outage — how long before the app recognizes degradation vs. temporary blip? [Gap, Spec §NFR-003]
- [ ] CHK040 - Is the behavior specified when the debounce timer fires but the app has been backgrounded between event receipt and timer expiry? [Edge Case, Gap]
- [ ] CHK041 - Are requirements defined for the scenario where a user's role changes while they're logged in (e.g., promoted from teacher to admin)? [Edge Case, Gap]
- [ ] CHK042 - Is the rapid-event scenario (Edge Case 3) tested against the specific morning attendance rush — 20 students × 1 attendance record each = 20 events within seconds? [Coverage, Spec §Edge Case 3]
- [ ] CHK043 - Are requirements defined for the scenario where a subscription filter becomes invalid (e.g., class deleted while teacher is subscribed with `class_id` filter)? [Edge Case, Gap]

## Non-Functional Requirements

- [ ] CHK044 - Is the maximum number of concurrent WebSocket connections per school estimated and compared against Supabase plan limits? [Coverage, Research §R-001 Limits Table]
- [ ] CHK045 - Is the messages-per-second throughput estimated for the busiest school scenario and compared against Supabase limits? [Coverage, Research §R-001 Limits Table]
- [ ] CHK046 - Are memory usage requirements specified for the mutation tracker Map — is there a max entry count or size limit? [Gap]
- [ ] CHK047 - Is the 5-second SLA (NFR-001) achievable given the debounce window (300-500ms) + query refetch time? Does the time budget add up? [Measurability, Spec §NFR-001 vs Research §R-002]
- [ ] CHK048 - Are logging/observability requirements defined for subscription events (at least debug-level logging of connect/disconnect/error states)? [Gap]

## Dependencies & Assumptions

- [ ] CHK049 - Is assumption A-002 (server-side filter enforcement) validated — does Supabase Realtime actually apply column filters server-side, or only RLS? [Assumption, Spec §A-002]
- [ ] CHK050 - Is assumption A-003 (3-6 channels per user) still valid given the plan uses 1 channel per user with multiple listeners? [Assumption, Spec §A-003 vs Plan]
- [ ] CHK051 - Is assumption A-008 (replication role enabled by default) validated for the specific Supabase project `zngiszdfdowjvwxqmexl`? [Assumption, Spec §A-008]
- [ ] CHK052 - Is the dependency on the existing QueryClient singleton consolidation (research R-006) documented as a prerequisite task? [Dependency, Research §R-006]
- [ ] CHK053 - Is the `expo-network` package listed as a new dependency to add, or is it already installed? [Dependency, Gap]

## Acceptance Criteria Quality

- [ ] CHK054 - Can SC-001 (sticker award → student update in 5s) be tested without manual timing — is an automated or semi-automated verification method suggested? [Measurability, Spec §SC-001]
- [ ] CHK055 - Is SC-003 (no frame drops, no memory leaks over 30 minutes) testable with available tools — are profiling tools or thresholds specified? [Measurability, Spec §SC-003]
- [ ] CHK056 - Is SC-006 (morning rush, no flickering) defined with a specific visual assertion — what constitutes "flickering" (e.g., >1 re-render per second visible to user)? [Clarity, Spec §SC-006]
- [ ] CHK057 - Are the 6 user stories' acceptance scenarios complete — do they cover the negative case (what happens when the realtime event does NOT arrive within 5 seconds)? [Coverage, Spec §US1–US6]

## Notes

- Check items off as completed: `[x]`
- Items marked `[Gap]` identify missing requirements that should be added to the spec or plan before implementation
- Items marked `[Conflict]` identify inconsistencies between artifacts that must be resolved
- Items marked `[Assumption]` identify assumptions that should be validated before implementation
- CHK014 (debounce conflict) is the highest-priority conflict to resolve — the spec says 1 second but the research recommends 300ms/500ms per view type
- CHK019 (student_stickers filter) needs resolution since the table lacks `school_id` — the data-model already notes this but the research table doesn't
