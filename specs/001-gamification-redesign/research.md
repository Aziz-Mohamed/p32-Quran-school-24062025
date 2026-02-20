# Research: Gamification Redesign

**Feature**: 001-gamification-redesign
**Date**: 2026-02-20

## R-001: Rubʿ Verse Boundary Data Source

**Decision**: Use Tarteel QUL JSON export as primary source, cross-verified with alquran.cloud API.

**Rationale**: Tarteel QUL provides a pre-built JSON with `rub_number`, `first_verse_key`, `last_verse_key`, and `verse_mapping` for all 240 entries. The `juz_number`, `hizb_number`, and `quarter_in_hizb` are deterministic from `rub_number` (simple arithmetic: `juz = ceil(rub/8)`, `hizb = ceil(rub/4)`, `quarter = ((rub-1) % 4) + 1`). Multiple sources (quran-meta npm, alquran.cloud API, Quran Foundation API) were verified to produce identical boundaries.

**Alternatives Considered**:
- `quran-meta` npm package (MIT): Good TypeScript support but uses global ayah IDs needing conversion to surah:ayah
- alquran.cloud API: Reliable but requires 240 HTTP calls to construct dataset
- malekverse/quran-dataset: Per-ayah CSV, requires grouping by `hizb_quarter` field

**Sources**:
- https://qul.tarteel.ai/resources/quran-metadata/63
- https://www.npmjs.com/package/quran-meta
- https://alquran.cloud/api

---

## R-002: Freshness Computation Architecture

**Decision**: Pure utility function + `useMemo` in a custom hook. No server-side computation.

**Rationale**: The spec states freshness is computed on read. The codebase pattern (`useStickerCollection`) already derives data inline from query results. `useMemo` ensures the 240-item computation only runs when query data changes. No TanStack Query `select` option (not used anywhere in the codebase). Performance is a non-concern: 240 iterations with simple arithmetic completes in sub-millisecond.

**Alternatives Considered**:
- Supabase RPC / Postgres function: Would require round-trip on every screen focus; freshness would be stale on arrival
- TanStack Query `select`: Not established in codebase; designed for subsetting, not enrichment
- Per-component computation: Would cause 240 separate computation passes per render

---

## R-003: Dormancy Detection Strategy

**Decision**: Lazy client write-back as primary mechanism. Optional daily cron Edge Function as secondary (deferrable).

**Rationale**: The spec says `dormant_since` is updated "when the system detects a rubʿ has crossed the dormancy threshold." On app open/focus, the hook computes freshness for all certifications. Any certification where freshness ≤ 0% and `dormant_since IS NULL` gets batch-updated via a single Supabase `.update()`. This is idempotent and race-safe (multiple clients detecting same dormancy is fine). The project already has Edge Functions infrastructure for push notifications, so a daily cron can be added later for data consistency when no client has opened the app.

**Alternatives Considered**:
- Postgres trigger-on-read: Not supported in PostgreSQL
- Background Edge Function cron only: Would miss real-time UI updates; level would lag
- Computed column/view: `dormant_since` needs to be a persisted timestamp for tiered recovery (0-30d, 30-90d, 90+d)

---

## R-004: Time Zone Handling

**Decision**: UTC everywhere. No time zone conversion needed.

**Rationale**: All database timestamps use `TIMESTAMPTZ` (stored as UTC). Supabase returns ISO 8601 with `+00:00`. Freshness is a duration-based calculation (`now_utc - last_reviewed_at_utc`), so results are identical regardless of user's time zone. Shortest decay interval is 14 days — time zone differences (max ~12 hours) represent < 4% of the interval, well within the spec's 1% freshness tolerance. Use fractional days for smooth decay bar.

---

## R-005: Sticker Tier Cleanup

**Decision**: Remove 10 trophy-tier stickers via migration. Update CHECK constraint to remove 'trophy' tier. 39 stickers remain.

**Rationale**: The trophy tier (10 stickers at 75 points each) was designed to overlap with the old trophy/achievement system. With trophies removed, these stickers lose their conceptual meaning. The spec requires exactly 39 stickers across 5 tiers (common, rare, epic, legendary, seasonal). The `handle_sticker_points()` trigger needs to be modified to stop updating `current_level`.

**Trophy-tier sticker IDs to remove**:
`memorization-excellence`, `perfect-tajweed`, `consistent-recitation`, `best-effort`, `helping-others`, `streak-master`, `streak-7-days`, `streak-30-days`, `complete-full-juz`, `top-of-leaderboard-for-week`

---

## R-006: Old System Removal Scope

**Decision**: Drop tables and triggers in a single migration. Remove all app code references.

**Rationale**: No production data exists (confirmed in spec assumptions). Clean drop is safe.

**Database objects to drop**:
- Tables: `trophies`, `student_trophies`, `achievements`, `student_achievements`, `levels`
- Triggers: `on_student_trophy_insert`, `on_student_achievement_insert` (on notification webhooks)
- Trigger function modification: `handle_sticker_points()` — remove `current_level` update logic
- Students table: Remove FK constraint `students_current_level_fkey` to `levels`, repurpose `current_level` as computed integer (no FK)

**App files to remove/modify** (24 files reference trophies/achievements):
- **Delete**: `app/(student)/trophy-room.tsx`, `src/features/gamification/hooks/useTrophies.ts`
- **Modify (remove trophy/achievement code)**: `gamification.service.ts`, `gamification.types.ts`, `gamification/index.ts`, `student-dashboard.service.ts`, `dashboard.types.ts`, `StickerGrid.tsx`, `StickerReveal.tsx`, `ChildGamificationSummary.tsx`, `reports.types.ts`, `parent-reports.service.ts`, `notification-categories.ts`, `notifications.types.ts`, `NotificationPreferences.tsx`, `subscription-profiles.ts`, `event-query-map.ts`, `colors.ts`, `common.types.ts`, `registry.ts`, `icons.tsx`, `children.types.ts`, `en.json`, `ar.json`

---

## R-007: Level Computation Strategy

**Decision**: Level = COUNT of active (non-dormant) certifications, computed client-side. `students.current_level` updated via lazy write-back (same as dormancy detection).

**Rationale**: Level is derived data — it equals the count of `student_rub_certifications` where `dormant_since IS NULL`. Computing it client-side avoids background jobs. The `current_level` column on `students` serves as a cached value for leaderboard queries and dashboard display without needing to join certifications. Updated alongside dormancy write-back.

**Alternatives Considered**:
- Postgres trigger on certifications table: Would handle inserts but not time-based dormancy
- Remove `current_level` column entirely: Would require joining certifications in every leaderboard/dashboard query
- Database view: Read-only, cannot be cached or indexed for leaderboard sorting
