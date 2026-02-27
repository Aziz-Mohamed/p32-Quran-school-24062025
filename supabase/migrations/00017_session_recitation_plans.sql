-- ============================================================================
-- Migration 00017: Session Recitation Plans
-- Documents the session_recitation_plans table (created previously on remote).
-- Uses IF NOT EXISTS for idempotency.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Create table
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_recitation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  scheduled_session_id UUID NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  set_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Selection mode determines which picker was used
  selection_mode TEXT NOT NULL DEFAULT 'ayah_range'
    CHECK (selection_mode IN ('ayah_range', 'rub', 'hizb', 'juz', 'surah')),

  -- Resolved ayah boundaries (always populated regardless of selection_mode)
  start_surah SMALLINT NOT NULL CHECK (start_surah BETWEEN 1 AND 114),
  start_ayah SMALLINT NOT NULL CHECK (start_ayah >= 1),
  end_surah SMALLINT NOT NULL CHECK (end_surah BETWEEN 1 AND 114),
  end_ayah SMALLINT NOT NULL CHECK (end_ayah >= 1),

  -- Division references (populated when selection_mode is rub/hizb/juz)
  rub_number INTEGER REFERENCES quran_rub_reference(rub_number),
  juz_number SMALLINT CHECK (juz_number BETWEEN 1 AND 30),
  hizb_number SMALLINT CHECK (hizb_number BETWEEN 1 AND 60),

  -- Categorisation
  recitation_type TEXT NOT NULL DEFAULT 'new_hifz'
    CHECK (recitation_type IN ('new_hifz', 'recent_review', 'old_review')),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'from_assignment', 'student_suggestion')),

  -- Optional link to the originating memorization assignment
  assignment_id UUID REFERENCES memorization_assignments(id) ON DELETE SET NULL,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 2: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recitation_plans_school
  ON session_recitation_plans(school_id);

CREATE INDEX IF NOT EXISTS idx_recitation_plans_session
  ON session_recitation_plans(scheduled_session_id);

CREATE INDEX IF NOT EXISTS idx_recitation_plans_student
  ON session_recitation_plans(student_id)
  WHERE student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recitation_plans_set_by
  ON session_recitation_plans(set_by);

CREATE INDEX IF NOT EXISTS idx_recitation_plans_assignment
  ON session_recitation_plans(assignment_id)
  WHERE assignment_id IS NOT NULL;

-- Partial unique: only one teacher/admin plan per session+student
-- (student suggestions are excluded so students can suggest freely)
CREATE UNIQUE INDEX IF NOT EXISTS idx_recitation_plans_teacher_per_student
  ON session_recitation_plans(scheduled_session_id, student_id)
  WHERE source <> 'student_suggestion';

-- Unique: only one session-level default (student_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_recitation_plans_session_default
  ON session_recitation_plans(scheduled_session_id)
  WHERE student_id IS NULL;

-- ============================================================================
-- SECTION 3: Trigger for updated_at
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_session_recitation_plans_updated_at'
      AND tgrelid = 'session_recitation_plans'::regclass
  ) THEN
    CREATE TRIGGER set_session_recitation_plans_updated_at
      BEFORE UPDATE ON session_recitation_plans
      FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: Row Level Security
-- ============================================================================

ALTER TABLE session_recitation_plans ENABLE ROW LEVEL SECURITY;

-- Admin: full access within school
DO $$ BEGIN
CREATE POLICY "Admin can manage all school recitation plans"
  ON session_recitation_plans FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Teacher: read all school plans
DO $$ BEGIN
CREATE POLICY "Teacher can read school recitation plans"
  ON session_recitation_plans FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Teacher: insert plans for own sessions
DO $$ BEGIN
CREATE POLICY "Teacher can insert recitation plans for own sessions"
  ON session_recitation_plans FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND set_by = auth.uid()
    AND scheduled_session_id IN (
      SELECT id FROM scheduled_sessions WHERE teacher_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Teacher: update plans for own sessions
DO $$ BEGIN
CREATE POLICY "Teacher can update recitation plans for own sessions"
  ON session_recitation_plans FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND scheduled_session_id IN (
      SELECT id FROM scheduled_sessions WHERE teacher_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Teacher: delete plans for own sessions
DO $$ BEGIN
CREATE POLICY "Teacher can delete recitation plans for own sessions"
  ON session_recitation_plans FOR DELETE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'teacher'
    AND scheduled_session_id IN (
      SELECT id FROM scheduled_sessions WHERE teacher_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student: read own plans + session defaults for their sessions
DO $$ BEGIN
CREATE POLICY "Student can read own recitation plans"
  ON session_recitation_plans FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND (
      student_id = auth.uid()
      OR (
        student_id IS NULL
        AND scheduled_session_id IN (
          SELECT ss.id FROM scheduled_sessions ss
          WHERE ss.student_id = auth.uid()
            OR (ss.session_type = 'class' AND ss.class_id IN (
              SELECT class_id FROM students WHERE id = auth.uid()
            ))
        )
      )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student: insert own suggestions
DO $$ BEGIN
CREATE POLICY "Student can insert own recitation plans"
  ON session_recitation_plans FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id = auth.uid()
    AND set_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student: update own plans
DO $$ BEGIN
CREATE POLICY "Student can update own recitation plans"
  ON session_recitation_plans FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id = auth.uid()
    AND set_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Student: delete own plans
DO $$ BEGIN
CREATE POLICY "Student can delete own recitation plans"
  ON session_recitation_plans FOR DELETE
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND student_id = auth.uid()
    AND set_by = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Parent: read children's plans + session defaults
DO $$ BEGIN
CREATE POLICY "Parent can read children recitation plans"
  ON session_recitation_plans FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND (
      student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
      OR (
        student_id IS NULL
        AND scheduled_session_id IN (
          SELECT ss.id FROM scheduled_sessions ss
          WHERE ss.session_type = 'class'
            AND ss.class_id IN (
              SELECT class_id FROM students WHERE parent_id = auth.uid()
            )
        )
      )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- SECTION 5: Enable Realtime
-- ============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE session_recitation_plans;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
