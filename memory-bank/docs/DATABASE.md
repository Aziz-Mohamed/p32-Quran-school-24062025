# Database Reference

PostgreSQL database managed by Supabase. 20 tables, ~120 RLS policies, 16+ server-side functions.

The single source of truth for the schema is `supabase/migrations/00001_consolidated_schema.sql` (~1800 lines).

## Schema Overview

Tables are listed in FK dependency order (the order they are created in the migration).

| # | Table | Description | Key Columns |
|---|---|---|---|
| 1 | `schools` | Multi-tenant root. Each school is fully isolated. | `id`, `slug` (unique), `owner_id`, `name_localized`, `timezone`, `verification_mode` |
| 2 | `profiles` | User profiles linked 1:1 to `auth.users`. | `id` (= auth.uid), `school_id`, `role`, `username`, `name_localized` |
| 3 | `classes` | School classes with a teacher assignment. | `school_id`, `teacher_id`, `name_localized`, `max_students` |
| 4 | `students` | Student records extending a profile. | `id` (= profile.id), `class_id`, `parent_id`, `current_level`, `current_streak` |
| 5 | `sessions` | Evaluation sessions (teacher evaluates a student). | `student_id`, `teacher_id`, scores (1-5): `recitation_quality`, `tajweed_score`, `memorization_score` |
| 6 | `stickers` | Global sticker catalog (not school-scoped). | `id` (text PK), `name_ar`, `name_en`, `tier` (bronze/silver/gold/diamond/seasonal) |
| 7 | `student_stickers` | Stickers awarded to students. | `student_id`, `sticker_id`, `awarded_by`, `is_new` |
| 8 | `teacher_checkins` | Teacher work attendance with GPS/WiFi verification. | `teacher_id`, `date`, `checked_in_at`, `checked_out_at`, `is_verified` |
| 9 | `push_tokens` | Expo push notification tokens. | `user_id`, `token` (unique), `platform` (ios/android) |
| 10 | `notification_preferences` | Per-user notification toggle settings. | `user_id` (PK), boolean toggles for each notification type |
| 11 | `teacher_work_schedules` | Weekly work schedule per teacher. | `teacher_id`, `day_of_week` (0-6), `start_time`, `end_time` |
| 12 | `class_schedules` | Weekly class schedule. | `class_id`, `day_of_week` (0-6), `start_time`, `end_time` |
| 13 | `scheduled_sessions` | Calendar of planned sessions. | `teacher_id`, `student_id`, `session_date`, `status`, `session_type` (class/individual) |
| 14 | `attendance` | Daily student attendance. | `student_id`, `date` (unique per student), `status` (present/absent/late/excused), `marked_by` |
| 15 | `recitations` | Detailed recitation records within a session. | `session_id`, `surah_number`, `from_ayah`, `to_ayah`, `recitation_type`, scores (1-5) |
| 16 | `memorization_progress` | Per-student surah/ayah-level progress with spaced repetition. | `student_id`, `surah_number`, `from_ayah`, `to_ayah`, `status`, `ease_factor`, `interval_days` |
| 17 | `quran_rub_reference` | Reference data: 240 rub' (quarters) of the Quran. Static. | `rub_number` (PK), `juz_number`, `hizb_number`, `start_surah/ayah`, `end_surah/ayah` |
| 18 | `memorization_assignments` | Homework assigned to students. | `student_id`, `assigned_by`, `surah_number`, `assignment_type`, `due_date`, `status` |
| 19 | `student_rub_certifications` | Teacher-certified rub' mastery. | `student_id`, `rub_number`, `certified_by`, `review_count`, `dormant_since` |
| 20 | `session_recitation_plans` | Planned recitations for a scheduled session. | `scheduled_session_id`, `student_id`, `start_surah/ayah`, `end_surah/ayah`, `recitation_type` |

## Entity Relationships

