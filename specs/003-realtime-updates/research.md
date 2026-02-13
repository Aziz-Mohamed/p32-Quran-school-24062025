# Research: Realtime Updates

**Feature**: 003-realtime-updates
**Date**: 2026-02-13

## R-001: Supabase Realtime postgres_changes API

**Decision**: Use `supabase.channel().on('postgres_changes', config).subscribe()` with RLS-based authorization.

**Rationale**: This is the official, stable API in Supabase JS v2. RLS automatically filters events per-subscriber using their JWT — if a user's RLS policy would deny `SELECT` on a row, the event is silently dropped. This means school-scoping and role-based filtering happen server-side for free.

**Key findings**:
- Multiple `.on()` listeners can be chained on a single channel (recommended to reduce connections)
- Filter syntax: `'column=operator.value'` — supports `eq`, `in` (up to 100 values), `neq`, `lt`, `gt`, `lte`, `gte`
- **DELETE events are NOT filterable** — filter applies to the new record which doesn't exist on delete. This confirms the spec decision to focus on INSERT/UPDATE events only
- Max 100 channels per connection (across all plans)
- Supabase Free tier: 200 concurrent connections, 100 msg/sec; Pro: 500 connections, 500 msg/sec
- `supabase.removeChannel(channel)` for full cleanup (not just `channel.unsubscribe()`)
- Built-in exponential backoff reconnection on errors

**Alternatives considered**:
- Supabase Broadcast: Rejected — requires custom server-side trigger setup, no RLS integration
- Supabase Presence: Rejected — designed for user status, not data sync
- Custom WebSocket: Rejected — unnecessary when Supabase SDK handles everything
- Polling with shorter staleTime: Rejected — doesn't provide true real-time experience

## R-002: TanStack Query Integration Pattern

**Decision**: Use `invalidateQueries()` on realtime events, not direct cache mutation.

**Rationale**: Realtime payloads may be partial (missing joined fields, computed values). Invalidation triggers a clean refetch through the existing service/query layer, reusing error handling, RLS, and response shaping. This is the pattern recommended by MakerKit, Nextbase, and the TanStack Query community.

**Key findings**:
- A custom `useRealtimeSubscription` hook wraps channel setup + cleanup + debounced invalidation
- Multiple table listeners on one channel reduce connection overhead
- Debounce windows: 300ms for real-time-sensitive views, 500ms for dashboards
- On `SUBSCRIBED` status callback, invalidate all query keys to catch any events missed during subscription setup
- Cleanup must use `supabase.removeChannel(channel)` in `useEffect` return

**Alternatives considered**:
- Direct cache mutation via `queryClient.setQueryData()`: Rejected — payload shape doesn't match query response shape (missing joins, computed fields)
- Custom event bus (EventEmitter): Rejected — adds complexity with no benefit over direct invalidation

## R-003: React Native App Lifecycle Management

**Decision**: Use TanStack Query's `focusManager` + `onlineManager` combined with AppState for reconnection.

**Rationale**: TanStack Query provides official React Native integration. `focusManager.setFocused(true)` on foreground refetches all stale mounted queries. `onlineManager` detects network changes via `expo-network`. For Supabase Realtime, re-subscribing channels on foreground ensures WebSocket recovery after background disconnection.

**Key findings**:
- `AppState.addEventListener('change', ...)` detects background ↔ foreground transitions
- `focusManager` auto-refetches stale queries when app becomes active
- `onlineManager` with `expo-network` handles network reconnection
- The existing `useRefreshOnFocus` hook handles per-screen focus (tab navigation)
- After extended background, Supabase WebSocket may silently die — need manual reconnection via `channel.subscribe()` on foreground

**Alternatives considered**:
- NetInfo from `@react-native-community/netinfo`: Rejected — `expo-network` already in Expo ecosystem
- Custom polling fallback on disconnect: Rejected — Supabase built-in reconnection + invalidation on `SUBSCRIBED` handles this

## R-004: Channel Architecture — One Channel Per Role vs. Per Table

**Decision**: One channel per user session with multiple `.on()` listeners for each subscribed table.

**Rationale**: Minimizes connection overhead (1 WebSocket channel vs. 7+ separate ones). Supabase allows multiple listeners on one channel. Since RLS handles authorization server-side, a single school-scoped channel with per-table listeners is both simpler and more efficient.

**Key findings**:
- A student needs listeners on ~7 tables: `student_stickers`, `attendance`, `sessions`, `students`, `homework`, `student_trophies`, `student_achievements`
- All can be `.on()` listeners on a single channel
- Filter by `student_id` or `school_id` depending on table and role
- For parent role with multiple children, use `in` filter: `student_id=in.(child1,child2,child3)`
- For teacher with multiple classes, use `in` filter on `class_id`

**Alternatives considered**:
- One channel per table: Rejected — wastes connections (7 channels vs 1)
- One channel per screen: Rejected — creates subscription churn as user navigates
- Global school-wide channel (no filters): Rejected — receives too many events for non-admin roles

## R-005: Deduplication Strategy

**Decision**: Track recent local mutations in a Map keyed by `table:primaryKey` with timestamp. Skip invalidation for realtime events that match a recent mutation within 2 seconds.

**Rationale**: When a teacher awards a sticker, the `onSuccess` handler already invalidates relevant queries. The subsequent realtime event for the same INSERT would cause a redundant refetch. A lightweight in-memory tracker prevents this without complex logic.

