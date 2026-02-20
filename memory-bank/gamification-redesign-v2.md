# Gamification Redesign v2

**Status:** Design Finalized
**Date:** 2026-02-20
**Supersedes:** Previous gamification model (points → levels, trophies, achievements)

> **Key context:** The app is a **school management tool** — actual teaching happens on Google Meet / in-person. The teacher comes to the app to record progress, certify rubʿ, mark revisions, and award stickers. No audio, video, or in-app recitation.

---

## 1. Core Philosophy

The gamification system has **two concepts only**:

| Concept | Purpose | Who Controls It |
|---------|---------|-----------------|
| **Levels (0–240)** | Real Quran memorization progress | Teacher certifies, student maintains via revision |
| **Stickers** | Social currency for encouragement & competition | Teacher awards manually |

**No trophies. No achievements. No points-to-levels conversion.**

Maximum simplicity — a new user understands the entire system in one sentence:
> "Memorize rubʿ to level up. Collect stickers from your teacher along the way."

---

## 2. Levels — Real Quran Memorization Progress

### 2.1 The Quran's Natural Structure = The Level System

The Quran has a built-in 3-tier structure:

| Unit | Count | Relationship |
|------|-------|-------------|
| **Juz** (جزء) | 30 | The Quran is divided into 30 juz |
| **Hizb** (حزب) | 60 | Each juz has 2 hizb |
| **Rubʿ** (ربع) | 240 | Each hizb has 4 rubʿ (quarters) |

**Each rubʿ = one level.** 240 rubʿ in the Quran = 240 possible levels.

- **Level 0** = just starting
- **Level 1** = first rubʿ certified
- **Level 120** = halfway through the Quran
- **Level 240** = Hafiz (memorized the entire Quran)

### 2.2 How Levels Work

- **Teacher explicitly certifies** a rubʿ as memorized (a deliberate, meaningful action — like a mini-graduation)
- Students don't memorize linearly — they may start with Juz 30 (Amma) and jump around
- **Level = count of currently FRESH rubʿ** (not just "ever certified" — see decay below)
- The specific rubʿ completed are tracked separately (like a game world map with unlocked areas)

### 2.3 No Level Titles — Just Numbers

No titles (Beginner, Seeker, etc.). The number IS the meaning:
- Level 47 = 47 rubʿ actively memorized
- Level 240 = Hafiz

```
Level 47 / 240
████████░░░░░░░░░░░░ 19.6%
3 rubʿ need revision ⚠️
```

### 2.4 Freshness & Decay (Living Progress)

