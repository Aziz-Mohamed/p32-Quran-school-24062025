# Data Model: Quran School MVP (Phase 1)

**Feature**: `001-mvp-phase1` | **Date**: 2026-02-08 | **Source Migration**: `00001_initial_schema.sql`

## Overview

18 tables across 3 categories:
- **School-scoped** (have `school_id`): schools, profiles, classes, students, lessons, lesson_progress, sessions, homework, attendance, stickers, student_stickers, teacher_checkins
- **Global** (no `school_id`): trophies, student_trophies, achievements, student_achievements, levels
- **Junction** (inherit scope via FK): student_stickers, student_trophies, student_achievements

All school-scoped tables enforce tenant isolation via RLS using `get_user_school_id()`.

---

## Entity Relationship Diagram (Text)

```
auth.users (Supabase managed)
  │
  └─── 1:1 ──→ profiles (auto-created via trigger)
                  │
                  ├─── 1:1 ──→ students (if role = 'student')
                  │               ├─── M:1 ──→ classes
                  │               ├─── M:1 ──→ profiles (parent_id)
                  │               ├─── M:1 ──→ levels (current_level)
                  │               ├─── 1:M ──→ sessions (as student)
                  │               ├─── 1:M ──→ homework
                  │               ├─── 1:M ──→ attendance
                  │               ├─── 1:M ──→ lesson_progress
                  │               ├─── 1:M ──→ student_stickers
                  │               ├─── 1:M ──→ student_trophies
                  │               └─── 1:M ──→ student_achievements
                  │
                  ├─── 1:M ──→ sessions (as teacher, teacher_id)
                  ├─── 1:M ──→ teacher_checkins (as teacher)
                  ├─── 1:M ──→ student_stickers (as awarder, awarded_by)
                  └─── M:1 ──→ schools (school_id)

schools
  ├─── 1:M ──→ profiles
  ├─── 1:M ──→ classes
  ├─── 1:M ──→ students
  ├─── 1:M ──→ lessons
  ├─── 1:M ──→ sessions
  ├─── 1:M ──→ homework
  ├─── 1:M ──→ attendance
  ├─── 1:M ──→ stickers
  └─── 1:M ──→ teacher_checkins

classes
  ├─── M:1 ──→ profiles (teacher_id)
  ├─── 1:M ──→ students (class_id)
  ├─── 1:M ──→ lessons (class_id)
  └─── 1:M ──→ attendance (class_id)

lessons
  └─── 1:M ──→ lesson_progress

stickers
  └─── 1:M ──→ student_stickers

trophies (global)
  └─── 1:M ──→ student_trophies

achievements (global)
  └─── 1:M ──→ student_achievements

levels (global)
  └─── 1:M ──→ students (current_level)
```

---

## Table Definitions

### 1. `schools` — Multi-tenant root

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | School identifier |
| name | TEXT | NOT NULL | School display name |
| slug | TEXT | UNIQUE, NOT NULL | URL-safe identifier, used in synthetic emails |
| owner_id | UUID | FK -> auth.users ON DELETE SET NULL | School creator (admin) |
| address | TEXT | nullable | Physical address |
| phone | TEXT | nullable | Contact phone |
| logo_url | TEXT | nullable | School logo URL (Supabase Storage) |
| settings | JSONB | NOT NULL DEFAULT '{}' | Extensible settings bag |
| is_active | BOOLEAN | NOT NULL DEFAULT true | Status flag (app-layer filtering) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

**RLS**: Members read own school; admin updates own school.

---

### 2. `profiles` — Extends auth.users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK -> auth.users ON DELETE CASCADE | Matches auth.users.id |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| role | TEXT | NOT NULL, CHECK IN ('student','teacher','parent','admin') | User role |
| full_name | TEXT | NOT NULL | Display name |
| **username** | **TEXT** | **nullable** (NEW - see migration 00002) | **Login identifier, unique per school** |
| avatar_url | TEXT | nullable | Profile image URL |
| phone | TEXT | nullable | Contact phone |
| preferred_language | TEXT | NOT NULL DEFAULT 'en' | 'en' or 'ar' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

**New index**: `UNIQUE(school_id, username)` — enforces per-school username uniqueness.

**RLS**: Members read school profiles; users update own profile; admin inserts/deletes; service role inserts during signup trigger.

---

