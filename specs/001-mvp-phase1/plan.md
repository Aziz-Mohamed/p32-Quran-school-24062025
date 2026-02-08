# Implementation Plan: Quran School MVP (Phase 1)

**Branch**: `001-mvp-phase1` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-phase1/spec.md`

## Summary

Build the Quran School MVP: a multi-tenant Expo React Native app with 4 role-specific experiences (student, teacher, parent, admin). Core workflows include school creation, username-based auth, session logging with gamification, bulk attendance, and parent monitoring. The database schema, RLS policies, and foundational app scaffolding (routes, theme, shared components, stores) already exist from Phase 1 foundations.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode) / React Native 0.83 / React 19
**Primary Dependencies**: Expo ~54, Expo Router v6, TanStack Query 5, Zustand 5, Supabase JS 2, react-hook-form 7 + zod 4, react-native-reanimated 4, i18next + react-i18next, FlashList 2, expo-image 3, react-native-calendars, victory-native, @gorhom/bottom-sheet 5
**Storage**: Supabase PostgreSQL (remote), expo-secure-store (auth tokens), AsyncStorage (preferences)
**Testing**: Jest + @testing-library/react-native (unit/component), Detox or Maestro (E2E)
**Target Platform**: iOS 15+ / Android 8+ (Expo managed workflow)
**Project Type**: Mobile (Expo React Native)
**Performance Goals**: Dashboard loads <3s on typical mobile connection, session creation <2min user flow
**Constraints**: No offline support (Phase 1), light mode only, EN/AR only, no push notifications
**Scale/Scope**: ~50 users per school, ~30 screens across 4 roles, 18 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Multi-Tenant by Default | PASS | All school-scoped tables have `school_id`; RLS uses `get_user_school_id()`. Schema verified in migration. |
| II. Role-Based Access (4 Roles) | PASS | RLS policies use `get_user_role()` for all 4 roles. `profiles.role` CHECK constraint enforces exactly 4 values. |
| III. TypeScript-First, Strict Mode | PASS | `tsconfig.json` has `"strict": true`. All existing files are `.ts`/`.tsx`. Supabase types generated at `src/types/database.types.ts`. |
| IV. Feature Colocation | PASS | `src/features/auth/` already follows hooks/services/types/components pattern. Shared code in `src/components/`, `src/hooks/`, etc. |
| V. Logical CSS Only (RTL/LTR) | PASS (design) | Constitution mandates it; must verify during implementation. `useRTL` hook exists. |
| VI. i18n Mandatory | PASS (design) | `src/i18n/config.ts`, `en.json`, `ar.json` exist. Must ensure all new strings go through i18n. |
| VII. Supabase-Native Patterns | PASS | `src/lib/supabase.ts` client exists. Services use SDK directly. All DB functions have `SET search_path = public`. Tables before functions in migration. |
| VIII. Minimal Animation | PASS (design) | `react-native-reanimated` installed. Constitution prohibits heavy animations. |

**GATE RESULT: ALL PASS** — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-phase1/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/                                    # Expo Router — file-based routing
├── _layout.tsx                         # Root layout (providers, auth guard)
├── index.tsx                           # Entry redirect
├── (auth)/                             # Auth screens (no bottom nav)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx                    # → Becomes create-school.tsx
│   └── forgot-password.tsx             # → Remove (no email-based reset)
├── (student)/                          # Student role screens
│   ├── _layout.tsx
│   ├── (tabs)/_layout.tsx, index.tsx, lessons.tsx, stickers.tsx, profile.tsx
│   ├── lessons/[id].tsx
│   ├── sessions/index.tsx, [id].tsx
│   ├── trophy-room.tsx
│   └── leaderboard.tsx
├── (teacher)/                          # Teacher role screens
│   ├── _layout.tsx
│   ├── (tabs)/_layout.tsx, index.tsx, students.tsx, sessions.tsx, profile.tsx
│   ├── students/[id].tsx, top-performers.tsx, needs-support.tsx
│   ├── sessions/create.tsx, [id].tsx
│   ├── awards/index.tsx
│   └── class-progress.tsx
├── (parent)/                           # Parent role screens
│   ├── _layout.tsx
│   ├── (tabs)/_layout.tsx, index.tsx, children.tsx, settings.tsx
│   ├── children/[id].tsx
│   ├── attendance/[childId].tsx
│   └── class-standing/[childId].tsx
├── (admin)/                            # Admin role screens
│   ├── _layout.tsx, index.tsx
│   ├── students/index.tsx, create.tsx, [id]/index.tsx, [id]/edit.tsx
│   ├── teachers/index.tsx, create.tsx, [id]/index.tsx, [id]/edit.tsx
│   ├── classes/index.tsx, create.tsx, [id]/index.tsx, [id]/edit.tsx
│   ├── attendance/index.tsx
│   └── members/reset-password.tsx      # New: admin password reset
└── +not-found.tsx

src/
├── features/                           # Feature modules
│   ├── auth/                           # ✅ Exists (needs update for username flow)
│   ├── dashboard/                      # New: role-specific dashboard hooks/services
│   ├── sessions/                       # New: session CRUD
│   ├── lessons/                        # New: lesson browsing + progress
│   ├── gamification/                   # New: stickers, trophies, achievements, leaderboard
│   ├── students/                       # New: student management (teacher + admin)
│   ├── teachers/                       # New: teacher management (admin)
│   ├── classes/                        # New: class management (admin)
│   ├── attendance/                     # New: bulk attendance + calendar
│   ├── homework/                       # New: homework tracking
│   ├── children/                       # New: parent's children view
│   └── profile/                        # New: profile viewing
├── components/                         # ✅ Exists (shared UI)
├── hooks/                              # ✅ Exists (shared hooks)
├── lib/                                # ✅ Exists (supabase client, queryClient, etc.)
├── stores/                             # ✅ Exists (auth, theme, locale)
├── types/                              # ✅ Exists (database.types.ts, common, navigation)
├── theme/                              # ✅ Exists (colors, typography, spacing, etc.)
└── i18n/                               # ✅ Exists (config, en.json, ar.json)

supabase/
├── migrations/
│   ├── 00001_initial_schema.sql        # ✅ Exists (18 tables, RLS, triggers, seed)
│   └── 00002_add_username_field.sql    # New: add username to profiles
└── types/
    └── database.types.ts               # ✅ Exists (regenerate after schema changes)
```