```
schools
  |
  |--< profiles (school_id)
  |     |
  |     |--< students (id = profile.id)
  |     |     |--< sessions (student_id)
  |     |     |--< attendance (student_id)
  |     |     |--< recitations (student_id)
  |     |     |--< memorization_progress (student_id)
  |     |     |--< memorization_assignments (student_id)
  |     |     |--< student_stickers (student_id)
  |     |     |--< student_rub_certifications (student_id)
  |     |     '--< session_recitation_plans (student_id)
  |     |
  |     |--< teacher_checkins (teacher_id)
  |     '--< teacher_work_schedules (teacher_id)
  |
  |--< classes (school_id)
  |     |--< class_schedules (class_id)
  |     '--< students (class_id)           [many students per class]
  |
  '--< scheduled_sessions (school_id)
        |--< session_recitation_plans (scheduled_session_id)
        '---> sessions (evaluation_session_id)  [1:1 link to completed evaluation]

stickers (global, no school_id)
  '--< student_stickers (sticker_id)

quran_rub_reference (global, 240 rows, static reference data)
  '--< student_rub_certifications (rub_number)
```

Key FK patterns:
- **CASCADE**: ownership relationships (school deletes cascade to all data)
- **SET NULL**: optional references (teacher leaves, class keeps students)
- **RESTRICT**: `student_rub_certifications.certified_by` (cannot delete teacher who certified)

## Multi-Tenancy Model

Every data table has a `school_id` column except global reference tables (`stickers`, `quran_rub_reference`).

Two helper functions power all RLS policies:

```sql
get_user_school_id()  -- Returns school_id from profiles WHERE id = auth.uid()
get_user_role()       -- Returns role from profiles WHERE id = auth.uid()
```

Both are `STABLE SECURITY DEFINER` with `SET search_path = public`.

## RLS Policy Model

All 20 tables have RLS enabled. Policies follow these patterns:

**School-scoped read (all members of the school)**:
```sql
CREATE POLICY "Members can read own school"
  ON schools FOR SELECT
  USING (id = get_user_school_id());
```

**Role-restricted write (admin only)**:
```sql
CREATE POLICY "Admin can insert students"
  ON students FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'admin'
  );
```

**Teacher scoped to own classes**:
```sql
CREATE POLICY "Teacher can read class students"
  ON students FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );
```

**Parent scoped to own children**:
```sql
CREATE POLICY "Parent can read children"
  ON students FOR SELECT
  USING (
    parent_id = auth.uid()
    AND get_user_role() = 'parent'
  );
```

**Student self-access**:
```sql
CREATE POLICY "Student can read own record"
  ON students FOR SELECT
  USING (
    id = auth.uid()
    AND get_user_role() = 'student'
  );
```

## Key Database Functions

### Helper Functions

| Function | Purpose |
|---|---|
| `get_user_school_id()` | Returns authenticated user's school_id (used in all RLS policies) |
| `get_user_role()` | Returns authenticated user's role |
| `handle_updated_at()` | Trigger function: auto-sets `updated_at = now()` on UPDATE |
| `handle_new_profile()` | Trigger on `auth.users` INSERT: creates profile row from user metadata |
| `resolve_localized_name(localized, fallback, lang)` | Extracts localized name from JSONB by language, with fallback chain |
| `notify_on_insert()` | Trigger: calls send-notification Edge Function on certain inserts |
| `increment_review_count(cert_id)` | Increments review count on rub' certifications, clears dormancy |

### Reporting Functions (called via `supabase.rpc()`)