### 3. `classes`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| name | TEXT | NOT NULL | Class display name |
| description | TEXT | nullable | |
| teacher_id | UUID | FK -> profiles ON DELETE SET NULL | Assigned teacher |
| schedule | JSONB | nullable | Flexible schedule structure |
| max_students | INTEGER | NOT NULL DEFAULT 20, CHECK > 0 | Enrollment cap |
| is_active | BOOLEAN | NOT NULL DEFAULT true | Status flag |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**RLS**: All members read school classes; admin CRUD; teacher updates own classes.

---

### 4. `levels` — Global progression tiers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| level_number | INTEGER | UNIQUE, NOT NULL, CHECK > 0 | Ordinal (1-10) |
| title | TEXT | NOT NULL | Display name |
| points_required | INTEGER | NOT NULL, CHECK >= 0 | Points threshold |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Seed data** (10 levels):

| Level | Title | Points |
|-------|-------|--------|
| 1 | Beginner | 0 |
| 2 | Seeker | 50 |
| 3 | Reciter | 150 |
| 4 | Memorizer | 300 |
| 5 | Scholar | 500 |
| 6 | Hafiz Star | 800 |
| 7 | Master | 1200 |
| 8 | Champion | 1800 |
| 9 | Legend | 2500 |
| 10 | Quran Guardian | 3500 |

**RLS**: Anyone can read; admin manages.

---

### 5. `students` — Extended student profile

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK -> profiles ON DELETE CASCADE | Matches profiles.id |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| class_id | UUID | FK -> classes ON DELETE SET NULL | Current class |
| parent_id | UUID | FK -> profiles ON DELETE SET NULL | Linked parent |
| date_of_birth | DATE | nullable | |
| enrollment_date | DATE | NOT NULL DEFAULT CURRENT_DATE | |
| current_level | INTEGER | DEFAULT 1, FK -> levels(level_number) ON DELETE SET NULL | Current gamification level |
| total_points | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0 | Cumulative points |
| current_streak | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0 | Consecutive active days |
| longest_streak | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0 | Best streak ever |
| is_active | BOOLEAN | NOT NULL DEFAULT true | Status flag |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto-updated via trigger |

**RLS**: Admin reads all school students; teacher reads class students; student reads own; parent reads children. Admin CRUD.

---

### 6. `lessons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| class_id | UUID | FK -> classes ON DELETE SET NULL | Optional class scope |
| title | TEXT | NOT NULL | Lesson title |
| description | TEXT | nullable | |
| surah_name | TEXT | nullable | Quran surah reference |
| ayah_from | INTEGER | CHECK > 0 | Start ayah |
| ayah_to | INTEGER | CHECK > 0, CHECK >= ayah_from | End ayah |
| lesson_type | TEXT | CHECK IN ('memorization','revision','tajweed','recitation') | |
| order_index | INTEGER | nullable | Sort order within class |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**RLS**: Admin reads all; teacher reads school; student reads class lessons; parent reads children's class lessons. Admin + teacher CRUD (teacher scoped to own classes).

---

### 7. `lesson_progress`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| lesson_id | UUID | NOT NULL, FK -> lessons ON DELETE CASCADE | |
| status | TEXT | NOT NULL DEFAULT 'not_started', CHECK IN ('not_started','in_progress','completed') | |
| completion_percentage | INTEGER | NOT NULL DEFAULT 0, CHECK 0-100 | Progress bar value |
| completed_at | TIMESTAMPTZ | nullable | When status became completed |

**Unique constraint**: `(student_id, lesson_id)` — one progress record per student per lesson.

**RLS**: Same pattern as students (admin all, teacher class, student own, parent children). Admin + teacher insert/update/delete.

---

### 8. `sessions` — Teacher evaluations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | Evaluated student |
| teacher_id | UUID | NOT NULL, FK -> profiles ON DELETE CASCADE | Evaluating teacher |
| class_id | UUID | FK -> classes ON DELETE SET NULL | Class context |
| session_date | DATE | NOT NULL DEFAULT CURRENT_DATE | |
| lesson_id | UUID | FK -> lessons ON DELETE SET NULL | Optional lesson ref |
| recitation_quality | INTEGER | CHECK 1-5 | Score |
| tajweed_score | INTEGER | CHECK 1-5 | Score |
| memorization_score | INTEGER | CHECK 1-5 | Score |
| notes | TEXT | nullable | Teacher notes |
| homework_assigned | TEXT | nullable | Inline homework text |
| homework_due_date | DATE | nullable | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Points trigger**: AFTER INSERT -> +10 base + conditional +5 if any score >= 4.