**Structure Decision**: Mobile app using Expo Router file-based routing with feature colocation. Existing scaffolding covers ~40% of the directory structure. Remaining work is populating feature modules and screen implementations.

## Complexity Tracking

> No Constitution Check violations. No complexity justifications needed.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Edge Function for admin account creation | Required | Admin creates Supabase Auth users via `auth.admin.createUser()` which requires service_role key — cannot be called from client. Edge Function wraps this securely. |
| Synchronous points calculation | DB trigger | Points update in same transaction as session/sticker insert. Simpler than client-side calculation. |
| Username→synthetic email mapping | Edge Function handles | The `create-school` and `create-member` Edge Functions construct `username@school-slug.app` internally. |

## Post-Design Constitution Re-Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Multi-Tenant by Default | PASS | All service contracts scope queries by `school_id`. Edge Functions verify school membership. Data model confirms `school_id` on all 12 school-scoped tables. |
| II. Role-Based Access (4 Roles) | PASS | API contracts define role-specific services (student dashboard, teacher dashboard, etc.). Edge Functions verify admin role. RLS policies cover all 4 roles. |
| III. TypeScript-First, Strict Mode | PASS | All API contracts use TypeScript interfaces. Database types auto-generated. Zod validation on all inputs. |
| IV. Feature Colocation | PASS | 11 feature modules defined in contracts: auth, dashboard, sessions, lessons, gamification, students, teachers, classes, attendance, homework, children, profile. Each follows hooks/services/types/components pattern. |
| V. Logical CSS Only (RTL/LTR) | PASS (design) | `useRTL` hook exists. i18n config supports AR with RTL. Must verify during implementation. |
| VI. i18n Mandatory | PASS (design) | i18n setup exists with en.json/ar.json. Must ensure all new strings go through i18n during implementation. |
| VII. Supabase-Native Patterns | PASS | Services use Supabase SDK directly. 3 Edge Functions for secure auth operations. All DB functions have `SET search_path = public`. Migrations via Supabase tooling. |
| VIII. Minimal Animation | PASS (design) | Card component has subtle 0.97x spring scale. No heavy animations planned. |

**POST-DESIGN GATE: ALL PASS** — Proceed to task generation (`/speckit.tasks`).

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](./research.md) | 7 technical decisions resolved with alternatives and rationale |
| Data Model | [data-model.md](./data-model.md) | 18 tables, relationships, validation rules, migration 00002 spec |
| API Contracts | [contracts/api-contracts.md](./contracts/api-contracts.md) | 3 Edge Functions, 13 service modules, ~40 operations, query key convention |
| Quickstart | [quickstart.md](./quickstart.md) | Setup instructions, dev workflow, testing sequence |
