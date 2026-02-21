# Tasks: Gamification Redesign

**Input**: Design documents from `/specs/001-gamification-redesign/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/supabase-queries.md, research.md, quickstart.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6)
- Exact file paths included in all descriptions

---

## Phase 1: Foundational (Database & Shared Utilities)

**Purpose**: Database migration, type generation, and core utility that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Write database migration `supabase/migrations/00011_gamification_redesign.sql` as a single file with clearly commented sections in this execution order:
  - **Section 1 — Drop old system**: DROP notification triggers (`on_student_trophy_insert`, `on_student_achievement_insert`); DROP tables (`student_trophies`, `student_achievements`, `trophies`, `achievements`, `levels`) with CASCADE (junction tables first, then parent tables)
  - **Section 2 — Modify existing tables**: ALTER `students.current_level` to drop FK to `levels` (keep column as `INTEGER NOT NULL DEFAULT 0`); ALTER `stickers` tier CHECK to remove `'trophy'`; DELETE 10 trophy-tier stickers by handle ID (see data-model.md "Dropped Sticker Seed Data")
  - **Section 3 — Modify existing functions**: Replace `handle_sticker_points()` to remove current_level update logic (keep only `total_points += points_value`); include `SET search_path = public`
  - **Section 4 — Create new tables**: CREATE `quran_rub_reference` (PK on rub_number, CHECK constraints per data-model.md); CREATE `student_rub_certifications` (UUID PK, UNIQUE on student_id+rub_number, 3 indexes per data-model.md, `certified_by ON DELETE RESTRICT`)
  - **Section 5 — RLS policies**: Enable RLS on both new tables; add policies for teacher (via class join), admin (via school_id), student (own), parent (children) per data-model.md; add public SELECT on `quran_rub_reference`
  - **Section 6 — Functions & triggers**: CREATE `increment_review_count(cert_id UUID)` RPC with `SECURITY DEFINER` and `SET search_path = public`; CREATE `updated_at` trigger on `student_rub_certifications`
  - **Section 7 — Seed data**: INSERT 240 rubʿ reference rows (source from alquran.cloud API or quran-meta npm, see research.md R-001)
- [x] T002 Apply migration to remote Supabase project `zngiszdfdowjvwxqmexl` using `mcp apply_migration`
- [x] T003 Regenerate TypeScript types — run type generation and write output to `src/types/database.types.ts`
- [x] T004 Create freshness computation utility in `src/features/gamification/utils/freshness.ts` — export `DECAY_INTERVALS` lookup table (review_count → days per research.md R-002), `getDecayInterval(reviewCount: number): number`, `computeFreshness(lastReviewedAt: string, reviewCount: number): { percent: number; state: FreshnessState; daysRemaining: number }`, `type FreshnessState = 'fresh' | 'fading' | 'warning' | 'critical' | 'dormant'` with percentage bands (75-100=fresh, 50-74=fading, 25-49=warning, 1-24=critical, 0=dormant). Use fractional days with UTC timestamps per research.md R-004

**Checkpoint**: Database migrated, types generated, freshness utility ready. Old DB objects dropped.

---

## Phase 2: US5 — Remove Old Gamification System (Priority: P2, but blocking due to type errors)

**Goal**: Remove all trophy/achievement/old-level app code that will have TypeScript compilation errors after the migration dropped those tables.

**Independent Test**: App compiles with zero TypeScript errors. No mention of trophies or achievements in any user-facing screen. Sticker catalog shows 39 stickers (no trophy tier).

**Why before P1 stories**: The migration (T001) dropped `trophies`, `achievements`, `levels`, `student_trophies`, `student_achievements` tables. After T003 regenerates types, all code referencing those tables will have compilation errors. This phase fixes those errors.

### Implementation for US5

- [x] T005 [US5] Delete `app/(student)/trophy-room.tsx` and remove its route reference from `app/(student)/_layout.tsx` if present
- [x] T006 [US5] Delete `src/features/gamification/hooks/useTrophies.ts`
- [x] T007 [US5] Remove old service methods (GS-005 `getStudentTrophies`, GS-006 `getStudentAchievements`, GS-007 `getLevels`) from `src/features/gamification/services/gamification.service.ts`
- [x] T008 [US5] Remove old types (`TrophyWithStatus`, `AchievementWithStatus`, `GamificationSummary`, `StickerTier` trophy value) from `src/features/gamification/types/gamification.types.ts`; update barrel exports in `src/features/gamification/index.ts`
- [x] T009 [P] [US5] Modify `src/features/dashboard/services/student-dashboard.service.ts` — remove `levels` join from student query (use `.select('*')` instead of joining levels), remove `student_achievements` query from `Promise.all`; modify `src/features/dashboard/types/dashboard.types.ts` — remove achievement/trophy type references
- [x] T010 [P] [US5] Modify `src/features/reports/components/ChildGamificationSummary.tsx` — remove achievements display; modify `src/features/reports/types/reports.types.ts` — remove `achievementsUnlocked` field; modify `src/features/reports/services/parent-reports.service.ts` — remove achievement query
- [x] T011 [P] [US5] Modify `src/features/notifications/config/notification-categories.ts` — remove/update trophy-room deep link; modify `src/features/notifications/types/notifications.types.ts` — remove trophy/achievement notification types; modify `src/features/notifications/components/NotificationPreferences.tsx` — remove trophy/achievement toggle
- [x] T012 [P] [US5] Modify `src/features/realtime/config/subscription-profiles.ts` — remove `student_trophies`/`student_achievements` subscriptions; modify `src/features/realtime/config/event-query-map.ts` — remove trophy/achievement event mappings
- [x] T013 [P] [US5] Modify `src/features/gamification/components/StickerGrid.tsx` — remove 'trophy' tier handling from tier color/label logic; modify `src/features/gamification/components/StickerReveal.tsx` — remove any trophy references
- [x] T014 [P] [US5] Remove trophy/achievement references from shared code: `src/theme/colors.ts`, `src/types/common.types.ts`, `src/lib/islamicIcons/registry.ts`, `src/lib/islamicIcons/icons.tsx`, `src/features/children/types/children.types.ts` — remove all trophy/achievement type imports, constants, and references
- [x] T015 [P] [US5] Modify `src/features/gamification/hooks/useLeaderboard.ts` — remove `levels` join from leaderboard query (change select to exclude `levels!students_current_level_fkey(...)`)
- [x] T016 [P] [US5] Remove trophy/achievement i18n strings from `src/i18n/en.json` and `src/i18n/ar.json`; add rubʿ/certification/freshness i18n strings for both languages (keys: `rub`, `juz`, `hizb`, `certification`, `revision`, `freshness`, `dormant`, `level`, progress map labels, revision quality labels, undo text)

**Checkpoint**: App compiles. Zero references to trophies/achievements. Sticker system works with 39 stickers (trophy tier removed). Leaderboard works without levels join. Dashboard loads without achievements query.

---

## Phase 3: US1 — Teacher Certifies a Rubʿ (Priority: P1) MVP

**Goal**: A teacher can open a student's profile, see the rubʿ progress map, tap an uncertified rubʿ, confirm certification, and see the level increase. Undo within 30 seconds.

**Independent Test**: Teacher opens student profile → sees 30-juz map → taps uncertified rubʿ → confirms → rubʿ turns green → level shows 1/240. Taps "Undo" within 30s → rubʿ returns to uncertified → level shows 0/240.

### Implementation for US1

- [x] T017 [US1] Add new rubʿ TypeScript types to `src/features/gamification/types/gamification.types.ts` — `RubReference` (from DB row), `RubCertification` (from DB row), `EnrichedCertification` (certification + computed freshness fields), `RubProgressItem` (reference + optional certification + freshness state), `CertificationInput`, `FreshnessState` re-export from utils
- [x] T018 [US1] Add US1-scoped service methods to `src/features/gamification/services/gamification.service.ts` — GS-008 `getRubCertifications(studentId)`, GS-009 `certifyRub(input)`, GS-010 `undoCertification(certificationId)`, GS-014 `getRubReference()` — all per contracts/supabase-queries.md
- [x] T019 [P] [US1] Create `src/features/gamification/hooks/useRubReference.ts` — `useRubReference()` hook with infinite staleTime (static data), query key `['rub-reference']`
- [x] T020 [P] [US1] Create `src/features/gamification/hooks/useRubCertifications.ts` — `useRubCertifications(studentId)` hook that fetches certifications via GS-008, uses `useMemo` to enrich each with freshness from `computeFreshness()`, returns enriched list + derived aggregates (`activeCount` = level, `criticalCount`, `dormantCount`). Also builds a `Map<number, EnrichedCertification>` for O(1) lookup by rub_number. Query key `['rub-certifications', studentId]`
- [x] T021 [US1] Create `src/features/gamification/hooks/useCertifyRub.ts` — `useCertifyRub()` mutation hook calling GS-009, on success invalidate `['rub-certifications', studentId]` and `['student-dashboard', studentId]`
- [x] T022 [US1] Create `src/features/gamification/hooks/useUndoCertification.ts` — mutation hook calling GS-010 (delete), on success invalidate same query keys as T021
- [x] T023 [P] [US1] Create `src/features/gamification/components/RubBlock.tsx` — renders a single rubʿ as a colored block (green/yellow/orange/red/gray/dashed-gray based on freshness state), shows rubʿ number, accepts `onPress` prop. Use `boxShadow` per CLAUDE.md rules (no elevation). Use `paddingStart`/`paddingEnd` per constitution V.
- [x] T024 [P] [US1] Create `src/features/gamification/components/JuzRow.tsx` — expandable row showing juz number, completion count (e.g., "5/8"), mini progress bar. On tap, expands to show 8 `RubBlock` components. Use `react-native-reanimated` for expand/collapse animation per constitution VIII.
- [x] T025 [US1] Create `src/features/gamification/components/CertificationDialog.tsx` — confirmation modal showing rubʿ number, juz, hizb context, surah range from reference data. "Certify" and "Cancel" buttons. All strings from i18n.
- [x] T026 [US1] Create `src/features/gamification/components/RubProgressMap.tsx` — renders 30 `JuzRow` components using `FlashList` (per constitution). Accepts `mode: 'interactive' | 'readonly'` and `studentId` props. In interactive mode, uncertified rubʿ tap → `CertificationDialog`; certified rubʿ tap → revision options (handled by US2). Shows level header ("Level N / 240") with progress bar. Shows "N rubʿ need revision" warning count.
- [x] T027 [US1] Integrate `RubProgressMap` (interactive mode) into teacher's student detail view — find the teacher route that shows a student's profile (likely under `app/(teacher)/` routes), add the progress map component. After successful certification, show a snackbar/toast with "Undo" button for ~30 seconds using `useUndoCertification`.
- [x] T028 [US1] Update barrel exports in `src/features/gamification/index.ts` — export all new hooks (useRubReference, useRubCertifications, useCertifyRub, useUndoCertification) and components (RubProgressMap, RubBlock, JuzRow, CertificationDialog)

**Checkpoint**: Teacher can certify rubʿ for a student. Undo works within 30s. Progress map displays correctly. Student level updates.

---

## Phase 4: US2 — Teacher Records a Rubʿ Revision (Priority: P1)

**Goal**: Teacher taps a certified rubʿ on the progress map and marks "Good" or "Poor" revision. Freshness resets accordingly. Dormant recovery works per tiered rules.

**Independent Test**: Teacher taps certified rubʿ → sees "Good" / "Poor" options → selects "Good" → freshness resets to 100% (green), review_count increments. Selects "Poor" → freshness resets to 50% (orange), count unchanged. For dormant rubʿ: 0-30d dormant → "Good" restores; 30-90d → "Good" restores but resets count; 90d+ → shows "Re-certify" option.

### Implementation for US2

- [x] T029 [US2] Add US2-scoped service methods to `src/features/gamification/services/gamification.service.ts` — GS-011 `recordGoodRevision(certificationId, resetReviewCount)`, GS-012 `recordPoorRevision(certificationId)`, GS-013 `recertifyRub(certificationId, certifiedBy)` — per contracts/supabase-queries.md
- [x] T030 [US2] Create `src/features/gamification/hooks/useRecordRevision.ts` — `useRecordRevision()` mutation hook with three modes: `good` (calls `increment_review_count` RPC for atomic increment + clears dormant_since), `poor` (calls GS-012), `recertify` (calls GS-013). Handles dormant recovery logic: checks dormant duration to determine if review_count resets (30-90d) or re-certification required (90d+). Invalidates `['rub-certifications', studentId]` on success.
- [x] T031 [US2] Create `src/features/gamification/components/RevisionSheet.tsx` — `@gorhom/bottom-sheet` component. For active rubʿ: shows "Good" and "Poor" buttons with descriptions. For dormant rubʿ: shows appropriate option based on dormancy duration (revision for 0-90d, "Re-certify" for 90d+). For dormant with "Poor" tap: shows message that poor revision cannot restore dormancy. All strings from i18n.
- [x] T032 [US2] Wire `RevisionSheet` into `RubProgressMap.tsx` — when a certified rubʿ is tapped in interactive mode, open `RevisionSheet` instead of `CertificationDialog`. Pass certification data (freshness state, dormant_since, review_count) to determine which options to show.
- [x] T033 [US2] Update barrel exports in `src/features/gamification/index.ts` — export `useRecordRevision` and `RevisionSheet`

**Checkpoint**: Teacher can record Good/Poor revisions. Dormant recovery works per tiered rules. Freshness resets correctly.

---

## Phase 5: US3 — Student Views Rubʿ Progress Map (Priority: P1)

**Goal**: Student opens progress map and sees read-only view of all 30 juz with freshness-colored rubʿ. Level and revision warning displayed.

**Independent Test**: Student opens progress map → sees "Level N / 240" with progress bar → sees 30 juz rows → expands a juz → sees 8 rubʿ blocks with correct freshness colors → cannot tap to certify or revise (read-only). Warning shows count of rubʿ needing revision.

### Implementation for US3

- [x] T034 [P] [US3] Create `src/features/gamification/components/LevelBadge.tsx` — displays "Level N / 240" with progress bar (N/240 width). Accepts `level: number` prop. All strings from i18n.
- [x] T035 [P] [US3] Create `src/features/gamification/components/RevisionWarning.tsx` — displays "N rubʿ need revision" banner when `criticalCount > 0`. Accepts `count: number` prop. Uses warning color from theme. All strings from i18n.
- [x] T036 [US3] Create `app/(student)/rub-progress.tsx` — student route that renders `RubProgressMap` in `readonly` mode using `useRubCertifications(studentId)` with current user's student ID from auth context. Replaces trophy-room in student navigation.
- [x] T037 [US3] Update student navigation — in `app/(student)/_layout.tsx` or relevant navigation config, replace the old trophy-room route entry with the new `rub-progress` route. Ensure navigation label uses i18n string.

**Checkpoint**: Student can view full progress map in read-only mode. Level and revision warnings display correctly.

---

## Phase 6: US4 — Freshness Decays Over Time (Priority: P2)

**Goal**: Rubʿ freshness decays naturally. When freshness hits 0%, rubʿ goes dormant and student level drops. Dormancy is detected client-side and written back to the server.

**Independent Test**: Certify a rubʿ, set `last_reviewed_at` to 15 days ago (via direct DB edit for testing). Open progress map → rubʿ should show as dormant (gray). Student level should be 0. Mark "Good" revision → rubʿ restores to active, level becomes 1.

### Implementation for US4

- [x] T038 [US4] Add US4-scoped service methods to `src/features/gamification/services/gamification.service.ts` — GS-015 `markDormant(certificationIds)`, GS-016 `updateStudentLevel(studentId, level)` — per contracts/supabase-queries.md
- [x] T039 [US4] Create `src/features/gamification/hooks/useDormancySync.ts` — `useDormancySync(studentId, certifications)` hook that runs on mount and on screen focus (use `useRefreshOnFocus` pattern from `src/hooks/useRefreshOnFocus.ts`). Compares computed freshness against stored `dormant_since`: if any certification has freshness ≤ 0% but `dormant_since IS NULL`, batch-update via GS-015 `markDormant()`. After dormancy write-back, compute new level (count of active certs) and update via GS-016 `updateStudentLevel()`. Invalidate queries after updates.
- [x] T040 [US4] Integrate `useDormancySync` into `useRubCertifications.ts` — call `useDormancySync` after enriching certifications, so dormancy is detected and written back whenever certifications are fetched. Ensure it does not cause infinite re-fetch loops (guard with `useRef` for last sync timestamp).
- [x] T041 [US4] Update barrel exports in `src/features/gamification/index.ts` — export `useDormancySync`

**Checkpoint**: Freshness decays visually. Dormant rubʿ detected and persisted. Level drops when rubʿ go dormant. Level restores when dormant rubʿ are revived via Good revision.

---

## Phase 7: US6 — Student Dashboard Shows Level (Priority: P3)

**Goal**: Student dashboard prominently displays rubʿ-based level with progress bar and revision warning count.

**Independent Test**: Student with 47 active rubʿ opens dashboard → sees "Level 47 / 240" with ~19.6% progress bar. Student with 3 critical rubʿ → sees "3 rubʿ need revision" warning.

### Implementation for US6

- [x] T042 [US6] Modify `src/features/dashboard/services/student-dashboard.service.ts` — add query for active certification count: `supabase.from('student_rub_certifications').select('id', { count: 'exact', head: true }).eq('student_id', studentId).is('dormant_since', null)` and critical count (rubʿ needing revision — certifications where computed freshness is in 'warning' or 'critical' state; alternatively count from `useRubCertifications` hook on the component side)
- [x] T043 [US6] Modify `app/(student)/(tabs)/index.tsx` — replace old level badge (which used `level.title` from levels table) with `LevelBadge` component using `current_level` from student data (or active cert count). Replace old "View Trophies" quick action with "View Progress" linking to `/(student)/rub-progress`. Add `RevisionWarning` component showing critical rubʿ count. Remove old streak/points display if no longer relevant, or keep for sticker leaderboard context.
- [x] T044 [US6] Modify `src/features/dashboard/types/dashboard.types.ts` — add `activeCertCount: number` and `criticalRubCount: number` fields to dashboard data type. Remove old level title references.

**Checkpoint**: Dashboard shows rubʿ-based level, progress bar, and revision warnings. No old level/trophy references remain.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, consistency, and quality checks

- [x] T045 Run Supabase security advisors (`get_advisors type: security`) — verify no missing RLS policies or mutable search_path warnings on new tables/functions
- [x] T046 Run Supabase performance advisors (`get_advisors type: performance`) — verify indexes are properly used
- [x] T047 Verify parent view — confirm `app/(parent)/progress/[childId].tsx` and parent dashboard properly show rubʿ progress for children using the same `RubProgressMap` in read-only mode (may need minor integration if not already handled by existing role-based patterns)
- [x] T048 Full i18n pass — verify all new screens render correctly in both English and Arabic. Confirm RTL layout for progress map (juz rows, rubʿ blocks expand correctly in RTL). Verify number formatting (Arabic-Indic numerals if applicable).
- [x] T049 Run quickstart.md verification checklist — walk through all 11 verification items in `specs/001-gamification-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phase 2 (US5 — Remove Old)**: Depends on Phase 1 (T003 type regeneration) — BLOCKS all new feature work
- **Phase 3 (US1 — Certify)**: Depends on Phase 2 — first new feature phase
- **Phase 4 (US2 — Revision)**: Depends on Phase 3 (uses RubProgressMap, hooks from US1)
- **Phase 5 (US3 — Student View)**: Depends on Phase 3 (uses RubProgressMap, hooks from US1). Can run in parallel with Phase 4.
- **Phase 6 (US4 — Decay)**: Depends on Phase 3 (uses useRubCertifications). Can run in parallel with Phase 4/5.
- **Phase 7 (US6 — Dashboard)**: Depends on Phase 5 (uses LevelBadge, RevisionWarning from US3)
- **Phase 8 (Polish)**: Depends on all previous phases

