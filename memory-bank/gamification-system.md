# Gamification & Rewards System

A comprehensive guide to the Quran School app's gamification mechanics — points, levels, stickers, trophies, achievements, streaks, scoring, and attendance.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Points System](#2-points-system)
3. [Level Progression](#3-level-progression)
4. [Stickers — Heritage Collection](#4-stickers--heritage-collection)
5. [Trophies](#5-trophies)
6. [Achievements](#6-achievements)
7. [Streaks](#7-streaks)
8. [Session Scoring](#8-session-scoring)
9. [Recitation Scoring & Quality Grade](#9-recitation-scoring--quality-grade)
10. [Attendance System](#10-attendance-system)
11. [Recitation Types](#11-recitation-types)
12. [Leaderboard](#12-leaderboard)
13. [Roles & Permissions](#13-roles--permissions)
14. [Data Flow — Sticker Award Sequence](#14-data-flow--sticker-award-sequence)
15. [Realtime & Notifications](#15-realtime--notifications)
16. [Implementation Status](#16-implementation-status)
17. [Source File Reference](#17-source-file-reference)

---

## 1. Overview

The Quran School app uses an **Islamic heritage-themed gamification system** to motivate students in their Quran memorization journey. Students earn points through various activities, level up through 10 progressive ranks, collect beautifully illustrated heritage stickers, and compete on class leaderboards.

**Architecture highlights:**
- **Multi-tenant** — all school-scoped tables use `school_id`
- **Global catalogs** — stickers, trophies, achievements, and levels are shared across all schools
- **Teacher-driven** — teachers manually award stickers and mark attendance; points flow automatically from there
- **4 user roles** — student, teacher, parent, admin (enforced via RLS)

---

## 2. Points System

Points are the core currency that drives level progression. Students earn points through different activities:

| Activity | Points | Status |
|----------|--------|--------|
| Sticker awarded | Varies by tier (10–100) | Automated via DB trigger |
| Session completed | +10 | Constant defined |
| Good score bonus (4–5 out of 5) | +5 | Constant defined |
| Homework completed on time | +10 | Constant defined |
| Homework completed late | +5 | Constant defined |
| Daily streak maintained | +3 per day | Constant defined |
| Perfect weekly attendance | +20 | Constant defined |

> **Note:** Currently, only **sticker points** are fully automated via the `handle_sticker_points()` database trigger. The other point events are defined as constants in the codebase (`src/lib/constants.ts`) and are available for future automation.

**Constants source:**
```typescript
// src/lib/constants.ts
export const POINTS = {
  session_completed: 10,
  good_score_bonus: 5,
  homework_on_time: 10,
  homework_late: 5,
  streak_bonus: 3,
  perfect_weekly_attendance: 20,
  sticker_default: 10,
} as const;
```

---

## 3. Level Progression

Students progress through **10 levels** as they accumulate points. Each level has a title inspired by the Quran learning journey:

| Level | Title | Points Required | Points to Next Level |
|-------|-------|-----------------|---------------------|
| 1 | Beginner | 0 | 50 |
| 2 | Seeker | 50 | 100 |
| 3 | Reciter | 150 | 150 |
| 4 | Memorizer | 300 | 200 |
| 5 | Scholar | 500 | 300 |
| 6 | Hafiz Star | 800 | 400 |
| 7 | Master | 1,200 | 600 |
| 8 | Champion | 1,800 | 700 |
| 9 | Legend | 2,500 | 1,000 |
| 10 | Quran Guardian | 3,500 | — (max level) |

**How leveling works:**
1. **Server-side (automatic):** When a sticker is awarded, the `handle_sticker_points()` trigger adds points to `students.total_points` and recalculates `students.current_level` by finding the highest level whose `points_required` the student has reached.
2. **Client-side (display):** The `calculateLevel()` helper function computes the current level, title, next level threshold, and a progress fraction (0–1) for UI progress bars.

**Dual definition:** Levels are defined in both the database seed (`supabase/migrations/00001_initial_schema.sql`) and client constants (`src/lib/constants.ts`). These **must stay in sync**.

---

## 4. Stickers — Heritage Collection

The app features **49 heritage stickers** illustrated with Islamic art, cultural artifacts, and Quranic motifs. Teachers and admins award stickers to students as rewards.

### Tier Summary

| Tier | Count | Points Each | Total Possible Points |
|------|-------|-------------|----------------------|
| Common | 8 | 10 | 80 |
| Common+ | 4 | 15 | 60 |
| Rare | 9 | 25 | 225 |
| Epic | 10 | 50 | 500 |
| Legendary | 2 | 100 | 200 |
| Seasonal | 6 | 30 | 180 |
| Trophy | 10 | 75 | 750 |
| **Total** | **49** | | **1,995** |

> The 4 "Common+" stickers are stored as `common` tier in the database but have 15 points instead of 10.

### Full Sticker Catalog

#### Common (8 stickers — 10 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `holy-quran` | Holy Quran | المصحف الشريف |
| `prayer-beads` | Prayer Beads | المسبحة |
| `prayer-beads-v3` | Prayer Beads (Alt) | المسبحة |
| `quill-and-inkwell` | Quill & Inkwell | القلم والمحبرة |
| `memorization-tablet` | Memorization Tablet | لوح المحفوظ |
| `traditional-lantern` | Traditional Lantern | الفانوس |
| `dates-and-milk` | Dates & Milk | التمر واللبن |
| `prayer-rug` | Prayer Rug | سجادة الصلاة |

#### Common+ (4 stickers — 15 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `salah-eldins-eagle-v3` | Salah El-Din's Eagle | نسر صلاح الدين |
| `ornate-key` | Ornate Key | المفتاح |
| `mosque` | Mosque | المسجد |
| `decorative-column` | Decorative Column | العمود |

#### Rare (9 stickers — 25 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `astrolabe-v2` | Astrolabe | الأسطرلاب |
| `arabesque-arch` | Arabesque Arch | بوابة الأرابيسك |
| `minaret-v2` | Minaret | المئذنة |
| `kufic-calligraphy` | Kufic Calligraphy | الخط الكوفي |
| `house-of-wisdom-scroll-v2` | House of Wisdom Scroll | بيت الحكمة |
| `islamic-dome` | Islamic Dome | القبة |
| `mishkat-lamp` | Mishkat Lamp | المشكاة |
| `noahs-ark` | Noah's Ark | السفينة |
| `compass` | Compass | البوصلة |

#### Epic (10 stickers — 50 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `dhul-fiqar-sword` | Dhul Fiqar Sword | ذو الفقار |
| `dome-of-the-rock` | Dome of the Rock | قبة الصخرة |
| `muqarnas` | Muqarnas | المقرنصات |
| `the-kaaba` | The Kaaba | الكعبة المشرفة |
| `zamzam-well` | Zamzam Well | عين زمزم |
| `gate-of-peace` | Gate of Peace | باب السلام |
| `salihs-camel` | Salih's Camel | الناقة |
| `staff-of-musa` | Staff of Musa | عصا موسى |
| `prophets-minbar-v2` | Prophet's Minbar | المنبر النبوي |
| `islamic-dinar` | Islamic Dinar | الدرهم الإسلامي |

#### Legendary (2 stickers — 100 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `the-rawdah` | The Rawdah | الروضة الشريفة |
| `seal-of-prophethood` | Seal of Prophethood | خاتم النبوة |

#### Seasonal (6 stickers — 30 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `ramadan-cannon` | Ramadan Cannon | مدفع رمضان |
| `eid-cookies` | Eid Cookies | كعك العيد |
| `eid-lamb` | Eid Lamb | خروف العيد |
| `tent-of-arafah` | Tent of Arafah | خيمة عرفة |
| `kiswah-cloth` | Kiswah Cloth | كسوة الكعبة |
| `ramadan-crescent` | Ramadan Crescent | هلال رمضان |

#### Trophy (10 stickers — 75 pts each)

| ID | English Name | Arabic Name |
|----|-------------|-------------|
| `memorization-excellence` | Memorization Excellence | التميز في الحفظ |
| `perfect-tajweed` | Perfect Tajweed | إتقان التجويد |
| `consistent-recitation` | Consistent Recitation | المداومة على التلاوة |
| `best-effort` | Best Effort | أفضل جهد |
| `helping-others` | Helping Others | مساعدة الآخرين |
| `streak-master` | Streak Master | سيد المواظبة |
| `streak-7-days` | 7-Day Streak | مواظبة ٧ أيام |
| `streak-30-days` | 30-Day Streak | مواظبة ٣٠ يوم |
| `complete-full-juz` | Complete Full Juz | إتمام جزء كامل |
| `top-of-leaderboard-for-week` | Top of Leaderboard | متصدر لوحة الشرف |

### Awarding Rules

- **Teachers** can award stickers to students in their class
- **Admins** can award stickers to any student in their school
- **Repeatable** — the same sticker can be awarded multiple times (no unique constraint)
- Each awarded sticker has an `is_new` flag (default `true`) used for unread indicators and reveal animations
- An optional `reason` text field lets teachers add context for why the sticker was awarded
- **Admins** can delete awarded stickers; no other role can

---

## 5. Trophies

Trophies are milestone-based rewards that a student can earn **once each**.

**Database schema:**
- `trophies` — global catalog with `name`, `description`, `image_url`, `criteria` (JSONB), `is_active`
- `student_trophies` — junction table with `UNIQUE(student_id, trophy_id)`

**Current status:** The schema and service methods exist, but **no trophy seed data has been created yet**. The `criteria` JSONB field is intended to store unlock conditions (e.g., `{ "stickers_collected": 50 }`), but the structure is not yet defined.

**Notification:** A webhook trigger fires on `student_trophies` INSERT, sending a push notification.

---

## 6. Achievements

Achievements are one-time unlockable awards, similar to trophies but with an additional **points reward**.

**Database schema:**
- `achievements` — global catalog with `name`, `description`, `badge_image_url`, `criteria` (JSONB), `points_reward` (INTEGER, default 0), `is_active`
- `student_achievements` — junction table with `UNIQUE(student_id, achievement_id)`

**Current status:** The schema and service methods exist, but **no achievement seed data has been created yet**. The `points_reward` field allows achievements to grant bonus points when unlocked.

**Notification:** A webhook trigger fires on `student_achievements` INSERT, sending a push notification.

---

## 7. Streaks

Streaks track consecutive days of activity/attendance for each student.

**Database fields** (on `students` table):
- `current_streak` — INTEGER, default 0, CHECK >= 0
- `longest_streak` — INTEGER, default 0, CHECK >= 0

**Points:** `streak_bonus` = 3 points per day of maintained streak.

**Current status:** The fields exist and are displayed in dashboards and leaderboards, but **no automated streak calculation logic has been implemented yet**. Streak incrementing and resetting (based on attendance or session participation) needs to be built.

---

## 8. Session Scoring

Each teaching session records **three evaluation scores**, each on a 1–5 scale:

| Score | What It Measures |
|-------|-----------------|
| `memorization_score` | How well the student memorized new content |
| `tajweed_score` | Quality of Tajweed (Quran pronunciation rules) |
| `recitation_quality` | Overall recitation fluency and delivery |

**Score meanings:**

| Score | Meaning |
|-------|---------|
| 1 | Poor — many errors, very hesitant |
| 2 | Below average — several errors, frequent pauses |
| 3 | Acceptable — some errors, occasional pauses |
| 4 | Good — minor errors, mostly smooth |
| 5 | Excellent — perfect, flowing |

**Points bonus:** A score of 4 or 5 triggers the `good_score_bonus` (+5 points). This is defined as a constant but not yet automated.

---

## 9. Recitation Scoring & Quality Grade

Individual recitation attempts (within a session) have their own **three-dimensional scoring**:

| Score | Weight | What It Measures |
|-------|--------|-----------------|
| `accuracy_score` (1–5) | 50% | Correctness of words and ayahs |
| `fluency_score` (1–5) | 30% | Smooth, natural delivery |
| `tajweed_score` (1–5) | 20% | Proper Tajweed rule application |

**Quality grade formula:**

```
quality_grade = (accuracy × 0.50) + (fluency × 0.30) + (tajweed × 0.20)
```

**Grade thresholds:**
- **< 3.0** — Failed review. SM-2 algorithm resets the review interval to 1 day.
- **3.0–3.99** — Status set to `learning`. Student needs more practice.
- **>= 4.0** — Status set to `memorized`. Content is well retained.

Null scores default to 3 in the calculation.

> For the full spaced repetition algorithm, see `memory-bank/features/005-quran-memorization.md`.

---

## 10. Attendance System

Teachers mark student attendance during class sessions. Each student gets **one attendance record per day**.

### Statuses

| Status | Color | Hex | Meaning |
|--------|-------|-----|---------|
| `present` | Green | `#10B981` | Student attended the session |
| `absent` | Red | `#EF4444` | Student did not attend |
| `late` | Orange | `#F59E0B` | Student arrived late |
| `excused` | Blue | `#3B82F6` | Absent with a valid excuse |

If no record exists for a student on a given day, the status is **null** (displayed as "Not Marked" in the parent dashboard).

### Attendance Rate Formula

```
rate = (present + late) / (present + absent + late) × 100
```

**Excused absences are excluded from the denominator** — they don't count against the student's attendance rate.

### How Attendance Is Marked

1. Teacher opens a **class session** from their schedule
2. All enrolled students appear with a default "present" status
3. Teacher taps each student's badge to cycle: **present → absent → late → excused**
4. "Mark All Present" button available for bulk marking
5. Attendance is saved via upsert when the teacher completes the session
6. Database enforces `UNIQUE(student_id, date)` — one record per student per day

**Points:** `perfect_weekly_attendance` = 20 bonus points (constant defined, automation not yet implemented).

---

## 11. Recitation Types

The app follows the traditional three-part Quran memorization methodology:

| Code | Arabic | English | Description |
|------|--------|---------|-------------|
| `new_hifz` | الحفظ الجديد | New Memorization | New verses the student is memorizing today |
| `recent_review` | المراجعة القريبة | Recent Review | Review of recently memorized content (last ~7 days) |
| `old_review` | المراجعة البعيدة | Distant Review | Older memorized content, cycled through periodically |

> For the full memorization tracking system and SM-2 spaced repetition algorithm, see `memory-bank/features/005-quran-memorization.md`.

---

## 12. Leaderboard

The leaderboard ranks students within a class by total points.

- **Scope:** Class-level (each class has its own leaderboard)
- **Ranking:** `total_points` descending
- **Limit:** Top 10 students
- **Filter:** Only active students (`is_active = true`)
- **Periods:** "All-time" is implemented. "Weekly" period is planned but not yet built.
- **Display:** Top 3 get trophy icons. Current student's rank is always shown.
- **Realtime:** Leaderboard refreshes when stickers are awarded or student records update.

---

## 13. Roles & Permissions

Gamification-specific access control (enforced via Row Level Security):

| Action | Student | Teacher | Parent | Admin |
|--------|---------|---------|--------|-------|
| View sticker catalog | Yes | Yes | Yes | Yes |
| View own/children's stickers | Yes (own) | Yes (class) | Yes (children) | Yes (school) |
| Award stickers | No | Yes (class) | No | Yes (school) |
| Delete awarded stickers | No | No | No | Yes (school) |
| View leaderboard | Yes | Yes | Yes | Yes |
| View trophies catalog | Yes | Yes | Yes | Yes |
| View earned trophies | Yes (own) | Yes (class) | Yes (children) | Yes (school) |
| View achievements catalog | Yes | Yes | Yes | Yes |
| View earned achievements | Yes (own) | Yes (class) | Yes (children) | Yes (school) |

---

## 14. Data Flow — Sticker Award Sequence

When a teacher awards a sticker, the following automated chain executes:

```
Teacher awards sticker (UI)
  │
  ▼
INSERT INTO student_stickers (student_id, sticker_id, awarded_by, reason)
  │
  ├──▶ TRIGGER: handle_sticker_points()
  │      │
  │      ├── Lookup sticker.points_value
  │      ├── UPDATE students.total_points += points_value
  │      └── UPDATE students.current_level = highest matching level
  │
  ├──▶ TRIGGER: notify_on_insert() (from migration 00005)
  │      │
  │      └── HTTP POST to send-notification Edge Function
  │           └── Push notification to student/parent devices
  │
  └──▶ Supabase Realtime event
         │
         └── Client receives event → invalidates query caches
              └── UI updates: sticker collection, points, level, leaderboard
```

---

## 15. Realtime & Notifications

### Realtime Subscriptions

The `student_stickers` table is added to the `supabase_realtime` publication. Client-side subscription profiles listen for INSERT events and invalidate relevant query keys (stickers, gamification summary, leaderboard).

### Push Notifications

Webhook triggers fire on INSERT to these tables:
- `student_stickers` → `sticker_awarded` notification
- `student_trophies` → `trophy_earned` notification
- `student_achievements` → `achievement_unlocked` notification

Users can toggle these in their notification preferences:
- `sticker_awarded` (default: on)
- `trophy_earned` (default: on)
- `achievement_unlocked` (default: on)

---

## 16. Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Sticker catalog (49 heritage stickers) | Implemented | Global, seeded in migration 00007 |
| Sticker awarding + auto-points | Implemented | DB trigger handles points + level |
| Level progression (10 levels) | Implemented | Server + client calculation |
| Leaderboard (all-time) | Implemented | Class-scoped, top 10 |
| Leaderboard (weekly) | Planned | Falls back to all-time currently |
| Trophies | Schema only | No seed data, no auto-awarding |
| Achievements | Schema only | No seed data, no auto-awarding |
| Streak calculation | Schema only | Fields exist, no increment/reset logic |
| Session completion points | Constant only | `POINTS.session_completed = 10` |
| Good score bonus | Constant only | `POINTS.good_score_bonus = 5` |
| Homework points | Constant only | `POINTS.homework_on_time = 10`, `homework_late = 5` |
| Streak bonus points | Constant only | `POINTS.streak_bonus = 3` |
| Perfect attendance bonus | Constant only | `POINTS.perfect_weekly_attendance = 20` |
| Sticker reveal animation | Implemented | `is_new` flag on `student_stickers` |
| Push notifications | Implemented | Webhooks on sticker/trophy/achievement |
| Realtime updates | Implemented | `student_stickers` in realtime publication |

---

## 17. Source File Reference

| File | Contents |
|------|----------|
| `src/lib/constants.ts` | `POINTS`, `LEVELS`, `SCORE_RANGE` constants |
| `src/lib/helpers.ts` | `calculateLevel()`, `getAttendanceColor()` |
| `src/types/common.types.ts` | `AttendanceStatus`, `StickerTier`, `RecitationType`, `UserRole` |
| `supabase/migrations/00001_initial_schema.sql` | Base schema: students, levels, trophies, achievements, attendance; levels seed data |
| `supabase/migrations/00007_heritage_stickers.sql` | Sticker schema, 49 heritage stickers, `handle_sticker_points()` trigger, RLS |
| `supabase/migrations/00002_report_rpc_functions.sql` | Analytics RPCs: attendance trend, score trend, students needing attention |
| `supabase/migrations/00005_notification_webhooks.sql` | Webhook triggers for sticker/trophy/achievement notifications |
| `src/features/gamification/services/gamification.service.ts` | Service methods: stickers, leaderboard, trophies, achievements, levels |
| `src/features/gamification/types/gamification.types.ts` | TypeScript interfaces: `LeaderboardEntry`, `GamificationSummary`, `StickerCollectionItem` |
| `src/features/gamification/hooks/useStickers.ts` | React Query hooks for sticker operations |
| `src/features/gamification/hooks/useTrophies.ts` | React Query hooks for trophies, achievements, levels |
| `src/features/gamification/hooks/useLeaderboard.ts` | Leaderboard query hook |
| `src/features/memorization/utils/spaced-repetition.ts` | `calculateQualityGrade()`, SM-2 algorithm |
| `src/features/attendance/services/attendance.service.ts` | `markBulkAttendance()`, attendance queries |
| `memory-bank/features/005-quran-memorization.md` | Full memorization tracking & revision system spec |
