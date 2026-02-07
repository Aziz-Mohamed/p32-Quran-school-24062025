-- ============================================================================
-- Quran School App — Initial Schema Migration
-- Multi-tenant architecture with Row Level Security
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Returns the school_id for the currently authenticated user.
-- Used in RLS policies to scope all queries to the user's school.
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Generic trigger function to auto-update the updated_at column.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger function fired after a new profile is created.
-- Can be extended for post-signup setup (e.g. default stickers, welcome message).
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Placeholder for post-signup setup logic:
  --   e.g. create default student record, send welcome notification, etc.
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- schools — Multi-tenant root table
-- ----------------------------------------------------------------------------
CREATE TABLE public.schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  owner_id    UUID REFERENCES auth.users(id),
  address     TEXT,
  phone       TEXT,
  logo_url    TEXT,
  settings    JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.schools IS 'Root tenant table. Every school is an isolated tenant.';

-- ----------------------------------------------------------------------------
-- profiles — Extends auth.users with school membership and role
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id           UUID NOT NULL REFERENCES public.schools(id),
  role                TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  full_name           TEXT NOT NULL,
  avatar_url          TEXT,
  phone               TEXT,
  preferred_language  TEXT DEFAULT 'en',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile extending auth.users. One profile per user per school.';

-- ----------------------------------------------------------------------------
-- classes
-- ----------------------------------------------------------------------------
CREATE TABLE public.classes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES public.schools(id),
  name          TEXT NOT NULL,
  description   TEXT,
  teacher_id    UUID REFERENCES public.profiles(id),
  schedule      JSONB,
  max_students  INTEGER DEFAULT 20,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.classes IS 'A class/group within a school, led by a teacher.';

-- ----------------------------------------------------------------------------
-- students — Extended profile for student-specific data
-- ----------------------------------------------------------------------------
CREATE TABLE public.students (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id       UUID NOT NULL REFERENCES public.schools(id),
  class_id        UUID REFERENCES public.classes(id),
  parent_id       UUID REFERENCES public.profiles(id),
  date_of_birth   DATE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  current_level   TEXT DEFAULT 'Beginner',
  total_points    INTEGER DEFAULT 0,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.students IS 'Student-specific data linked to a profile.';

-- ----------------------------------------------------------------------------
-- lessons
-- ----------------------------------------------------------------------------
CREATE TABLE public.lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    UUID NOT NULL REFERENCES public.schools(id),
  class_id     UUID REFERENCES public.classes(id),
  title        TEXT NOT NULL,
  description  TEXT,
  surah_name   TEXT,
  ayah_from    INTEGER,
  ayah_to      INTEGER,
  lesson_type  TEXT CHECK (lesson_type IN ('memorization', 'revision', 'tajweed', 'recitation')),
  order_index  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.lessons IS 'Quran lessons covering surahs, ayahs, and different lesson types.';

-- ----------------------------------------------------------------------------
-- lesson_progress
-- ----------------------------------------------------------------------------
CREATE TABLE public.lesson_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id             UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status                TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  completed_at          TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

COMMENT ON TABLE public.lesson_progress IS 'Tracks each student''s progress through lessons.';

-- ----------------------------------------------------------------------------
-- sessions — Teacher evaluations of student recitation/memorization
-- ----------------------------------------------------------------------------
CREATE TABLE public.sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES public.schools(id),
  student_id          UUID REFERENCES public.students(id),
  teacher_id          UUID REFERENCES public.profiles(id),
  class_id            UUID REFERENCES public.classes(id),
  session_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  lesson_id           UUID REFERENCES public.lessons(id),
  recitation_quality  INTEGER CHECK (recitation_quality BETWEEN 1 AND 5),
  tajweed_score       INTEGER CHECK (tajweed_score BETWEEN 1 AND 5),
  memorization_score  INTEGER CHECK (memorization_score BETWEEN 1 AND 5),
  notes               TEXT,
  homework_assigned   TEXT,
  homework_due_date   DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.sessions IS 'Teacher evaluation sessions for student recitation and memorization.';

-- ----------------------------------------------------------------------------
-- homework
-- ----------------------------------------------------------------------------
CREATE TABLE public.homework (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES public.schools(id),
  session_id    UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES public.students(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  due_date      DATE,
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.homework IS 'Homework assignments linked to sessions and students.';

-- ----------------------------------------------------------------------------
-- attendance
-- ----------------------------------------------------------------------------
CREATE TABLE public.attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by   UUID REFERENCES public.profiles(id),
  notes       TEXT,
  UNIQUE(student_id, date)
);

COMMENT ON TABLE public.attendance IS 'Daily attendance records per student.';

-- ----------------------------------------------------------------------------
-- stickers — Reward catalog
-- ----------------------------------------------------------------------------
CREATE TABLE public.stickers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     UUID NOT NULL REFERENCES public.schools(id),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,
  category      TEXT,
  points_value  INTEGER DEFAULT 10,
  is_active     BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.stickers IS 'Sticker reward catalog per school.';

-- ----------------------------------------------------------------------------
-- student_stickers — Awarded stickers
-- ----------------------------------------------------------------------------
CREATE TABLE public.student_stickers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  sticker_id  UUID REFERENCES public.stickers(id) ON DELETE CASCADE,
  awarded_by  UUID REFERENCES public.profiles(id),
  awarded_at  TIMESTAMPTZ DEFAULT now(),
  reason      TEXT
);

COMMENT ON TABLE public.student_stickers IS 'Stickers awarded to individual students.';

-- ----------------------------------------------------------------------------
-- trophies — Trophy catalog
-- ----------------------------------------------------------------------------
CREATE TABLE public.trophies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT NOT NULL,
  criteria    JSONB,
  is_active   BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.trophies IS 'Trophy catalog per school.';

-- ----------------------------------------------------------------------------
-- student_trophies — Earned trophies
-- ----------------------------------------------------------------------------
CREATE TABLE public.student_trophies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES public.students(id) ON DELETE CASCADE,
  trophy_id   UUID REFERENCES public.trophies(id) ON DELETE CASCADE,
  earned_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, trophy_id)
);