| Function | Purpose |
|---|---|
| `get_attendance_trend(school_id, start, end, granularity, class_id?)` | Attendance rates over time, grouped by day/week/month |
| `get_score_trend(school_id, start, end, granularity, class_id?)` | Average memorization/tajweed/recitation scores over time |
| `get_teacher_activity(school_id, start, end)` | Sessions logged, unique students, stickers awarded per teacher |
| `get_students_needing_attention(class_id, start?, end?)` | Students with declining or low scores (top 10) |
| `get_child_score_trend(student_id, class_id, start, end, granularity)` | Child's scores vs class average over time (for parent view) |
| `get_period_comparison(school_id, current_start/end, previous_start/end, class_id?)` | Compare attendance, scores, stickers across two date ranges |
| `get_teacher_attendance_kpis(school_id, start, end)` | Teacher work attendance: days present, hours, punctuality rate |
| `get_session_completion_stats(school_id, start, end)` | Scheduled vs completed/cancelled/missed sessions per teacher |
| `get_student_memorization_stats(student_id)` | Total ayahs memorized, surahs started/completed, Quran %, review items |
| `get_student_revision_schedule(student_id, date?)` | Spaced repetition schedule: assignments + items due for review |

## Constraints and Indexes

### CHECK Constraints

Every enum-like text column has a CHECK constraint:
- `profiles.role` IN (`student`, `teacher`, `parent`, `admin`)
- `attendance.status` IN (`present`, `absent`, `late`, `excused`)
- `recitations.recitation_type` IN (`new_hifz`, `recent_review`, `old_review`)
- `stickers.tier` IN (`bronze`, `silver`, `gold`, `diamond`, `seasonal`)
- All score columns: range 1-5
- All surah numbers: range 1-114
- `day_of_week`: range 0-6
- Time constraints: `end_time > start_time`

### Unique Constraints

| Table | Columns | Purpose |
|---|---|---|
| `schools` | `slug` | One slug per school |
| `profiles` | `school_id, username` | Unique usernames within a school |
| `attendance` | `student_id, date` | One attendance record per student per day (upsert key) |
| `memorization_progress` | `student_id, surah_number, from_ayah, to_ayah` | No duplicate progress records |
| `student_rub_certifications` | `student_id, rub_number` | One certification per rub' per student |
| `teacher_work_schedules` | `teacher_id, day_of_week` | One schedule entry per teacher per day |
| `class_schedules` | `class_id, day_of_week, start_time` | No overlapping class slots |

## Seed Data

Seed data is embedded in the consolidated migration (not in `seed.sql`):

- **`quran_rub_reference`**: 240 rows mapping every rub' (quarter) of the Quran to juz, hizb, surah, and ayah ranges
- **`stickers`**: Initial gamification sticker catalog with tiers

## Migration Workflow

### Current Migrations

| File | Lines | Description |
|---|---|---|
| `00001_consolidated_schema.sql` | ~1800 | Full schema: tables, functions, indexes, RLS, triggers, seed data |
| `00002_storage_buckets.sql` | ~30 | Storage buckets for stickers/rewards |
| `00003_cleanup_dead_code.sql` | ~15 | Remove unused triggers |

### Adding a New Migration

1. Create a new file with the next sequential number:
   ```
   supabase/migrations/00004_descriptive_name.sql
   ```

2. Write idempotent SQL (use `IF NOT EXISTS`, `IF EXISTS` where possible).

3. Apply locally:
   ```bash
   supabase db reset
   ```

4. Verify in Studio: http://127.0.0.1:54323

5. Rules for new migrations:
   - All school-scoped tables MUST have a `school_id` column
   - All new tables MUST have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies
   - All functions MUST have `SET search_path = public`
   - All FKs need explicit `ON DELETE` (CASCADE for ownership, SET NULL for optional)
   - Add CHECK constraints for enums and numeric ranges
   - Add appropriate indexes for filtered/joined columns

### Pushing to Remote

```bash
supabase db push
```

### Regenerating TypeScript Types

From local database:
```bash
supabase gen types typescript --local > supabase/types/database.types.ts
```

From remote project:
```bash
supabase gen types typescript --project-id <project-id> > supabase/types/database.types.ts
```

After regeneration, copy the types to the app:
```bash
cp supabase/types/database.types.ts src/types/database.types.ts
```
