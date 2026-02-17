-- ============================================================================
-- Migration 00009: Quran Memorization Tracking & Revision System
-- New tables: recitations, memorization_progress, memorization_assignments
-- Alter: students (add can_self_assign)
-- New RPC: get_student_revision_schedule, get_student_memorization_stats
-- ============================================================================

-- ============================================================================
-- SECTION 1: Alter existing tables
-- ============================================================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS can_self_assign BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- SECTION 2: New tables
-- ============================================================================

-- ─── 2A. Recitations ────────────────────────────────────────────────────────
-- Individual verse recitations linked to sessions (1:many from sessions).
-- A single session can have multiple recitations covering different verse ranges.

CREATE TABLE recitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  from_ayah INTEGER NOT NULL CHECK (from_ayah >= 1),
  to_ayah INTEGER NOT NULL,
  recitation_type TEXT NOT NULL CHECK (recitation_type IN ('new_hifz', 'recent_review', 'old_review')),
  accuracy_score INTEGER CHECK (accuracy_score BETWEEN 1 AND 5),
  tajweed_score INTEGER CHECK (tajweed_score BETWEEN 1 AND 5),
  fluency_score INTEGER CHECK (fluency_score BETWEEN 1 AND 5),
  needs_repeat BOOLEAN NOT NULL DEFAULT false,
  mistake_notes TEXT,
  recitation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recitations_ayah_range_valid CHECK (to_ayah >= from_ayah)
);

CREATE INDEX idx_recitations_school ON recitations(school_id);
CREATE INDEX idx_recitations_session ON recitations(session_id);
CREATE INDEX idx_recitations_student ON recitations(student_id);
CREATE INDEX idx_recitations_teacher ON recitations(teacher_id);
CREATE INDEX idx_recitations_type ON recitations(recitation_type);
CREATE INDEX idx_recitations_date ON recitations(recitation_date);
CREATE INDEX idx_recitations_student_surah ON recitations(student_id, surah_number);

-- ─── 2B. Memorization Progress ──────────────────────────────────────────────
-- Student's cumulative knowledge map. Tracks memorization status and SM-2
-- spaced repetition data for each verse range a student has worked on.

CREATE TABLE memorization_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  from_ayah INTEGER NOT NULL CHECK (from_ayah >= 1),
  to_ayah INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'learning', 'memorized', 'needs_review')),
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  review_count INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
  interval_days INTEGER NOT NULL DEFAULT 0,
  avg_accuracy NUMERIC(3,2),
  avg_tajweed NUMERIC(3,2),
  avg_fluency NUMERIC(3,2),
  first_memorized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT memorization_progress_ayah_range_valid CHECK (to_ayah >= from_ayah),
  CONSTRAINT memorization_progress_ease_factor_range CHECK (ease_factor BETWEEN 1.30 AND 5.00),
  CONSTRAINT memorization_progress_interval_range CHECK (interval_days >= 0),
  CONSTRAINT memorization_progress_review_count_range CHECK (review_count >= 0),
  UNIQUE(student_id, surah_number, from_ayah, to_ayah)
);

CREATE INDEX idx_memorization_progress_school ON memorization_progress(school_id);
CREATE INDEX idx_memorization_progress_student ON memorization_progress(student_id);
CREATE INDEX idx_memorization_progress_student_status ON memorization_progress(student_id, status);
CREATE INDEX idx_memorization_progress_next_review ON memorization_progress(next_review_date);
CREATE INDEX idx_memorization_progress_student_surah ON memorization_progress(student_id, surah_number);

CREATE TRIGGER set_memorization_progress_updated_at
  BEFORE UPDATE ON memorization_progress
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── 2C. Memorization Assignments ───────────────────────────────────────────
-- Teacher-assigned or self-assigned memorization/review tasks for students.

CREATE TABLE memorization_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
  from_ayah INTEGER NOT NULL CHECK (from_ayah >= 1),
  to_ayah INTEGER NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('new_hifz', 'recent_review', 'old_review')),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
  completed_at TIMESTAMPTZ,
  recitation_id UUID REFERENCES recitations(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT memorization_assignments_ayah_range_valid CHECK (to_ayah >= from_ayah)
);