COMMENT ON TABLE public.student_trophies IS 'Trophies earned by students.';

-- ----------------------------------------------------------------------------
-- achievements — Achievement catalog
-- ----------------------------------------------------------------------------
CREATE TABLE public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES public.schools(id),
  name            TEXT NOT NULL,
  description     TEXT,
  badge_image_url TEXT,
  criteria        JSONB,
  points_reward   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.achievements IS 'Achievement catalog per school.';

-- ----------------------------------------------------------------------------
-- student_achievements — Earned achievements
-- ----------------------------------------------------------------------------
CREATE TABLE public.student_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES public.students(id) ON DELETE CASCADE,
  achievement_id  UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

COMMENT ON TABLE public.student_achievements IS 'Achievements earned by students.';

-- ----------------------------------------------------------------------------
-- teacher_checkins — Teacher check-in/check-out log
-- ----------------------------------------------------------------------------
CREATE TABLE public.teacher_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES public.schools(id),
  teacher_id      UUID REFERENCES public.profiles(id),
  class_id        UUID REFERENCES public.classes(id),
  checked_in_at   TIMESTAMPTZ DEFAULT now(),
  checked_out_at  TIMESTAMPTZ,
  date            DATE DEFAULT CURRENT_DATE
);

COMMENT ON TABLE public.teacher_checkins IS 'Tracks teacher check-in and check-out times.';

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- school_id indexes (tenant isolation — critical for performance)
CREATE INDEX idx_profiles_school_id          ON public.profiles(school_id);
CREATE INDEX idx_classes_school_id           ON public.classes(school_id);
CREATE INDEX idx_students_school_id          ON public.students(school_id);
CREATE INDEX idx_lessons_school_id           ON public.lessons(school_id);
CREATE INDEX idx_sessions_school_id          ON public.sessions(school_id);
CREATE INDEX idx_homework_school_id          ON public.homework(school_id);
CREATE INDEX idx_attendance_school_id        ON public.attendance(school_id);
CREATE INDEX idx_stickers_school_id          ON public.stickers(school_id);
CREATE INDEX idx_trophies_school_id          ON public.trophies(school_id);
CREATE INDEX idx_achievements_school_id      ON public.achievements(school_id);
CREATE INDEX idx_teacher_checkins_school_id  ON public.teacher_checkins(school_id);