**Key findings**:
- Map structure: `Map<string, number>` — key is `table:recordId`, value is timestamp
- On local mutation `onSuccess`: record `table:recordId → Date.now()`
- On realtime event: check if `table:payload.new.id` exists in map with timestamp < 2000ms ago
- Cleanup: entries older than 5 seconds are pruned on each check
- No persistence needed — memory-only, resets on app restart

**Alternatives considered**:
- Skip deduplication entirely: Rejected — causes visible double-refetch on user's own actions
- UUID-based mutation tracking: Rejected — overengineered for this use case
- Server-side dedup: Rejected — Supabase Realtime doesn't support this

## R-006: Existing Codebase Issues to Address

**Decision**: Consolidate duplicate QueryClient instances before implementing realtime.

**Rationale**: Research found two separate `QueryClient` instances — one in `app/_layout.tsx` and one in `src/lib/queryClient.ts`. The realtime hook needs access to the same `QueryClient` the components use. This must be consolidated first.

**Key findings**:
- `src/lib/queryClient.ts` exports a properly configured client (staleTime: 5min, gcTime: 10min, retry: 2)
- `app/_layout.tsx` creates a separate instance inline
- All realtime hooks will use `useQueryClient()` from TanStack Query context, which returns whichever instance wraps the component tree
- Fix: import the singleton from `queryClient.ts` in `_layout.tsx`

## R-007: Subscription Scope by Role

**Decision**: Define role-specific subscription configurations that determine which tables and filters each role subscribes to.

**Rationale**: Minimizes unnecessary events per role. Students only need their own data + class leaderboard changes. Teachers need their class(es). Parents need their children. Admins need school-wide.

**Mapping**:

| Role | Table | Event | Filter |
|------|-------|-------|--------|
| Student | `student_stickers` | INSERT | `student_id=eq.{studentId}` |
| Student | `attendance` | INSERT, UPDATE | `student_id=eq.{studentId}` |
| Student | `sessions` | INSERT | `student_id=eq.{studentId}` |
| Student | `students` | UPDATE | `id=eq.{studentId}` |
| Student | `homework` | INSERT, UPDATE | `student_id=eq.{studentId}` |
| Student | `student_trophies` | INSERT | `student_id=eq.{studentId}` |
| Student | `student_achievements` | INSERT | `student_id=eq.{studentId}` |
| Teacher | `students` | UPDATE | `class_id=in.({classIds})` |
| Teacher | `sessions` | INSERT | `school_id=eq.{schoolId}` |
| Teacher | `student_stickers` | INSERT | `school_id=eq.{schoolId}` |
| Teacher | `attendance` | INSERT, UPDATE | `school_id=eq.{schoolId}` |
| Teacher | `classes` | UPDATE | `teacher_id=eq.{teacherId}` |
| Parent | `attendance` | INSERT, UPDATE | `student_id=in.({childIds})` |
| Parent | `sessions` | INSERT | `student_id=in.({childIds})` |
| Parent | `student_stickers` | INSERT | `student_id=in.({childIds})` |
| Parent | `students` | UPDATE | `id=in.({childIds})` |
| Parent | `homework` | INSERT, UPDATE | `student_id=in.({childIds})` |
| Admin | `students` | INSERT, UPDATE | `school_id=eq.{schoolId}` |
| Admin | `sessions` | INSERT | `school_id=eq.{schoolId}` |
| Admin | `attendance` | INSERT, UPDATE | `school_id=eq.{schoolId}` |
| Admin | `student_stickers` | INSERT | `school_id=eq.{schoolId}` |
| Admin | `classes` | INSERT, UPDATE | `school_id=eq.{schoolId}` |
| Admin | `teachers/profiles` | UPDATE | `school_id=eq.{schoolId}` |

Note: `student_stickers` does not have `school_id` directly — teacher/admin subscriptions use `school_id` filter which relies on RLS for correct scoping. Since Supabase Realtime applies RLS to event delivery, the filter is a performance optimization (reducing server-side RLS checks), not a security boundary.

## R-008: Event-to-Query-Key Invalidation Mapping

**Decision**: Maintain a static configuration map from `(table, event_type)` → `query_keys[]` per role.

**Mapping**:

| Table | Event | Query Keys to Invalidate |
|-------|-------|-------------------------|
| `student_stickers` | INSERT | `['student-stickers', studentId]`, `['student-dashboard', studentId]`, `['leaderboard']` |
| `attendance` | INSERT/UPDATE | `['attendance']`, `['class-attendance']`, `['attendance-calendar']`, `['attendance-rate']`, `['admin-dashboard']`, `['parent-dashboard']`, `['student-dashboard']` |
| `sessions` | INSERT | `['sessions']`, `['student-dashboard', studentId]`, `['teacher-dashboard']` |
| `students` | UPDATE | `['students']`, `['leaderboard']`, `['student-dashboard']`, `['children']`, `['child-detail']` |
| `homework` | INSERT/UPDATE | `['homework']`, `['student-dashboard']` |
| `student_trophies` | INSERT | `['student-trophies', studentId]`, `['student-dashboard', studentId]` |
| `student_achievements` | INSERT | `['student-achievements', studentId]`, `['student-dashboard', studentId]` |
| `classes` | INSERT/UPDATE | `['classes']`, `['admin-dashboard']`, `['teacher-dashboard']` |
