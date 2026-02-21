# Data Model: Gamification Redesign

**Feature**: 001-gamification-redesign
**Date**: 2026-02-20

## New Tables

### `quran_rub_reference` (Static, Global)

Fixed Quran structural reference data. 240 rows, never changes after seeding.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `rub_number` | `INTEGER` | `PRIMARY KEY`, `CHECK (1..240)` | The rubʿ number (1-240) |
| `juz_number` | `SMALLINT` | `NOT NULL`, `CHECK (1..30)` | Which juz (1-30) |
| `hizb_number` | `SMALLINT` | `NOT NULL`, `CHECK (1..60)` | Which hizb (1-60) |
| `quarter_in_hizb` | `SMALLINT` | `NOT NULL`, `CHECK (1..4)` | Position within the hizb (1-4) |
| `start_surah` | `SMALLINT` | `NOT NULL`, `CHECK (1..114)` | Starting surah number |
| `start_ayah` | `SMALLINT` | `NOT NULL`, `CHECK (>= 1)` | Starting ayah number |
| `end_surah` | `SMALLINT` | `NOT NULL`, `CHECK (1..114)` | Ending surah number |
| `end_ayah` | `SMALLINT` | `NOT NULL`, `CHECK (>= 1)` | Ending ayah number |

**Indexes**: None needed (PK covers the only lookup pattern: by `rub_number`).

**RLS**: Public read. No writes (seeded by migration only).

**Relationships**: Referenced by `student_rub_certifications.rub_number`.

---

### `student_rub_certifications` (Per-Student, School-Scoped via FK)

Tracks a student's mastery record for each rubʿ. One row per student per rubʿ.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Row ID |
| `student_id` | `UUID` | `NOT NULL`, `FK → students(id) ON DELETE CASCADE` | Which student |
| `rub_number` | `INTEGER` | `NOT NULL`, `FK → quran_rub_reference(rub_number)` | Which rubʿ (1-240) |
| `certified_by` | `UUID` | `NOT NULL`, `FK → profiles(id) ON DELETE RESTRICT` | Teacher who certified (cannot delete teacher while certifications exist) |
| `certified_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | When first certified |
| `review_count` | `INTEGER` | `NOT NULL`, `DEFAULT 0`, `CHECK (>= 0)` | Successful "Good" revision count |
| `last_reviewed_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last revision timestamp (or certification time if never revised) |
| `dormant_since` | `TIMESTAMPTZ` | `NULL` | When rubʿ went dormant (NULL = active) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Row creation |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last update |

**Unique Constraint**: `UNIQUE(student_id, rub_number)` — one certification per student per rubʿ (FR-018).

**Indexes**:
- `idx_rub_certifications_student` on `(student_id)` — primary query pattern
- `idx_rub_certifications_student_active` on `(student_id) WHERE dormant_since IS NULL` — for level count
- `idx_rub_certifications_dormant` on `(student_id, dormant_since) WHERE dormant_since IS NOT NULL` — for dormancy queries

**RLS Policies** (follows `student_stickers` pattern):
- Teacher: SELECT + INSERT + UPDATE on class students (`JOIN classes ON teacher_id = auth.uid()`)
- Admin: SELECT + INSERT + UPDATE on school students (`school_id = get_user_school_id()`)
- Student: SELECT own records (`student_id = auth.uid()`)
- Parent: SELECT children's records (`parent_id = auth.uid()`)

**Trigger**: `updated_at` auto-update trigger (standard pattern from constitution).

---

## Modified Tables

### `students` (Existing)

| Column | Change | Details |
|--------|--------|---------|
| `current_level` | **Repurpose** | Remove FK to `levels`. Remains as `INTEGER NOT NULL DEFAULT 0`. Now stores count of active certifications (cached, updated by app layer). |
| `total_points` | **Keep** | Still used for sticker leaderboard |
| `current_streak` | **Keep** | Still used for display |
| `longest_streak` | **Keep** | Still used for display |

### `stickers` (Existing)

| Column | Change | Details |
|--------|--------|---------|
| `tier` | **Modify CHECK** | Remove `'trophy'` from CHECK constraint: `CHECK (tier IN ('common','rare','epic','legendary','seasonal'))` |