-- Foreign key indexes (frequently queried relationships)
CREATE INDEX idx_profiles_role               ON public.profiles(role);
CREATE INDEX idx_classes_teacher_id          ON public.classes(teacher_id);
CREATE INDEX idx_students_class_id           ON public.students(class_id);
CREATE INDEX idx_students_parent_id          ON public.students(parent_id);
CREATE INDEX idx_lessons_class_id            ON public.lessons(class_id);
CREATE INDEX idx_lesson_progress_student_id  ON public.lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_lesson_id   ON public.lesson_progress(lesson_id);
CREATE INDEX idx_sessions_student_id         ON public.sessions(student_id);
CREATE INDEX idx_sessions_teacher_id         ON public.sessions(teacher_id);
CREATE INDEX idx_sessions_class_id           ON public.sessions(class_id);
CREATE INDEX idx_sessions_session_date       ON public.sessions(session_date);
CREATE INDEX idx_homework_student_id         ON public.homework(student_id);
CREATE INDEX idx_homework_session_id         ON public.homework(session_id);
CREATE INDEX idx_attendance_student_id       ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_id         ON public.attendance(class_id);
CREATE INDEX idx_attendance_date             ON public.attendance(date);
CREATE INDEX idx_student_stickers_student_id ON public.student_stickers(student_id);
CREATE INDEX idx_student_stickers_sticker_id ON public.student_stickers(sticker_id);
CREATE INDEX idx_student_trophies_student_id ON public.student_trophies(student_id);
CREATE INDEX idx_student_trophies_trophy_id  ON public.student_trophies(trophy_id);
CREATE INDEX idx_student_achievements_student_id    ON public.student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement_id ON public.student_achievements(achievement_id);
CREATE INDEX idx_teacher_checkins_teacher_id ON public.teacher_checkins(teacher_id);
CREATE INDEX idx_teacher_checkins_class_id   ON public.teacher_checkins(class_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on every table
ALTER TABLE public.schools              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stickers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_trophies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_checkins     ENABLE ROW LEVEL SECURITY;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- SCHOOLS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD on their own school
CREATE POLICY schools_admin_all ON public.schools
  FOR ALL
  USING (
    id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- All authenticated users: read their own school
CREATE POLICY schools_member_read ON public.schools
  FOR SELECT
  USING (id = get_user_school_id());

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- PROFILES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD on profiles within their school
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- All users: read profiles within their school (needed for names, roles, etc.)
CREATE POLICY profiles_school_read ON public.profiles
  FOR SELECT
  USING (school_id = get_user_school_id());

-- Users can update their own profile
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- CLASSES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY classes_admin_all ON public.classes
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read/write classes they teach within their school
CREATE POLICY classes_teacher_read ON public.classes
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY classes_teacher_update ON public.classes
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
  );

-- Students & parents: read classes within their school
CREATE POLICY classes_student_read ON public.classes
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('student', 'parent')
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- STUDENTS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY students_admin_all ON public.students
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read students in their school, write students in their classes
CREATE POLICY students_teacher_read ON public.students
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY students_teacher_update ON public.students
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
  );

-- Student: read own record
CREATE POLICY students_own_read ON public.students
  FOR SELECT
  USING (
    id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read their children's records
CREATE POLICY students_parent_read ON public.students
  FOR SELECT
  USING (
    parent_id = auth.uid()
    AND school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- LESSONS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY lessons_admin_all ON public.lessons
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read all lessons in school, insert/update lessons for their classes
CREATE POLICY lessons_teacher_read ON public.lessons
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY lessons_teacher_insert ON public.lessons
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY lessons_teacher_update ON public.lessons
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
  );

-- Student: read lessons in their school
CREATE POLICY lessons_student_read ON public.lessons
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('student', 'parent')
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- LESSON_PROGRESS
-- Scoped via student -> school relationship (no direct school_id column)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD for students in their school
CREATE POLICY lesson_progress_admin_all ON public.lesson_progress
  FOR ALL
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read/write progress for students in their classes
CREATE POLICY lesson_progress_teacher_read ON public.lesson_progress
  FOR SELECT
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY lesson_progress_teacher_write ON public.lesson_progress
  FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY lesson_progress_teacher_update ON public.lesson_progress
  FOR UPDATE
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
  );

-- Student: read own progress
CREATE POLICY lesson_progress_own_read ON public.lesson_progress
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's progress
CREATE POLICY lesson_progress_parent_read ON public.lesson_progress
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() AND school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- SESSIONS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY sessions_admin_all ON public.sessions
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read sessions in school, insert/update own sessions
CREATE POLICY sessions_teacher_read ON public.sessions
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY sessions_teacher_insert ON public.sessions
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY sessions_teacher_update ON public.sessions
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
  );

