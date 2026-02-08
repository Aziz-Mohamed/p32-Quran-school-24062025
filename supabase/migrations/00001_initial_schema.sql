-- ============================================================================
-- Quran School - Multi-Tenant Schema (PRD-aligned)
-- Single comprehensive migration for fresh deployment
-- ============================================================================

-- ============================================================================
-- SECTION 1: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================================================
-- SECTION 2: Tables (PRD 7.2)
-- ============================================================================

-- Schools (multi-tenant root entity) - PRD 7.2
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends Supabase auth.users) - PRD 7.2
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classes - PRD 7.2
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  schedule JSONB,
  max_students INTEGER NOT NULL DEFAULT 20 CHECK (max_students > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Levels (global, for gamification) - PRD 9.2
-- Created before students so current_level can FK to it
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER UNIQUE NOT NULL CHECK (level_number > 0),
  title TEXT NOT NULL,
  points_required INTEGER NOT NULL CHECK (points_required >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students (extended profile) - PRD 7.2
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date_of_birth DATE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_level INTEGER DEFAULT 1 REFERENCES levels(level_number) ON DELETE SET NULL,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lessons - PRD 7.2
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  surah_name TEXT,
  ayah_from INTEGER CHECK (ayah_from > 0),
  ayah_to INTEGER CHECK (ayah_to > 0),
  lesson_type TEXT CHECK (lesson_type IN ('memorization', 'revision', 'tajweed', 'recitation')),
  order_index INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_ayah_range CHECK (ayah_to IS NULL OR ayah_from IS NULL OR ayah_to >= ayah_from)
);

-- Lesson Progress - PRD 7.2
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- Sessions (teacher evaluations) - PRD 7.2
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  recitation_quality INTEGER CHECK (recitation_quality BETWEEN 1 AND 5),
  tajweed_score INTEGER CHECK (tajweed_score BETWEEN 1 AND 5),
  memorization_score INTEGER CHECK (memorization_score BETWEEN 1 AND 5),
  notes TEXT,
  homework_assigned TEXT,
  homework_due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Homework - PRD 7.2
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance - PRD 7.2
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(student_id, date)
);

-- Stickers - PRD 7.2
CREATE TABLE stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  points_value INTEGER NOT NULL DEFAULT 10 CHECK (points_value >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Awarded Stickers - PRD 7.2
CREATE TABLE student_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  awarded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

-- Trophies (global, not school-scoped) - PRD 7.2
CREATE TABLE trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  criteria JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Student Trophies - PRD 7.2
CREATE TABLE student_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  trophy_id UUID NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, trophy_id)
);

