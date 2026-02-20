# Implementation Plan: Gamification Redesign

**Branch**: `001-gamification-redesign` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gamification-redesign/spec.md`

## Summary

Replace the old 5-concept gamification system (points, levels, stickers, trophies, achievements) with a 2-concept model: rubʿ-based levels (0-240, tied to actual Quran memorization) and stickers (social currency for leaderboard only). The core change is that levels are now computed as the count of actively maintained Quran rubʿ (quarter) certifications, using a spaced repetition decay model where freshness decays over time and rubʿ go dormant if not reviewed. This involves: (1) dropping old trophy/achievement tables and code, (2) creating new rubʿ reference and certification tables, (3) building a juz-based progress map UI, (4) implementing client-side freshness computation, and (5) modifying the sticker system to remove trophy-tier stickers and decouple sticker points from levels.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React Native 0.83, Expo ~54, Expo Router v6, TanStack Query 5, Supabase JS 2, react-native-reanimated 4, i18next + react-i18next, @gorhom/bottom-sheet 5
**Storage**: Supabase PostgreSQL (remote) — 2 new tables, 5 dropped tables, 3 modified tables/functions
**Testing**: Jest + React Native Testing Library (unit for freshness utils), integration tests for certification flow
**Target Platform**: iOS + Android (Expo managed workflow)
**Project Type**: Mobile (React Native + Expo)
**Performance Goals**: Certification < 10s (SC-001), Revision < 5s (SC-002), Progress map load < 15s (SC-003), Sub-millisecond freshness computation for 240 items
**Constraints**: All timestamps UTC, RTL/LTR support (Arabic + English), RLS on all tables, no ORM/repository layer
**Scale/Scope**: 240 rubʿ per student, ~30 juz rows in progress map, 24 files to modify/delete, 1 new migration, ~10 new components/hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Multi-Tenant by Default | **PASS** | `student_rub_certifications` inherits school scope via `student_id FK → students`. `quran_rub_reference` is global (static Quran data, like existing `stickers`). RLS policies enforce school isolation via class/parent FKs. |
| II. Role-Based Access (4 Roles) | **PASS** | RLS on `student_rub_certifications`: teacher INSERT/UPDATE/SELECT via class join, admin via school_id, student SELECT own, parent SELECT children. Matches `student_stickers` pattern exactly. |
| III. TypeScript-First, Strict Mode | **PASS** | All new code in TypeScript strict mode. Types generated from Supabase schema (`database.types.ts`). New interfaces for rubʿ certification, freshness state, progress map data. |
| IV. Feature Colocation | **PASS** | All new code lives in `src/features/gamification/` (hooks, services, types, components, utils). Shared `LevelBadge` component for dashboard use elevated to `src/components/` if needed. |
| V. Logical CSS Only (RTL/LTR) | **PASS** | Progress map layout uses `paddingStart`/`paddingEnd`, `flexDirection: 'row'`. Juz-based navigation uses standard expandable list pattern. No physical directional properties. |
| VI. i18n Mandatory | **PASS** | All rubʿ-related strings added to `en.json` and `ar.json`. Surah names available in both languages. No hardcoded text in components. |
| VII. Supabase-Native Patterns | **PASS** | Direct Supabase SDK in service files. RLS on all tables. Migration via Supabase tooling. Functions include `SET search_path = public`. Tables created before functions. No ORM. |
| VIII. Minimal Animation | **PASS** | Certification undo uses standard snackbar/toast (no celebration). Progress map uses expand/collapse with reanimated layout transition. Freshness colors are static — no animated decay bars. |

**Post-Phase-1 Re-check**: All principles still pass. Data model and contracts align with Supabase-native patterns. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-gamification-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: Database schema design
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/
│   └── supabase-queries.md  # Phase 1: API contracts (Supabase queries)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 00011_gamification_redesign.sql   # NEW: Single migration for all DB changes

src/features/gamification/
├── components/
│   ├── StickerDetailSheet.tsx            # EXISTING (keep)
│   ├── StickerGrid.tsx                   # MODIFY (remove trophy tier)
│   ├── StickerReveal.tsx                 # MODIFY (remove trophy refs)
│   ├── RubProgressMap.tsx                # NEW: Juz-based navigation
│   ├── JuzRow.tsx                        # NEW: Expandable juz row
│   ├── RubBlock.tsx                      # NEW: Single rubʿ freshness block
│   ├── CertificationDialog.tsx           # NEW: Confirm certification
│   ├── RevisionSheet.tsx                 # NEW: Good/Poor bottom sheet
│   ├── LevelBadge.tsx                    # NEW: Level N/240 + progress bar
│   └── RevisionWarning.tsx               # NEW: "N rubʿ need revision"
├── hooks/
│   ├── useStickers.ts                    # EXISTING (keep, no changes)
│   ├── useLeaderboard.ts                 # MODIFY (remove levels join)
│   ├── useTrophies.ts                    # DELETE
│   ├── useRubReference.ts               # NEW: Static 240-row cache
│   ├── useRubCertifications.ts          # NEW: Fetch + freshness computation
│   ├── useCertifyRub.ts                 # NEW: Certification mutation
│   ├── useRecordRevision.ts             # NEW: Good/Poor/Re-certify mutation
│   └── useDormancySync.ts              # NEW: Lazy dormancy write-back
├── services/
│   └── gamification.service.ts           # MODIFY (remove GS-005/006/007, add GS-008–016)
├── types/
│   └── gamification.types.ts             # MODIFY (remove trophy/achievement types, add rubʿ types)
├── utils/
│   └── freshness.ts                      # NEW: Decay computation utility
└── index.ts                              # MODIFY (update exports)

app/
├── (student)/
│   ├── trophy-room.tsx                   # DELETE
│   ├── rub-progress.tsx                  # NEW: Student progress map (read-only)
│   └── (tabs)/
│       └── index.tsx                     # MODIFY: Dashboard level display
└── (teacher)/
    └── [existing student detail screen]  # MODIFY: Add interactive progress map

src/features/dashboard/
├── services/student-dashboard.service.ts # MODIFY: Remove levels/achievements
└── types/dashboard.types.ts              # MODIFY: Update types

src/features/reports/
├── components/ChildGamificationSummary.tsx # MODIFY: Remove achievements
├── types/reports.types.ts                  # MODIFY: Remove achievement fields
└── services/parent-reports.service.ts      # MODIFY: Remove achievement queries

src/features/notifications/
├── config/notification-categories.ts       # MODIFY: Remove trophy deep link
├── types/notifications.types.ts            # MODIFY: Remove trophy/achievement types
└── components/NotificationPreferences.tsx  # MODIFY: Remove trophy/achievement toggle

src/features/realtime/config/
├── subscription-profiles.ts                # MODIFY: Remove trophy/achievement subs
└── event-query-map.ts                      # MODIFY: Remove trophy/achievement events

src/i18n/
├── en.json                                 # MODIFY: Remove trophy strings, add rubʿ strings
└── ar.json                                 # MODIFY: Same

src/types/database.types.ts                 # REGENERATE after migration
```

**Structure Decision**: Mobile app with Expo managed workflow. All gamification code colocated under `src/features/gamification/` per Constitution IV. New components, hooks, and utils added within that feature directory. Single database migration. No new feature directories needed — this modifies an existing feature.

## Complexity Tracking

No violations to justify. The implementation follows existing patterns without introducing new abstractions, layers, or external dependencies.