### `handle_sticker_points()` (Existing Trigger Function)

| Change | Details |
|--------|---------|
| Remove `current_level` update | Keep only `total_points += sticker.points_value`. Remove the subquery to `levels` table. |

---

## Dropped Tables

| Table | Reason |
|-------|--------|
| `trophies` | Old gamification — replaced by rubʿ levels |
| `student_trophies` | Old gamification — no longer tracked |
| `achievements` | Old gamification — replaced by rubʿ levels |
| `student_achievements` | Old gamification — no longer tracked |
| `levels` | Old point-based levels — replaced by rubʿ count |

## Dropped Triggers

| Trigger | Table | Reason |
|---------|-------|--------|
| `on_student_trophy_insert` | `student_trophies` | Table dropped |
| `on_student_achievement_insert` | `student_achievements` | Table dropped |

## Dropped Sticker Seed Data

10 trophy-tier stickers removed by ID:
`memorization-excellence`, `perfect-tajweed`, `consistent-recitation`, `best-effort`, `helping-others`, `streak-master`, `streak-7-days`, `streak-30-days`, `complete-full-juz`, `top-of-leaderboard-for-week`

---

## State Transitions

### Rubʿ Certification Lifecycle

```
[Uncertified]
    │
    ├── Teacher certifies → [Active] (freshness 100%, review_count 0)
    │                           │
    │   ┌───────────────────────┤
    │   │                       │
    │   │  "Good" revision ←────┤── freshness decays over time
    │   │  (reset 100%,         │
    │   │   review_count + 1)   │
    │   │                       │
    │   │  "Poor" revision ←────┤
    │   │  (reset 50%,          │
    │   │   count unchanged)    │
    │   │                       │
    │   └───────────────────────┤
    │                           │
    │                   freshness hits 0%
    │                           │
    │                    [Dormant] (dormant_since = now())
    │                           │
    │           ┌───────────────┼───────────────┐
    │           │               │               │
    │      0-30 days       30-90 days       90+ days
    │           │               │               │
    │    "Good" revision  "Good" revision  Re-certify
    │    (restore active, (restore active, (reset all,
    │     keep count)      reset count=0)   new certification)
    │           │               │               │
    │           └───────┬───────┘               │
    │                   │                       │
    │              [Active]                [Active]
    │                                   (fresh start)
    │
    ├── Undo (within 30s) → [Uncertified] (row deleted)
```

### Freshness States (Client-Computed)

| State | Freshness % | Color | Meaning |
|-------|-------------|-------|---------|
| Fresh | 75-100% | Green | Recently reviewed, no action needed |
| Fading | 50-74% | Yellow | Starting to fade, review soon |
| Warning | 25-49% | Orange | Needs revision |
| Critical | 1-24% | Red | Urgent — approaching dormancy |
| Dormant | 0% | Gray (solid) | Gone dormant, level decreased |
| Uncertified | N/A | Gray (dashed border) | Not yet certified |

### Spaced Repetition Decay Intervals

| Review Count | Decay Interval (days) |
|-------------|----------------------|
| 0 | 14 |
| 1 | 21 |
| 2 | 30 |
| 3 | 45 |
| 4-5 | 60 |
| 6-8 | 75 |
| 9-11 | 90 |
| 12+ | 120 |

**Formula**: `freshness = max(0, (1 - days_elapsed / interval_days)) * 100`

Where `days_elapsed = (Date.now() - Date.parse(last_reviewed_at)) / MS_PER_DAY` (fractional days, UTC).

---

## Entity Relationship Summary

```
profiles (existing)
  │
  ├──< students (existing, modified)
  │     ├── current_level: INTEGER (cached count, no FK)
  │     ├── total_points: INTEGER (sticker leaderboard)
  │     │
  │     └──< student_rub_certifications (NEW)
  │           ├── rub_number → quran_rub_reference
  │           └── certified_by → profiles
  │
  └──< student_stickers (existing, unchanged)
        └── sticker_id → stickers (modified: 'trophy' tier removed)

quran_rub_reference (NEW, static 240 rows)
  └──< student_rub_certifications.rub_number
```