-- Achievements (global, not school-scoped) - PRD 7.2
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  badge_image_url TEXT,
  criteria JSONB,
  points_reward INTEGER NOT NULL DEFAULT 0 CHECK (points_reward >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Student Achievements - PRD 7.2
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Teacher Check-ins - PRD 7.2
CREATE TABLE teacher_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================================
-- SECTION 3: Helper Functions (created after tables they reference)
-- ============================================================================

-- Helper: get current user's school_id from their profile (PRD 7.3)
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;

-- Helper: get current user's role from their profile
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public;

-- Trigger function: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Trigger function: create profile after signup
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, school_id, role, full_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'school_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================================================
-- SECTION 4: Indexes
-- ============================================================================

-- school_id indexes on all school-scoped tables
CREATE INDEX idx_profiles_school_id ON profiles(school_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_lessons_school_id ON lessons(school_id);
CREATE INDEX idx_sessions_school_id ON sessions(school_id);
CREATE INDEX idx_homework_school_id ON homework(school_id);
CREATE INDEX idx_attendance_school_id ON attendance(school_id);
CREATE INDEX idx_stickers_school_id ON stickers(school_id);
CREATE INDEX idx_teacher_checkins_school_id ON teacher_checkins(school_id);

-- Role-based index for RLS helper queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- FK indexes on relationship columns
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_lessons_class_id ON lessons(class_id);
CREATE INDEX idx_lesson_progress_student_id ON lesson_progress(student_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX idx_sessions_class_id ON sessions(class_id);
CREATE INDEX idx_sessions_lesson_id ON sessions(lesson_id);
CREATE INDEX idx_homework_session_id ON homework(session_id);
CREATE INDEX idx_homework_student_id ON homework(student_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_marked_by ON attendance(marked_by);
CREATE INDEX idx_student_stickers_student_id ON student_stickers(student_id);
CREATE INDEX idx_student_stickers_sticker_id ON student_stickers(sticker_id);
CREATE INDEX idx_student_stickers_awarded_by ON student_stickers(awarded_by);
CREATE INDEX idx_student_trophies_student_id ON student_trophies(student_id);
CREATE INDEX idx_student_trophies_trophy_id ON student_trophies(trophy_id);
CREATE INDEX idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement_id ON student_achievements(achievement_id);
CREATE INDEX idx_teacher_checkins_teacher_id ON teacher_checkins(teacher_id);
CREATE INDEX idx_teacher_checkins_class_id ON teacher_checkins(class_id);

-- Composite indexes for common queries
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_lesson_progress_student_lesson ON lesson_progress(student_id, lesson_id);
CREATE INDEX idx_sessions_session_date ON sessions(session_date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_teacher_checkins_date ON teacher_checkins(date);

-- ============================================================================
-- SECTION 5: Row Level Security (PRD 7.3)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- schools: Admin read/update own; all members read own
-- -------------------------------------------------------------------------
CREATE POLICY "Members can read own school"
  ON schools FOR SELECT
  USING (id = get_user_school_id());

CREATE POLICY "Admin can update own school"
  ON schools FOR UPDATE
  USING (id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- profiles: Admin all (school); all read school; own update
-- -------------------------------------------------------------------------
CREATE POLICY "Members can read school profiles"
  ON profiles FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- Allow trigger-based profile creation during signup
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- -------------------------------------------------------------------------
-- classes: Admin all; teacher read school + update own; student/parent read
-- -------------------------------------------------------------------------
CREATE POLICY "Members can read school classes"
  ON classes FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Admin can insert classes"
  ON classes FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update own classes"
  ON classes FOR UPDATE
  USING (school_id = get_user_school_id() AND teacher_id = auth.uid() AND get_user_role() = 'teacher');

CREATE POLICY "Admin can delete classes"
  ON classes FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- students: Admin all; teacher class students; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school students"
  ON students FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read class students"
  ON students FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Student can read own record"
  ON students FOR SELECT
  USING (id = auth.uid() AND get_user_role() = 'student');

CREATE POLICY "Parent can read children"
  ON students FOR SELECT
  USING (parent_id = auth.uid() AND get_user_role() = 'parent');

CREATE POLICY "Admin can insert students"
  ON students FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update students"
  ON students FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete students"
  ON students FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- lessons: Admin all; teacher read school + write class; student/parent read
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school lessons"
  ON lessons FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school lessons"
  ON lessons FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can read class lessons"
  ON lessons FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND class_id IN (SELECT class_id FROM students WHERE id = auth.uid())
  );

CREATE POLICY "Parent can read children class lessons"
  ON lessons FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND class_id IN (SELECT class_id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can insert class lessons"
  ON lessons FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Admin can update lessons"
  ON lessons FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update class lessons"
  ON lessons FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Admin can delete lessons"
  ON lessons FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- lesson_progress: Admin all; teacher class; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can read class lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Student can read own lesson progress"
  ON lesson_progress FOR SELECT
  USING (student_id = auth.uid() AND get_user_role() = 'student');

CREATE POLICY "Parent can read children lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can insert class lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can update lesson progress"
  ON lesson_progress FOR UPDATE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can update class lesson progress"
  ON lesson_progress FOR UPDATE
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can delete lesson progress"
  ON lesson_progress FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

-- -------------------------------------------------------------------------
-- sessions: Admin all; teacher read school + write own; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school sessions"
  ON sessions FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school sessions"
  ON sessions FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can read own sessions"
  ON sessions FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Parent can read children sessions"
  ON sessions FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can update sessions"
  ON sessions FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update own sessions"
  ON sessions FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can delete sessions"
  ON sessions FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- homework: Admin all; teacher read school + write own; student read/update own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school homework"
  ON homework FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school homework"
  ON homework FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can read own homework"
  ON homework FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Parent can read children homework"
  ON homework FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert homework"
  ON homework FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can insert homework"
  ON homework FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Admin can update homework"
  ON homework FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update homework"
  ON homework FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can update own homework"
  ON homework FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Admin can delete homework"
  ON homework FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- attendance: Admin all; teacher read school + write own; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school attendance"
  ON attendance FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school attendance"
  ON attendance FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can read own attendance"
  ON attendance FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Parent can read children attendance"
  ON attendance FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND marked_by = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can update attendance"
  ON attendance FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update attendance"
  ON attendance FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND marked_by = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can delete attendance"
  ON attendance FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- stickers: Admin all; all members read
-- -------------------------------------------------------------------------
CREATE POLICY "Members can read school stickers"
  ON stickers FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Admin can insert stickers"
  ON stickers FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update stickers"
  ON stickers FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete stickers"
  ON stickers FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- student_stickers: Admin all; teacher read + award class; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school student stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can read class student stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Student can read own stickers"
  ON student_stickers FOR SELECT
  USING (student_id = auth.uid() AND get_user_role() = 'student');

CREATE POLICY "Parent can read children stickers"
  ON student_stickers FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert student stickers"
  ON student_stickers FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can award stickers to class students"
  ON student_stickers FOR INSERT
  WITH CHECK (
    get_user_role() = 'teacher'
    AND awarded_by = auth.uid()
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin can delete student stickers"
  ON student_stickers FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

-- -------------------------------------------------------------------------
-- trophies: All read (global)
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can read trophies"
  ON trophies FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert trophies"
  ON trophies FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin can update trophies"
  ON trophies FOR UPDATE
  USING (get_user_role() = 'admin');

CREATE POLICY "Admin can delete trophies"
  ON trophies FOR DELETE
  USING (get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- student_trophies: Admin all; teacher read; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school student trophies"
  ON student_trophies FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can read student trophies"
  ON student_trophies FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Student can read own trophies"
  ON student_trophies FOR SELECT
  USING (student_id = auth.uid() AND get_user_role() = 'student');

CREATE POLICY "Parent can read children trophies"
  ON student_trophies FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert student trophies"
  ON student_trophies FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Admin can delete student trophies"
  ON student_trophies FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

-- -------------------------------------------------------------------------
-- achievements: All read (global)
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert achievements"
  ON achievements FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admin can update achievements"
  ON achievements FOR UPDATE
  USING (get_user_role() = 'admin');

CREATE POLICY "Admin can delete achievements"
  ON achievements FOR DELETE
  USING (get_user_role() = 'admin');

-- -------------------------------------------------------------------------
-- student_achievements: Admin all; teacher read; student own; parent children
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school student achievements"
  ON student_achievements FOR SELECT
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Teacher can read student achievements"
  ON student_achievements FOR SELECT
  USING (
    get_user_role() = 'teacher'
    AND student_id IN (
      SELECT s.id FROM students s
      JOIN classes c ON s.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Student can read own achievements"
  ON student_achievements FOR SELECT
  USING (student_id = auth.uid() AND get_user_role() = 'student');

CREATE POLICY "Parent can read children achievements"
  ON student_achievements FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admin can insert student achievements"
  ON student_achievements FOR INSERT
  WITH CHECK (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

CREATE POLICY "Admin can delete student achievements"
  ON student_achievements FOR DELETE
  USING (
    get_user_role() = 'admin'
    AND student_id IN (SELECT id FROM students WHERE school_id = get_user_school_id())
  );

-- -------------------------------------------------------------------------
-- teacher_checkins: Admin all; teacher own CRUD
-- -------------------------------------------------------------------------
CREATE POLICY "Admin can read all school teacher checkins"
  ON teacher_checkins FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read own checkins"
  ON teacher_checkins FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can insert teacher checkins"
  ON teacher_checkins FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can insert own checkins"
  ON teacher_checkins FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can update teacher checkins"
  ON teacher_checkins FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can update own checkins"
  ON teacher_checkins FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can delete teacher checkins"
  ON teacher_checkins FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can delete own checkins"
  ON teacher_checkins FOR DELETE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

-- -------------------------------------------------------------------------
-- levels: All read (global)
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can read levels"
  ON levels FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage levels"
  ON levels FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================================
-- SECTION 6: Triggers
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER set_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- ============================================================================
-- SECTION 7: Seed Data - Levels (PRD 9.2)
-- ============================================================================

INSERT INTO levels (level_number, title, points_required) VALUES
  (1,  'Beginner',        0),
  (2,  'Seeker',          50),
  (3,  'Reciter',         150),
  (4,  'Memorizer',       300),
  (5,  'Scholar',         500),
  (6,  'Hafiz Star',      800),
  (7,  'Master',          1200),
  (8,  'Champion',        1800),
  (9,  'Legend',           2500),
  (10, 'Quran Guardian',  3500);