-- Student: read own sessions
CREATE POLICY sessions_student_read ON public.sessions
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's sessions
CREATE POLICY sessions_parent_read ON public.sessions
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- HOMEWORK
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY homework_admin_all ON public.homework
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read/write homework in their school
CREATE POLICY homework_teacher_read ON public.homework
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY homework_teacher_insert ON public.homework
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND session_id IN (SELECT id FROM public.sessions WHERE teacher_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY homework_teacher_update ON public.homework
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND session_id IN (SELECT id FROM public.sessions WHERE teacher_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
  );

-- Student: read own homework, update completion status
CREATE POLICY homework_student_read ON public.homework
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

CREATE POLICY homework_student_update ON public.homework
  FOR UPDATE
  USING (
    student_id = auth.uid()
    AND school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  )
  WITH CHECK (
    student_id = auth.uid()
    AND school_id = get_user_school_id()
  );

-- Parent: read children's homework
CREATE POLICY homework_parent_read ON public.homework
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- ATTENDANCE
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY attendance_admin_all ON public.attendance
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read all attendance in school, insert/update for their classes
CREATE POLICY attendance_teacher_read ON public.attendance
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY attendance_teacher_insert ON public.attendance
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND marked_by = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY attendance_teacher_update ON public.attendance
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND marked_by = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND marked_by = auth.uid()
  );

-- Student: read own attendance
CREATE POLICY attendance_student_read ON public.attendance
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's attendance
CREATE POLICY attendance_parent_read ON public.attendance
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- STICKERS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY stickers_admin_all ON public.stickers
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- All school members: read stickers
CREATE POLICY stickers_school_read ON public.stickers
  FOR SELECT
  USING (school_id = get_user_school_id());

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- STUDENT_STICKERS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD for students in their school
CREATE POLICY student_stickers_admin_all ON public.student_stickers
  FOR ALL
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read stickers in school, award stickers to students in their classes
CREATE POLICY student_stickers_teacher_read ON public.student_stickers
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY student_stickers_teacher_insert ON public.student_stickers
  FOR INSERT
  WITH CHECK (
    awarded_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Student: read own stickers
CREATE POLICY student_stickers_own_read ON public.student_stickers
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's stickers
CREATE POLICY student_stickers_parent_read ON public.student_stickers
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() AND school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- TROPHIES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY trophies_admin_all ON public.trophies
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- All school members: read trophies
CREATE POLICY trophies_school_read ON public.trophies
  FOR SELECT
  USING (school_id = get_user_school_id());

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- STUDENT_TROPHIES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD for students in their school
CREATE POLICY student_trophies_admin_all ON public.student_trophies
  FOR ALL
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read trophies in school, award trophies to students in their classes
CREATE POLICY student_trophies_teacher_read ON public.student_trophies
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY student_trophies_teacher_insert ON public.student_trophies
  FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Student: read own trophies
CREATE POLICY student_trophies_own_read ON public.student_trophies
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's trophies
CREATE POLICY student_trophies_parent_read ON public.student_trophies
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() AND school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- ACHIEVEMENTS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY achievements_admin_all ON public.achievements
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- All school members: read achievements
CREATE POLICY achievements_school_read ON public.achievements
  FOR SELECT
  USING (school_id = get_user_school_id());

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- STUDENT_ACHIEVEMENTS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD for students in their school
CREATE POLICY student_achievements_admin_all ON public.student_achievements
  FOR ALL
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read achievements in school, award to students in their classes
CREATE POLICY student_achievements_teacher_read ON public.student_achievements
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY student_achievements_teacher_insert ON public.student_achievements
  FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid() AND s.school_id = get_user_school_id()
    )
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Student: read own achievements
CREATE POLICY student_achievements_own_read ON public.student_achievements
  FOR SELECT
  USING (
    student_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
  );

-- Parent: read children's achievements
CREATE POLICY student_achievements_parent_read ON public.student_achievements
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() AND school_id = get_user_school_id())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'parent'
  );

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- TEACHER_CHECKINS
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Admin: full CRUD within their school
CREATE POLICY teacher_checkins_admin_all ON public.teacher_checkins
  FOR ALL
  USING (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Teacher: read own check-ins, insert/update own check-ins
CREATE POLICY teacher_checkins_teacher_read ON public.teacher_checkins
  FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY teacher_checkins_teacher_insert ON public.teacher_checkins
  FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  );

CREATE POLICY teacher_checkins_teacher_update ON public.teacher_checkins
  FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'teacher'
  )
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
  );

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at on schools
CREATE TRIGGER set_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update updated_at on profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Post-signup setup hook (fires after new profile is created)
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