**Memorization is not permanent.** It fades without revision (muraja'a). This is a fundamental reality of Quran memorization and a core principle of this system.

- Each certified rubʿ has a **freshness state** that decays over time
- **Level = count of currently fresh rubʿ** — the level CAN drop
- When a student does a revision session covering a rubʿ → freshness resets
- If no revision for too long → rubʿ goes dormant → level drops
- **Decay never pauses** — not for school breaks, not for vacations. The Quran doesn't take breaks.

### 2.5 Spaced Repetition Decay Model

The more you revise a rubʿ, the slower it decays. Well-tended memorization becomes more durable.

| Successful Reviews | Days Before Dormant |
|---|---|
| 0 (just certified) | 14 days |
| 1 | 21 days |
| 2 | 30 days |
| 3 | 45 days |
| 5 | 60 days |
| 8 | 90 days |
| 12+ | 120 days |

### 2.6 Freshness States

Within a decay interval, freshness decreases linearly:

```
0% of interval elapsed:    ████████████ 100%  (Green — fresh)
25% of interval:           ████████░░░░  75%  (Yellow — getting stale)
50% of interval:           █████░░░░░░░  50%  (Orange — needs attention)
75% of interval:           ███░░░░░░░░░  25%  (Red — fading)
100% of interval:          ░░░░░░░░░░░░   0%  (Gray — dormant, no longer counts toward level)
```

**Example:** A rubʿ with review_count = 3 has a 45-day decay interval:
- Day 0 (last revision): 100% green
- Day 11: 75% yellow
- Day 22: 50% orange
- Day 33: 25% red
- Day 45: dormant — level drops by 1

### 2.7 Revision Quality — Good or Poor

The teacher marks revision quality when recording a rubʿ revision:

| Revision Quality | Effect |
|---|---|
| **Good** | Freshness → 100%, review_count += 1, decay interval extends |
| **Poor** | Freshness → 50%, review_count unchanged, interval stays same |

A poor revision buys time but doesn't strengthen the memory. Only good revisions deepen long-term retention.

### 2.8 Partial Coverage Rule

A revision must cover the **entire rubʿ's verse range**. Partial overlap does not refresh it.

### 2.9 How Revisions Are Recorded

Since teaching happens on Google Meet (not in-app), the teacher **manually marks revisions** in the app:
1. Teacher opens the student's rubʿ progress map
2. Taps a certified rubʿ
3. Selects "Good" or "Poor"
4. Freshness resets accordingly

### 2.10 Dormant Recovery — Tiered by Duration

When a rubʿ reaches 0% freshness (dormant), recovery depends on how long it's been dormant:

| Time Past Dormant | Recovery Method |
|---|---|
| 0–30 days | Good revision session restores it |
| 30–90 days | Good revision restores, but review_count resets to 0 (spaced rep restarts from scratch) |
| 90+ days | Full re-certification by teacher required (the rubʿ was truly lost) |

### 2.11 Per-Rubʿ Tracking Data

Each certified rubʿ stores:
- `rub_number` — which rubʿ (1-240)
- `student_id` — who
- `certified_at` — when originally certified
- `certified_by` — which teacher
- `review_count` — successful revision count (drives decay interval)
- `last_reviewed_at` — timestamp of most recent revision
- `dormant_since` — NULL if active, timestamp if dormant
- Computed: `freshness` (0-100%), `days_until_dormant`, `decay_interval_days`

---

## 3. Stickers — Social Currency

### 3.1 What They Are

- **39 heritage-themed collectible stickers** illustrated with Islamic art, cultural artifacts, and Quranic motifs
- Awarded manually by teachers for encouragement
- **Repeatable** — same sticker can be earned multiple times (no uniqueness constraint)
- Have point values (10-100 depending on tier)
- Points drive **leaderboard ranking only** — not levels

### 3.2 Tiers

| Tier | Count | Points Each |
|------|-------|-------------|
| Common | 8 | 10 |
| Common+ | 4 | 15 |
| Rare | 9 | 25 |
| Epic | 10 | 50 |
| Legendary | 2 | 100 |
| Seasonal | 6 | 30 |
| **Total** | **39** | |

> **Removed:** 10 "trophy" tier stickers (Memorization Excellence, Perfect Tajweed, 7-Day Streak, etc.) — they overlapped with the old trophy system and don't fit the new model.
> Full sticker catalog is documented in `memory-bank/gamification-system.md` Section 4.

### 3.3 Purpose

- Build teacher-student relationship
- Friendly competition among peers (leaderboard)
- Daily positive reinforcement
- Collection pride (heritage theme resonates with identity)

### 3.4 What Stickers Do NOT Do

- **Don't affect levels** — a teacher can't inflate a student's level with stickers
- **Don't determine rank** as a Quran student
- Are purely social/motivational
- Sticker points drive the leaderboard, not Quran mastery standing

### 3.5 Leaderboard

- Class-scoped (each class has its own)
- Ranked by total sticker points (descending)
- Top 10 displayed
- "All-time" and "weekly" periods
- This is the **social competition track** — separate from the personal mastery track (levels)

---

## 4. What Gets Removed

| Item | Tables | Reason |
|------|--------|--------|
| **Trophies** | `trophies`, `student_trophies` | Replaced by levels — milestones are just level thresholds (8, 60, 120, 240) |
| **Achievements** | `achievements`, `student_achievements` | Same as trophies — unnecessary complexity |
| **Points-to-levels mapping** | `levels` table (old 10-level system) | Levels now driven by rubʿ count, not sticker points |
| **`handle_sticker_points()` → level update** | Part of trigger | Sticker points still awarded but no longer update `students.current_level` |
| **Notification triggers** | On `student_trophies`, `student_achievements` | Tables removed, triggers removed |
| **Trophy Room screen** | `app/(student)/trophy-room.tsx` | Replaced by Rubʿ Progress Map |
| **Trophy-tier stickers** | 10 stickers in `stickers` table | Removed — overlap with old trophy concept |

### Notification preferences to remove:
- `trophy_earned`
- `achievement_unlocked`

### Notification preferences to add:
- `level_up` — when student's level increases
- `rub_fading` — when certified rubʿ are approaching dormancy

---

## 5. What Gets Added

### 5.1 New Database Concepts

| Concept | Description |
|---------|-------------|
| **Rubʿ reference data** | Static mapping of 240 rubʿ with verse boundaries (which surah:ayah each rubʿ starts and ends at) |
| **Rubʿ certifications** | Per-student tracking of which rubʿ are certified, their freshness, review count, and decay state |
| **Certification action** | Teacher-facing action to certify a student's rubʿ as memorized |

### 5.2 New Schema (Conceptual)

#### `quran_rub_reference` (static, 240 rows)

Reference table defining the verse boundaries of each rubʿ.

| Column | Type | Description |
|--------|------|-------------|
| `rub_number` | INTEGER PRIMARY KEY | 1-240 |
| `juz_number` | INTEGER NOT NULL | 1-30 |
| `hizb_number` | INTEGER NOT NULL | 1-60 |
| `quarter_in_hizb` | INTEGER NOT NULL | 1-4 |
| `start_surah` | INTEGER NOT NULL | Starting surah number |
| `start_ayah` | INTEGER NOT NULL | Starting ayah number |
| `end_surah` | INTEGER NOT NULL | Ending surah number |
| `end_ayah` | INTEGER NOT NULL | Ending ayah number |
| `total_ayahs` | INTEGER NOT NULL | Total ayahs in this rubʿ |

#### `student_rub_certifications` (per-student)

Tracks each student's certified rubʿ and their freshness state.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PRIMARY KEY | |
| `student_id` | UUID NOT NULL FK → students | |
| `rub_number` | INTEGER NOT NULL FK → quran_rub_reference | Which rubʿ |
| `certified_by` | UUID NOT NULL FK → profiles | Teacher who certified |
| `certified_at` | TIMESTAMPTZ NOT NULL | When first certified |
| `review_count` | INTEGER NOT NULL DEFAULT 0 | Successful revisions (drives decay interval) |
| `last_reviewed_at` | TIMESTAMPTZ NOT NULL | Last revision timestamp (starts as certified_at) |
| `dormant_since` | TIMESTAMPTZ NULL | NULL = active; timestamp = when it went dormant |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| UNIQUE | (student_id, rub_number) | One certification per student per rubʿ |

#### Modified `students` table

| Change | Description |
|--------|-------------|
| `current_level` | Redefine from INTEGER FK → levels to computed value: count of active (non-dormant) certified rubʿ |
| Remove `total_points` → level linkage | Points still exist for leaderboard, but don't affect level |

---

## 6. What Stays the Same

| Feature | Notes |
|---------|-------|
| Sticker catalog (49 heritage stickers) | Unchanged |
| Sticker awarding flow | Teacher awards, trigger adds points to `students.total_points` |
| Sticker reveal animations | `is_new` flag, confetti effect |
| Sticker collection view | Unchanged |
| Leaderboard | Still points-based, class-scoped |
| Session tracking | Unchanged (memorization, tajweed, recitation types) |
| Push notifications for sticker awards | Unchanged |
| Realtime for `student_stickers` | Unchanged |

---

## 7. Teacher Workflow — Certification & Revision UX

Since teaching happens outside the app (Google Meet / in-person), the teacher comes to the app to record what happened. All rubʿ actions are **manual teacher actions** on the student's profile page.

### 7.1 Certification Flow

1. Teacher opens student profile
2. Sees **rubʿ progress map** (juz-based: 30 juz rows, each expandable to 8 rubʿ)
3. Taps an uncertified rubʿ (gray)
4. Confirmation dialog: "Certify Rubʿ X (Juz Y, Hizb Z)?"
5. Confirms → rubʿ certified, freshness starts at 100% (green), level increases

### 7.2 Revision Flow

1. Teacher opens student profile → rubʿ progress map
2. Taps a certified rubʿ (any color: green/yellow/orange/red)
3. Options appear: **"Good"** or **"Poor"**
4. Good → freshness resets to 100%, review_count increments
5. Poor → freshness resets to 50%, review_count stays

### 7.3 Re-Certification Flow (90+ days dormant)

1. Teacher sees a gray/dormant rubʿ that was previously certified
2. Taps it → dialog: "This rubʿ has been dormant for X days. Re-certify?"
3. Confirms → rubʿ freshness resets to 100%, review_count resets to 0 (starts fresh)

### 7.4 Rubʿ Progress Map — Juz-Based Navigation

**Layout:** 30 juz rows, each expandable to 8 rubʿ
- Each juz row shows: juz number/name, completion count ("5/8 rubʿ"), mini progress bar
- Tap juz → expands to show 8 rubʿ with freshness colors
- Each rubʿ block shows: rubʿ number, surah range, freshness color/state
- Teacher view has tap-to-certify / tap-to-revise actions
- Student view is read-only (same visual, no action buttons)

**Freshness colors:**
| State | Color | Meaning |
|-------|-------|---------|
| Fresh (75-100%) | Green | Recently certified or revised |
| Stale (50-74%) | Yellow | Getting stale, should revise soon |
| Fading (25-49%) | Orange | Needs attention |
| Critical (1-24%) | Red | About to go dormant |
| Dormant (0%) | Gray | No longer counts toward level |
| Uncertified | Gray (dashed border) | Never certified |

### 7.5 Note on Feature 005 (Memorization Tracking System)

The spec at `memory-bank/features/005-quran-memorization.md` defines a fine-grained SM-2 recitation tracking system. The rubʿ certification system is **independent** of that system — it's a simpler, teacher-driven manual workflow. If both systems are eventually implemented, they would complement each other (SM-2 for detailed session tracking, rubʿ for high-level progress gamification), but the rubʿ system works standalone without Feature 005.

---

## 8. Why This Is Better Than the Old System

| Aspect | Old System | New System |
|--------|-----------|------------|
| **What levels mean** | Arbitrary points from stickers | Real Quran memorization (rubʿ mastered) |
| **Can be gamed?** | Yes — generous teacher → high level | No — requires real memorization + maintenance |
| **"Quran Guardian" title** | Meaningless — just 3,500 sticker points | Meaningful — all 240 rubʿ actively memorized |
| **Ongoing engagement** | None — once leveled up, no reason to return | Continuous — must revise to maintain level |
| **Complexity** | 5 concepts (points, levels, stickers, trophies, achievements) | 2 concepts (levels, stickers) |
| **Onboarding** | Confusing — how do points work? What are trophies vs achievements? | Simple — memorize rubʿ = level up, collect stickers for fun |
| **Honesty** | Level 10 doesn't mean you know the Quran | Level reflects actual current memorization state |

---

## 9. Onboarding Pitch

> "You're Level 0. Memorize your first rubʿ and get certified by your teacher to reach Level 1. Keep revising to maintain your level — it fades if you stop! Collect stickers from your teacher along the way and compete with friends on the leaderboard."

Two concepts. Simple. Meaningful. Honest.

---

## 10. Resolved Decisions

| Question | Decision |
|----------|----------|
| UI for rubʿ map | Juz-based navigation (30 juz → expand to 8 rubʿ) |
| Teacher certification UX | Tap rubʿ on visual map in student profile |
| Revision tracking | Teacher manually marks Good/Poor (not auto-detected) |
| Trophy-tier stickers | Removed (10 stickers deleted) |
| Level titles | None — just numbers |
| Migration | Clean start — no production data exists |
| Sessions location | Google Meet / in-person (not in-app) |

## 11. Remaining Open Questions

1. **Rubʿ-to-verse mapping data** — Need the exact verse boundaries for all 240 rubʿ (well-known Islamic reference, needs to be sourced and verified)
2. **Notifications** — When to notify about fading rubʿ? Daily summary? Per-rubʿ alerts?
3. **Bulk operations** — Can a teacher certify multiple rubʿ at once?
4. **Historical level tracking** — Should we store a level history (date → level) for trend charts?
5. **Parent/admin view** — How do parents and admins see rubʿ progress and freshness?

---

*Design finalized on 2026-02-20. Schema details and exact verse boundaries to be refined during implementation.*