CREATE INDEX idx_memorization_assignments_school ON memorization_assignments(school_id);
CREATE INDEX idx_memorization_assignments_student ON memorization_assignments(student_id);
CREATE INDEX idx_memorization_assignments_assigned_by ON memorization_assignments(assigned_by);
CREATE INDEX idx_memorization_assignments_due_date ON memorization_assignments(due_date);
CREATE INDEX idx_memorization_assignments_status ON memorization_assignments(status);
CREATE INDEX idx_memorization_assignments_student_status ON memorization_assignments(student_id, status);

CREATE TRIGGER set_memorization_assignments_updated_at
  BEFORE UPDATE ON memorization_assignments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- SECTION 3: Row Level Security
-- ============================================================================

-- ─── 3A. Recitations ────────────────────────────────────────────────────────

ALTER TABLE recitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all school recitations"
  ON recitations FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school recitations"
  ON recitations FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert recitations"
  ON recitations FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Teacher can update own recitations"
  ON recitations FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Student can read own recitations"
  ON recitations FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Parent can read children recitations"
  ON recitations FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- ─── 3B. Memorization Progress ──────────────────────────────────────────────

ALTER TABLE memorization_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read all school memorization progress"
  ON memorization_progress FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school memorization progress"
  ON memorization_progress FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert memorization progress"
  ON memorization_progress FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can update school memorization progress"
  ON memorization_progress FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Student can read own memorization progress"
  ON memorization_progress FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Parent can read children memorization progress"
  ON memorization_progress FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- ─── 3C. Memorization Assignments ───────────────────────────────────────────

ALTER TABLE memorization_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all school assignments"
  ON memorization_assignments FOR ALL
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read school assignments"
  ON memorization_assignments FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert assignments"
  ON memorization_assignments FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND assigned_by = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Teacher can update own assignments"
  ON memorization_assignments FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND assigned_by = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Student can read own assignments"
  ON memorization_assignments FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND get_user_role() = 'student'
  );

CREATE POLICY "Student with self-assign can insert own assignments"
  ON memorization_assignments FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND assigned_by = auth.uid()
    AND get_user_role() = 'student'
    AND EXISTS (
      SELECT 1 FROM students WHERE id = auth.uid() AND can_self_assign = true
    )
  );

CREATE POLICY "Parent can read children assignments"
  ON memorization_assignments FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 4: RPC Functions
-- ============================================================================

-- ─── 4A. Get Student Revision Schedule ──────────────────────────────────────
-- Returns daily plan split by new_hifz / recent_review / old_review.
-- Recent review = first_memorized_at within last 7 days.
-- Old review = first_memorized_at older than 7 days.