**RLS**: Admin reads all; teacher reads school + inserts/updates own; student reads own; parent reads children's.

---

### 9. `homework`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| session_id | UUID | FK -> sessions ON DELETE SET NULL | Originating session |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| description | TEXT | NOT NULL | |
| due_date | DATE | nullable | |
| is_completed | BOOLEAN | NOT NULL DEFAULT false | |
| completed_at | TIMESTAMPTZ | nullable | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Points trigger**: AFTER UPDATE when `is_completed` changes false->true. +10 if `completed_at <= due_date`, +5 if late.

**RLS**: Admin reads all; teacher reads school + inserts/updates; student reads own + updates own (completion only); parent reads children's.

---

### 10. `attendance`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| class_id | UUID | NOT NULL, FK -> classes ON DELETE CASCADE | |
| date | DATE | NOT NULL DEFAULT CURRENT_DATE | |
| status | TEXT | NOT NULL, CHECK IN ('present','absent','late','excused') | |
| marked_by | UUID | FK -> profiles ON DELETE SET NULL | Who marked |
| notes | TEXT | nullable | |

**Unique constraint**: `(student_id, date)` — one record per student per day (upsert behavior).

**RLS**: Admin reads all + inserts/updates/deletes; teacher reads school + inserts/updates (own marked_by). Student reads own; parent reads children's.

---

### 11. `stickers` — School reward catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| name | TEXT | NOT NULL | Sticker name |
| description | TEXT | nullable | |
| image_url | TEXT | NOT NULL | Sticker image (Supabase Storage) |
| category | TEXT | nullable | Grouping category |
| points_value | INTEGER | NOT NULL DEFAULT 10, CHECK >= 0 | Points when awarded |
| is_active | BOOLEAN | NOT NULL DEFAULT true | Can still be awarded |

**RLS**: All members read; admin CRUD.

---

### 12. `student_stickers` — Awarded stickers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| sticker_id | UUID | NOT NULL, FK -> stickers ON DELETE CASCADE | |
| awarded_by | UUID | NOT NULL, FK -> profiles ON DELETE CASCADE | Teacher/admin who awarded |
| awarded_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| reason | TEXT | nullable | Optional reason |

**Points trigger**: AFTER INSERT -> add sticker's `points_value` to student's `total_points`.

**RLS**: Admin reads all school; teacher reads + inserts for class students; student reads own; parent reads children's. Admin deletes.

---

### 13. `trophies` — Global milestone rewards

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| name | TEXT | NOT NULL | Trophy name |
| description | TEXT | nullable | |
| image_url | TEXT | NOT NULL | Trophy image |
| criteria | JSONB | nullable | Auto-award criteria (e.g., `{"type": "sticker_count", "threshold": 10}`) |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |

**RLS**: Anyone reads; admin manages.

---

### 14. `student_trophies`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| trophy_id | UUID | NOT NULL, FK -> trophies ON DELETE CASCADE | |
| earned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Unique constraint**: `(student_id, trophy_id)` — earn each trophy once.

**RLS**: Admin reads school; teacher reads class; student reads own; parent reads children's. Admin inserts/deletes.

---

### 15. `achievements` — Global badges

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| name | TEXT | NOT NULL | |
| description | TEXT | nullable | |
| badge_image_url | TEXT | nullable | Badge image |
| criteria | JSONB | nullable | Auto-award criteria |
| points_reward | INTEGER | NOT NULL DEFAULT 0, CHECK >= 0 | Points given on achievement |
| is_active | BOOLEAN | NOT NULL DEFAULT true | |

**RLS**: Anyone reads; admin manages.

---

### 16. `student_achievements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| student_id | UUID | NOT NULL, FK -> students ON DELETE CASCADE | |
| achievement_id | UUID | NOT NULL, FK -> achievements ON DELETE CASCADE | |
| earned_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

**Unique constraint**: `(student_id, achievement_id)` — earn each achievement once.

**RLS**: Same as student_trophies.

---

### 17. `teacher_checkins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| school_id | UUID | NOT NULL, FK -> schools ON DELETE CASCADE | Tenant scope |
| teacher_id | UUID | NOT NULL, FK -> profiles ON DELETE CASCADE | |
| class_id | UUID | FK -> classes ON DELETE SET NULL | Optional class context |
| checked_in_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| checked_out_at | TIMESTAMPTZ | nullable | Set on checkout |
| date | DATE | NOT NULL DEFAULT CURRENT_DATE | |