### User Story Dependencies

```
Phase 1: Foundational
    │
    v
Phase 2: US5 (Remove Old) ──── BLOCKS ALL ────┐
    │                                           │
    v                                           │
Phase 3: US1 (Certify) ◄───────────────────────┘
    │
    ├───────────────┬───────────────┐
    v               v               v
Phase 4: US2    Phase 5: US3    Phase 6: US4
(Revision)      (Student View)  (Decay)
                    │
                    v
                Phase 7: US6
                (Dashboard)
                    │
                    v
                Phase 8: Polish
```

### Within Each Phase

- Tasks marked `[P]` within a phase can run in parallel
- Sequential tasks depend on prior tasks in that phase
- Service methods (T018) and types (T017) before hooks that use them
- Hooks before components that use them
- Components before route integration

### Parallel Opportunities

**Within Phase 2 (US5)**: T009–T016 are all `[P]` — they modify independent files and can all run in parallel after T005–T008 complete.

**Within Phase 3 (US1)**: T019 and T020 (hooks), T023 and T024 (components) can run in parallel.

**Across Phases**: Once Phase 3 (US1) is complete, Phases 4 (US2), 5 (US3), and 6 (US4) can all start in parallel.

---

## Parallel Example: Phase 2 (US5)

```
# Sequential first (shared gamification files):
T005 Delete trophy-room.tsx
T006 Delete useTrophies.ts
T007 Remove old service methods from gamification.service.ts
T008 Remove old types from gamification.types.ts

# Then parallel (independent files):
T009 Dashboard service/types
T010 Reports components/types/service
T011 Notifications config/types/components
T012 Realtime config
T013 Sticker components
T014 Shared code (colors, icons, etc.)
T015 Leaderboard hook
T016 i18n strings
```

