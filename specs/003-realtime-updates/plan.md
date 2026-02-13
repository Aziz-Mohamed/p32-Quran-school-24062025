# Implementation Plan: Realtime Updates

**Branch**: `003-realtime-updates` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-realtime-updates/spec.md`

## Summary

Add a client-side realtime subscription layer using Supabase Realtime `postgres_changes` to automatically invalidate TanStack Query cache when data changes in the database. This enables live updates across roles: students see sticker awards instantly, parents see attendance in real-time, and teachers/admins see operational changes without manual refresh. The approach is additive — no database changes, no new endpoints — and falls back gracefully to the existing 5-minute polling model if the realtime service is unavailable.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: `@supabase/supabase-js` v2 (Realtime built-in), `@tanstack/react-query` v5, Expo ~54, React Native 0.83
**Storage**: No new storage — subscribes to existing Supabase PostgreSQL tables via Realtime
**Testing**: Jest + React Native Testing Library (unit/integration), manual two-device testing for realtime verification
**Target Platform**: iOS + Android (Expo managed workflow)
**Project Type**: Mobile (Expo React Native)
**Performance Goals**: <5s end-to-end event propagation, no frame drops below 30fps, no measurable battery impact
**Constraints**: Max 1-2 Supabase Realtime channels per user, debounce events to prevent excessive refetches, dedup local mutations to prevent double refetches
**Scale/Scope**: Up to 500 students per school, <100 concurrent users per school, 7 subscribed tables, ~7-12 listeners per user depending on role

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Multi-Tenant by Default | PASS | Subscription filters use `school_id` where available; RLS on all tables enforces school-scoping server-side for realtime events |
| II. Role-Based Access (4 Roles) | PASS | Each role has a distinct subscription profile with appropriate filters. Student: own data only. Teacher: assigned classes. Parent: linked children. Admin: school-wide. |
| III. TypeScript-First, Strict Mode | PASS | All new code in TypeScript strict mode. Type interfaces defined in contracts. No `any` types. |
| IV. Feature Colocation | PASS | New `src/features/realtime/` directory with colocated hooks, config, utils, types. No cross-feature imports. Uses shared auth store via `useAuthStore()`. |
| V. Logical CSS Only (RTL/LTR) | N/A | No UI components in this feature — purely data-layer logic |
| VI. i18n Mandatory | N/A | No user-visible strings — updates are silent cache invalidations (FR-019) |
| VII. Supabase-Native Patterns | PASS | Uses Supabase JS SDK's built-in Realtime client (`supabase.channel().on().subscribe()`). No custom WebSocket. RLS enforced server-side. |
| VIII. Minimal Animation | N/A | No UI changes — data merges seamlessly into existing views (FR-018) |

**Gate result**: PASS — no violations.

### Post-Design Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Feature Colocation | PASS | Realtime feature is self-contained. Only touch point with other features is adding `mutationTracker.record()` calls in existing mutation `onSuccess` handlers, which is a 1-line addition per mutation. |
| VII. Supabase-Native Patterns | PASS | Single channel per user with multiple listeners follows Supabase's recommended pattern. `removeChannel()` for cleanup. JWT auth for realtime authorization. |

**Post-design gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-realtime-updates/
├── plan.md                          # This file
├── spec.md                          # Feature specification
├── research.md                      # Phase 0: research findings
├── data-model.md                    # Phase 1: subscription data model
├── quickstart.md                    # Phase 1: implementation quickstart
├── contracts/                       # Phase 1: API contracts
│   ├── subscription-hooks.ts        # Hook interfaces + type contracts
│   └── event-query-map.ts           # Event → query key mapping contract
├── checklists/
│   └── requirements.md              # Spec quality checklist
└── tasks.md                         # Phase 2: task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/features/realtime/               # NEW: Realtime subscription feature module
├── hooks/
│   ├── useRealtimeSubscription.ts   # Core: channel setup, listeners, debounce, dedup, cleanup
│   ├── useRealtimeManager.ts        # Orchestrator: reads auth context, builds profile, delegates
│   └── useRealtimeReconnect.ts      # Lifecycle: AppState foreground reconnect + focusManager + onlineManager
├── config/
│   ├── subscription-profiles.ts     # Role-specific subscription configs (buildStudentProfile, etc.)
│   └── event-query-map.ts           # Static table→event→queryKeys mapping
├── utils/
│   ├── mutation-tracker.ts          # In-memory Map<string,number> for local mutation dedup
│   └── debounce.ts                  # Debounced query invalidation helper
├── types/
│   └── realtime.types.ts            # SubscriptionConfig, RoleSubscriptionProfile, RealtimeStatus
└── index.ts                         # Barrel export

# MODIFIED existing files:
app/_layout.tsx                      # Add useRealtimeManager() + useRealtimeReconnect() in authenticated root
src/lib/queryClient.ts               # Consolidate QueryClient singleton (fix duplicate in _layout.tsx)
src/features/sessions/hooks/useSessions.ts      # Add mutationTracker.record() in onSuccess
src/features/sessions/hooks/useCheckin.ts       # Add mutationTracker.record() in onSuccess
src/features/attendance/hooks/useAttendance.ts  # Add mutationTracker.record() in onSuccess
src/features/gamification/hooks/useStickers.ts  # Add mutationTracker.record() in onSuccess
src/features/homework/hooks/useHomework.ts      # Add mutationTracker.record() in onSuccess
src/features/students/hooks/useStudents.ts      # Add mutationTracker.record() in onSuccess
src/features/teachers/hooks/useTeachers.ts      # Add mutationTracker.record() in onSuccess
src/features/classes/hooks/useClasses.ts        # Add mutationTracker.record() in onSuccess
```

**Structure Decision**: Follows the existing feature colocation pattern (`src/features/{name}/`). The realtime module is a new feature with hooks, config, utils, and types colocated. It integrates into the app via two hook calls in `_layout.tsx` and lightweight `mutationTracker.record()` additions in existing mutation hooks.

## Complexity Tracking

> No violations — no entries needed.