**RLS**: Admin reads all school; teacher reads/inserts/updates/deletes own.

---

## Helper Functions

| Function | Returns | Purpose |
|----------|---------|---------|
| `get_user_school_id()` | UUID | Returns `school_id` from current user's profile. Used in all school-scoped RLS policies. SECURITY DEFINER, STABLE. |
| `get_user_role()` | TEXT | Returns `role` from current user's profile. Used in role-gated RLS policies. SECURITY DEFINER, STABLE. |
| `handle_updated_at()` | TRIGGER | Sets `updated_at = now()` on row update. Applied to: schools, profiles, students. |
| `handle_new_profile()` | TRIGGER | Creates a `profiles` row from `auth.users.raw_user_meta_data` on signup. Reads: school_id, role, full_name from metadata. |

All functions have `SET search_path = public` for security compliance.

---

## Schema Changes Required (Migration 00002)

### 1. Add `username` to `profiles`

```sql
ALTER TABLE profiles ADD COLUMN username TEXT;
CREATE UNIQUE INDEX idx_profiles_school_username ON profiles(school_id, username);
```

### 2. Update `handle_new_profile()` to include username

```sql
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, school_id, role, full_name, username)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'school_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
```

### 3. Points trigger functions

```sql
-- Award session points
CREATE OR REPLACE FUNCTION handle_session_points()
RETURNS TRIGGER AS $$
DECLARE
  earned INTEGER := 10; -- base session points
BEGIN
  -- Bonus for high recitation score
  IF NEW.recitation_quality >= 4 THEN
    earned := earned + 5;
  END IF;

  UPDATE students
  SET total_points = total_points + earned,
      current_level = (
        SELECT level_number FROM levels
        WHERE points_required <= (total_points + earned)
        ORDER BY level_number DESC LIMIT 1
      )
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_session_created
  AFTER INSERT ON sessions
  FOR EACH ROW EXECUTE FUNCTION handle_session_points();
```

```sql
-- Award homework completion points
CREATE OR REPLACE FUNCTION handle_homework_points()
RETURNS TRIGGER AS $$
DECLARE
  earned INTEGER;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    IF NEW.due_date IS NULL OR NEW.completed_at::date <= NEW.due_date THEN
      earned := 10; -- on time
    ELSE
      earned := 5;  -- late
    END IF;

    UPDATE students
    SET total_points = total_points + earned,
        current_level = (
          SELECT level_number FROM levels
          WHERE points_required <= (total_points + earned)
          ORDER BY level_number DESC LIMIT 1
        )
    WHERE id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_homework_completed
  AFTER UPDATE ON homework
  FOR EACH ROW EXECUTE FUNCTION handle_homework_points();
```

```sql
-- Award sticker points
CREATE OR REPLACE FUNCTION handle_sticker_points()
RETURNS TRIGGER AS $$
DECLARE
  sticker_points INTEGER;
BEGIN
  SELECT points_value INTO sticker_points FROM stickers WHERE id = NEW.sticker_id;

  UPDATE students
  SET total_points = total_points + COALESCE(sticker_points, 0),
      current_level = (
        SELECT level_number FROM levels
        WHERE points_required <= (total_points + COALESCE(sticker_points, 0))
        ORDER BY level_number DESC LIMIT 1
      )
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_sticker_awarded
  AFTER INSERT ON student_stickers
  FOR EACH ROW EXECUTE FUNCTION handle_sticker_points();
```

---

## Validation Rules (Application Layer)

| Entity | Field | Rule |
|--------|-------|------|
| School | name | Required, 2-100 chars |
| School | slug | Auto-generated, lowercase, hyphenated, unique |
| Profile | username | 3-30 chars, lowercase alphanumeric + underscore, unique per school |
| Profile | role | Must be one of 4 valid roles |
| Profile | full_name | Required, 2-100 chars |
| Student | date_of_birth | Must be in the past |
| Class | name | Required, 2-50 chars |
| Class | max_students | 1-100 |
| Lesson | title | Required, 2-200 chars |
| Lesson | ayah_from/to | Positive integers, to >= from |
| Session | scores | 1-5 each (recitation, tajweed, memorization) |
| Session | session_date | Cannot be in the future |
| Homework | description | Required |
| Homework | due_date | Must be today or later when creating |
| Attendance | status | Must be one of 4 valid statuses |
| Sticker | name | Required, 2-50 chars |
| Sticker | image_url | Required, valid URL |
| Sticker | points_value | 0-100 |