## Parallel Example: Phase 3 (US1)

```
# Sequential first:
T017 New types in gamification.types.ts
T018 US1 service methods in gamification.service.ts

# Then parallel (independent hook files):
T019 useRubReference.ts
T020 useRubCertifications.ts

# Then (depends on hooks):
T021 useCertifyRub.ts
T022 useUndoCertification.ts

# Then parallel (independent component files):
T023 RubBlock.tsx
T024 JuzRow.tsx
T025 CertificationDialog.tsx

# Then (depends on all above):
T026 RubProgressMap.tsx
T027 Teacher integration + undo snackbar
T028 Barrel exports
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Foundational (migration, types, freshness utility)
2. Complete Phase 2: US5 (remove old code — required for compilation)
3. Complete Phase 3: US1 (teacher certifies rubʿ)
4. **STOP AND VALIDATE**: Teacher can certify rubʿ, see progress map, undo
5. Deploy/demo if ready — this is the core value proposition

### Incremental Delivery

1. Foundational + US5 → Clean codebase, old system gone
2. Add US1 (Certify) → Core teacher action works → **MVP**
3. Add US2 (Revision) → Full teacher workflow (certify + revise)
4. Add US3 (Student View) → Students see their progress
5. Add US4 (Decay) → System becomes "honest" (levels can drop)
6. Add US6 (Dashboard) → Full integration
7. Polish → Security, i18n, parent views

Each increment is independently testable and adds value without breaking previous work.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to user story from spec.md
- US5 is P2 in the spec but executes before P1 stories due to compilation dependency
- Commit after each task or logical group
- The rubʿ seed data (T001 Section 7) requires sourcing 240 verse boundaries — see research.md R-001
- T001 migration is a single SQL file with 7 clearly commented sections — execute sections in order within the file
- Service methods are split across story phases: US1 (T018: GS-008/009/010/014), US2 (T029: GS-011/012/013), US4 (T038: GS-015/016)
- All components must use `boxShadow` (not elevation), logical CSS (paddingStart/End), and i18n strings
- All hooks follow TanStack Query patterns established in existing codebase (see useStickers.ts, useStickerCollection)