CREATE OR REPLACE FUNCTION get_student_revision_schedule(
  p_student_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  progress_id UUID,
  surah_number INTEGER,
  from_ayah INTEGER,
  to_ayah INTEGER,
  status TEXT,
  review_type TEXT,
  next_review_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER,
  ease_factor NUMERIC,
  avg_accuracy NUMERIC,
  avg_tajweed NUMERIC,
  avg_fluency NUMERIC,
  first_memorized_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  -- New hifz assignments for today
  SELECT
    NULL::UUID AS progress_id,
    ma.surah_number,
    ma.from_ayah,
    ma.to_ayah,
    'assigned'::TEXT AS status,
    'new_hifz'::TEXT AS review_type,
    ma.due_date AS next_review_date,
    NULL::TIMESTAMPTZ AS last_reviewed_at,
    0 AS review_count,
    2.50::NUMERIC AS ease_factor,
    NULL::NUMERIC AS avg_accuracy,
    NULL::NUMERIC AS avg_tajweed,
    NULL::NUMERIC AS avg_fluency,
    NULL::TIMESTAMPTZ AS first_memorized_at
  FROM memorization_assignments ma
  WHERE ma.student_id = p_student_id
    AND ma.assignment_type = 'new_hifz'
    AND ma.status = 'pending'
    AND ma.due_date <= p_date

  UNION ALL

  -- Recent review: memorized within last 7 days, due for review
  SELECT
    mp.id AS progress_id,
    mp.surah_number,
    mp.from_ayah,
    mp.to_ayah,
    mp.status,
    'recent_review'::TEXT AS review_type,
    mp.next_review_date,
    mp.last_reviewed_at,
    mp.review_count,
    mp.ease_factor,
    mp.avg_accuracy,
    mp.avg_tajweed,
    mp.avg_fluency,
    mp.first_memorized_at
  FROM memorization_progress mp
  WHERE mp.student_id = p_student_id
    AND mp.status IN ('memorized', 'learning', 'needs_review')
    AND mp.first_memorized_at IS NOT NULL
    AND mp.first_memorized_at >= (p_date - INTERVAL '7 days')
    AND (mp.next_review_date IS NULL OR mp.next_review_date <= p_date)

  UNION ALL

  -- Old review: memorized more than 7 days ago, due for review
  SELECT
    mp.id AS progress_id,
    mp.surah_number,
    mp.from_ayah,
    mp.to_ayah,
    mp.status,
    'old_review'::TEXT AS review_type,
    mp.next_review_date,
    mp.last_reviewed_at,
    mp.review_count,
    mp.ease_factor,
    mp.avg_accuracy,
    mp.avg_tajweed,
    mp.avg_fluency,
    mp.first_memorized_at
  FROM memorization_progress mp
  WHERE mp.student_id = p_student_id
    AND mp.status IN ('memorized', 'learning', 'needs_review')
    AND mp.first_memorized_at IS NOT NULL
    AND mp.first_memorized_at < (p_date - INTERVAL '7 days')
    AND (mp.next_review_date IS NULL OR mp.next_review_date <= p_date)

  ORDER BY next_review_date ASC NULLS FIRST;
$$;

-- ─── 4B. Get Student Memorization Stats ─────────────────────────────────────
-- Returns aggregate stats: total ayahs memorized, surahs started/completed,
-- percentage of Quran memorized.

CREATE OR REPLACE FUNCTION get_student_memorization_stats(
  p_student_id UUID
)
RETURNS TABLE (
  total_ayahs_memorized BIGINT,
  total_ayahs_in_progress BIGINT,
  surahs_started BIGINT,
  surahs_completed BIGINT,
  quran_percentage NUMERIC,
  items_needing_review BIGINT,
  total_recitations BIGINT,
  avg_overall_accuracy NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(
      CASE WHEN mp.status = 'memorized'
        THEN mp.to_ayah - mp.from_ayah + 1
        ELSE 0
      END
    ), 0) AS total_ayahs_memorized,
    COALESCE(SUM(
      CASE WHEN mp.status IN ('learning', 'new')
        THEN mp.to_ayah - mp.from_ayah + 1
        ELSE 0
      END
    ), 0) AS total_ayahs_in_progress,
    COUNT(DISTINCT mp.surah_number) AS surahs_started,
    -- A surah is completed when the total memorized ayahs equals the surah length
    -- (simplified: count distinct surahs with status=memorized as a proxy)
    (SELECT COUNT(DISTINCT sub.surah_number)
     FROM memorization_progress sub
     WHERE sub.student_id = p_student_id
       AND sub.status = 'memorized'
    ) AS surahs_completed,
    ROUND(
      COALESCE(SUM(
        CASE WHEN mp.status = 'memorized'
          THEN mp.to_ayah - mp.from_ayah + 1
          ELSE 0
        END
      ), 0)::NUMERIC / 6236.0 * 100,
      2
    ) AS quran_percentage,
    COUNT(*) FILTER (WHERE mp.status = 'needs_review') AS items_needing_review,
    (SELECT COUNT(*) FROM recitations r WHERE r.student_id = p_student_id) AS total_recitations,
    (SELECT ROUND(AVG(r.accuracy_score)::NUMERIC, 2) FROM recitations r WHERE r.student_id = p_student_id AND r.accuracy_score IS NOT NULL) AS avg_overall_accuracy
  FROM memorization_progress mp
  WHERE mp.student_id = p_student_id;
$$;

-- ============================================================================
-- SECTION 5: Enable Realtime for new tables
-- ============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE recitations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE memorization_assignments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
