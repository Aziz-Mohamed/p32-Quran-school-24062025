# Quickstart: Gamification Redesign

**Feature**: 001-gamification-redesign
**Date**: 2026-02-20

## Prerequisites

- Supabase project `zngiszdfdowjvwxqmexl` running (region: eu-west-1)
- Existing migrations 00001–00010 applied
- Expo dev environment set up

## Implementation Order

### Phase 1: Database Migration

Apply a single new migration (`00011_gamification_redesign.sql`) that:

1. **Drops old tables** (CASCADE): `student_trophies`, `student_achievements`, `trophies`, `achievements`, `levels`
2. **Drops old triggers**: `on_student_trophy_insert`, `on_student_achievement_insert`
3. **Creates `quran_rub_reference`** table (240 rows) with seed data
4. **Creates `student_rub_certifications`** table with indexes, RLS, and `updated_at` trigger
5. **Modifies `handle_sticker_points()`**: Remove `current_level` update logic (keep `total_points` addition)
6. **Modifies `students.current_level`**: Drop FK to `levels`, keep column as plain `INTEGER NOT NULL DEFAULT 0`
7. **Modifies `stickers` tier CHECK**: Remove `'trophy'` value, delete trophy-tier seed rows
8. **Creates `increment_review_count` RPC** function

### Phase 2: Type Generation

After migration, regenerate TypeScript types:
- `npx supabase gen types typescript --project-id zngiszdfdowjvwxqmexl > src/types/database.types.ts`

### Phase 3: App Code — Remove Old System

1. **Delete files**:
   - `app/(student)/trophy-room.tsx`
   - `src/features/gamification/hooks/useTrophies.ts`

2. **Modify gamification feature**:
   - `gamification.service.ts`: Remove GS-005, GS-006, GS-007; add GS-008 through GS-016
   - `gamification.types.ts`: Remove `TrophyWithStatus`, `AchievementWithStatus`, `GamificationSummary`; add rubʿ types
   - `gamification/index.ts`: Update barrel exports

3. **Modify sticker code**:
   - `StickerGrid.tsx`: Remove 'trophy' tier handling
   - `StickerReveal.tsx`: Remove trophy references

4. **Modify dashboard**:
   - `student-dashboard.service.ts`: Remove `levels` join and `student_achievements` query; add cert count
   - `dashboard.types.ts`: Update types

5. **Modify reports**:
   - `ChildGamificationSummary.tsx`: Remove achievements display
   - `reports.types.ts`: Remove achievement fields
   - `parent-reports.service.ts`: Remove achievement queries

6. **Modify notifications**:
   - `notification-categories.ts`: Remove/update trophy-room deep link
   - `notifications.types.ts`: Remove trophy/achievement notification types
   - `NotificationPreferences.tsx`: Remove trophy/achievement toggle

7. **Modify realtime**:
   - `subscription-profiles.ts`: Remove trophy/achievement subscriptions
   - `event-query-map.ts`: Remove trophy/achievement event mappings

8. **Modify i18n**:
   - `en.json`: Remove trophy/achievement strings, add rubʿ/certification strings
   - `ar.json`: Same

### Phase 4: App Code — Build New System

1. **Freshness utility** (`src/features/gamification/utils/freshness.ts`):
   - `getDecayInterval(reviewCount)` — lookup table
   - `computeFreshness(lastReviewedAt, reviewCount)` — returns percentage + state
   - `getFreshnessState(percent)` — returns color/label

2. **New hooks** (`src/features/gamification/hooks/`):
   - `useRubReference()` — fetch + cache 240-row reference (infinite staleTime)
   - `useRubCertifications(studentId)` — fetch certifications + compute freshness via `useMemo`
   - `useCertifyRub()` — mutation: certify + invalidate
   - `useUndoCertification()` — mutation: delete + invalidate
   - `useRecordRevision()` — mutation: good/poor/re-certify + invalidate
   - `useDormancySync(studentId)` — detect dormancy + lazy write-back

3. **New components** (`src/features/gamification/components/`):
   - `RubProgressMap.tsx` — juz-based navigation (30 rows)
   - `JuzRow.tsx` — single juz with completion count + expand/collapse
   - `RubBlock.tsx` — single rubʿ with freshness color + tap handler
   - `CertificationDialog.tsx` — confirm certification (rubʿ number, juz, hizb context)
   - `RevisionSheet.tsx` — Good/Poor/Re-certify options (bottom sheet)
   - `LevelBadge.tsx` — "Level N / 240" with progress bar
   - `RevisionWarning.tsx` — "N rubʿ need revision" banner

4. **New route** (`app/(student)/rub-progress.tsx`):
   - Replaces trophy-room in navigation
   - Uses `RubProgressMap` in read-only mode for students

5. **Teacher view integration**:
   - Add `RubProgressMap` to teacher's student detail screen (interactive mode)

6. **Dashboard integration**:
   - Replace level badge with new `LevelBadge` component
   - Add `RevisionWarning` component

## Verification Checklist

After implementation, verify:

- [ ] Teacher can certify a rubʿ → level increases
- [ ] Teacher can undo within 30 seconds
- [ ] Student sees progress map with correct freshness colors
- [ ] Teacher can mark Good revision → freshness resets to 100%
- [ ] Teacher can mark Poor revision → freshness resets to 50%
- [ ] Dormant rubʿ drops student level
- [ ] Trophy Room route is gone
- [ ] No mention of trophies/achievements in app
- [ ] Sticker awards don't affect level
- [ ] Leaderboard still works (sticker points)
- [ ] 39 stickers in catalog (10 trophy-tier removed)
