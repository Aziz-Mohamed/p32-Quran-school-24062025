-- ============================================================================
-- Migration 00008: Scheduled Sessions & GPS Teacher Attendance
-- Alter: schools (add geolocation), teacher_checkins (add GPS verification),
--        attendance (add scheduled_session_id FK)
-- New tables: teacher_work_schedules, class_schedules, scheduled_sessions
-- New RPC: get_teacher_attendance_kpis, get_session_completion_stats
-- ============================================================================

-- ============================================================================
-- SECTION 1: Alter existing tables
-- ============================================================================

-- ─── 1A. Schools: add geolocation fields ─────────────────────────────────────

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER NOT NULL DEFAULT 200;

ALTER TABLE schools
  ADD CONSTRAINT schools_geofence_radius_range
    CHECK (geofence_radius_meters BETWEEN 50 AND 2000);

ALTER TABLE schools
  ADD CONSTRAINT schools_coords_both_or_neither
    CHECK (
      (latitude IS NULL AND longitude IS NULL)
      OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    );

-- ─── 1B. Teacher checkins: add GPS verification ─────────────────────────────

ALTER TABLE teacher_checkins
  ADD COLUMN IF NOT EXISTS checkin_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkin_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkin_distance_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_distance_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS verification_method TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE teacher_checkins
  ADD CONSTRAINT teacher_checkins_verification_method_check
    CHECK (verification_method IN ('gps', 'manual', 'none'));

CREATE INDEX IF NOT EXISTS idx_teacher_checkins_is_verified
  ON teacher_checkins(is_verified);
CREATE INDEX IF NOT EXISTS idx_teacher_checkins_verification_method
  ON teacher_checkins(verification_method);

-- ============================================================================
-- SECTION 2: New tables
-- ============================================================================

-- ─── 2A. Teacher work schedules ──────────────────────────────────────────────
-- Expected work hours per teacher per day of week.
-- Admin defines these; used to calculate lateness/punctuality.

CREATE TABLE teacher_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    -- 0=Sunday, 1=Monday, ... 6=Saturday (matches JS Date.getDay())
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT teacher_work_schedules_valid_hours CHECK (end_time > start_time),
  UNIQUE(teacher_id, day_of_week)
);

CREATE INDEX idx_teacher_work_schedules_school ON teacher_work_schedules(school_id);
CREATE INDEX idx_teacher_work_schedules_teacher ON teacher_work_schedules(teacher_id);

CREATE TRIGGER set_teacher_work_schedules_updated_at
  BEFORE UPDATE ON teacher_work_schedules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── 2B. Class schedules ────────────────────────────────────────────────────
-- Recurring session patterns for classes. Replaces unstructured classes.schedule JSONB.

CREATE TABLE class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT class_schedules_valid_hours CHECK (end_time > start_time),
  UNIQUE(class_id, day_of_week, start_time)
);

CREATE INDEX idx_class_schedules_school ON class_schedules(school_id);
CREATE INDEX idx_class_schedules_class ON class_schedules(class_id);

CREATE TRIGGER set_class_schedules_updated_at
  BEFORE UPDATE ON class_schedules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── 2C. Scheduled sessions ─────────────────────────────────────────────────
-- Materialized session instances, generated from class_schedules or created
-- manually for individual tutoring.

CREATE TABLE scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  class_schedule_id UUID REFERENCES class_schedules(id) ON DELETE SET NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    -- NULL for class sessions; set for individual sessions
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('class', 'individual')),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'missed')),
  title TEXT,
  notes TEXT,
  cancelled_reason TEXT,
  completed_at TIMESTAMPTZ,
  evaluation_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    -- Links to the evaluation session when teacher logs scores
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT scheduled_sessions_valid_times CHECK (end_time > start_time),
  CONSTRAINT scheduled_sessions_individual_needs_student CHECK (
    session_type = 'class' OR student_id IS NOT NULL
  )
);

-- Dedup: prevent duplicate generated sessions for same schedule+date
CREATE UNIQUE INDEX idx_scheduled_sessions_dedup
  ON scheduled_sessions(class_schedule_id, session_date)
  WHERE class_schedule_id IS NOT NULL;

CREATE INDEX idx_scheduled_sessions_school ON scheduled_sessions(school_id);
CREATE INDEX idx_scheduled_sessions_class ON scheduled_sessions(class_id);
CREATE INDEX idx_scheduled_sessions_teacher ON scheduled_sessions(teacher_id);
CREATE INDEX idx_scheduled_sessions_student ON scheduled_sessions(student_id);
CREATE INDEX idx_scheduled_sessions_date ON scheduled_sessions(session_date);
CREATE INDEX idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE INDEX idx_scheduled_sessions_type_date ON scheduled_sessions(session_type, session_date);

CREATE TRIGGER set_scheduled_sessions_updated_at
  BEFORE UPDATE ON scheduled_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── 2D. Alter attendance: link to scheduled sessions ────────────────────────

ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS scheduled_session_id UUID
    REFERENCES scheduled_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_attendance_scheduled_session
  ON attendance(scheduled_session_id);

-- ============================================================================
-- SECTION 3: Row Level Security
-- ============================================================================

-- ─── 3A. teacher_work_schedules ──────────────────────────────────────────────

ALTER TABLE teacher_work_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read school work schedules"
  ON teacher_work_schedules FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Teacher can read own work schedule"
  ON teacher_work_schedules FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Admin can insert work schedules"
  ON teacher_work_schedules FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update work schedules"
  ON teacher_work_schedules FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete work schedules"
  ON teacher_work_schedules FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ─── 3B. class_schedules ────────────────────────────────────────────────────

ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read school class schedules"
  ON class_schedules FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "Admin can insert class schedules"
  ON class_schedules FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update class schedules"
  ON class_schedules FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete class schedules"
  ON class_schedules FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- ─── 3C. scheduled_sessions ─────────────────────────────────────────────────

ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;

-- Admin: full access within school
CREATE POLICY "Admin can read all school scheduled sessions"
  ON scheduled_sessions FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can insert scheduled sessions"
  ON scheduled_sessions FOR INSERT
  WITH CHECK (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can update scheduled sessions"
  ON scheduled_sessions FOR UPDATE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

CREATE POLICY "Admin can delete scheduled sessions"
  ON scheduled_sessions FOR DELETE
  USING (school_id = get_user_school_id() AND get_user_role() = 'admin');

-- Teacher: read all school sessions, manage own
CREATE POLICY "Teacher can read school scheduled sessions"
  ON scheduled_sessions FOR SELECT
  USING (school_id = get_user_school_id() AND get_user_role() = 'teacher');

CREATE POLICY "Teacher can insert own scheduled sessions"
  ON scheduled_sessions FOR INSERT
  WITH CHECK (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

CREATE POLICY "Teacher can update own scheduled sessions"
  ON scheduled_sessions FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND teacher_id = auth.uid()
    AND get_user_role() = 'teacher'
  );

-- Student: read own class sessions and individual sessions
CREATE POLICY "Student can read own scheduled sessions"
  ON scheduled_sessions FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'student'
    AND (
      (session_type = 'class' AND class_id IN (
        SELECT class_id FROM students WHERE id = auth.uid()
      ))
      OR
      (session_type = 'individual' AND student_id = auth.uid())
    )
  );

-- Parent: read children's sessions
CREATE POLICY "Parent can read children scheduled sessions"
  ON scheduled_sessions FOR SELECT
  USING (
    school_id = get_user_school_id()
    AND get_user_role() = 'parent'
    AND (
      (session_type = 'class' AND class_id IN (
        SELECT class_id FROM students WHERE parent_id = auth.uid()
      ))
      OR
      (session_type = 'individual' AND student_id IN (
        SELECT id FROM students WHERE parent_id = auth.uid()
      ))
    )
  );

-- ============================================================================
-- SECTION 4: RPC Functions for Analytics
-- ============================================================================

-- ─── 4A. Teacher attendance KPIs ─────────────────────────────────────────────
-- Returns per-teacher: days_present, days_on_time, days_late, total_hours,
-- avg_hours_per_day, punctuality_rate

CREATE OR REPLACE FUNCTION get_teacher_attendance_kpis(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  teacher_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  days_present BIGINT,
  days_on_time BIGINT,
  days_late BIGINT,
  total_hours_worked NUMERIC,
  avg_hours_per_day NUMERIC,
  punctuality_rate NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS teacher_id,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT tc.date) AS days_present,
    COUNT(DISTINCT tc.date) FILTER (
      WHERE tc.checked_in_at::TIME <=
        COALESCE(
          (SELECT tws.start_time + INTERVAL '15 minutes'
           FROM teacher_work_schedules tws
           WHERE tws.teacher_id = p.id
             AND tws.day_of_week = EXTRACT(DOW FROM tc.date)::INTEGER
             AND tws.is_active = true
           LIMIT 1),
          '23:59'::TIME
        )
    ) AS days_on_time,
    COUNT(DISTINCT tc.date) FILTER (
      WHERE tc.checked_in_at::TIME >
        COALESCE(
          (SELECT tws.start_time + INTERVAL '15 minutes'
           FROM teacher_work_schedules tws
           WHERE tws.teacher_id = p.id
             AND tws.day_of_week = EXTRACT(DOW FROM tc.date)::INTEGER
             AND tws.is_active = true
           LIMIT 1),
          '23:59'::TIME
        )
    ) AS days_late,
    ROUND(
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (
          COALESCE(tc.checked_out_at, tc.checked_in_at) - tc.checked_in_at
        )) / 3600.0
      ), 0)::NUMERIC,
      1
    ) AS total_hours_worked,
    ROUND(
      COALESCE(AVG(
        EXTRACT(EPOCH FROM (
          COALESCE(tc.checked_out_at, tc.checked_in_at) - tc.checked_in_at
        )) / 3600.0
      ), 0)::NUMERIC,
      1
    ) AS avg_hours_per_day,
    ROUND(
      COALESCE(
        COUNT(DISTINCT tc.date) FILTER (
          WHERE tc.checked_in_at::TIME <=
            COALESCE(
              (SELECT tws.start_time + INTERVAL '15 minutes'
               FROM teacher_work_schedules tws
               WHERE tws.teacher_id = p.id
                 AND tws.day_of_week = EXTRACT(DOW FROM tc.date)::INTEGER
                 AND tws.is_active = true
               LIMIT 1),
              '23:59'::TIME
            )
        )::NUMERIC
        / NULLIF(COUNT(DISTINCT tc.date), 0)::NUMERIC * 100,
        0
      ),
      1
    ) AS punctuality_rate
  FROM profiles p
  LEFT JOIN teacher_checkins tc
    ON tc.teacher_id = p.id
    AND tc.date >= p_start_date
    AND tc.date <= p_end_date
    AND tc.is_verified = true
  WHERE p.school_id = p_school_id
    AND p.role = 'teacher'
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY days_present DESC;
$$;

-- ─── 4B. Session completion stats ────────────────────────────────────────────
-- Returns per-teacher: total scheduled, completed, cancelled, missed, completion rate

CREATE OR REPLACE FUNCTION get_session_completion_stats(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  teacher_id UUID,
  full_name TEXT,
  total_scheduled BIGINT,
  completed_count BIGINT,
  cancelled_count BIGINT,
  missed_count BIGINT,
  completion_rate NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS teacher_id,
    p.full_name,
    COUNT(ss.id) AS total_scheduled,
    COUNT(ss.id) FILTER (WHERE ss.status = 'completed') AS completed_count,
    COUNT(ss.id) FILTER (WHERE ss.status = 'cancelled') AS cancelled_count,
    COUNT(ss.id) FILTER (WHERE ss.status = 'missed') AS missed_count,
    ROUND(
      COALESCE(
        COUNT(ss.id) FILTER (WHERE ss.status = 'completed')::NUMERIC
        / NULLIF(COUNT(ss.id) FILTER (WHERE ss.status IN ('completed', 'missed')), 0)::NUMERIC
        * 100,
        0
      ),
      1
    ) AS completion_rate
  FROM profiles p
  LEFT JOIN scheduled_sessions ss
    ON ss.teacher_id = p.id
    AND ss.session_date >= p_start_date
    AND ss.session_date <= p_end_date
  WHERE p.school_id = p_school_id
    AND p.role = 'teacher'
  GROUP BY p.id, p.full_name
  ORDER BY completion_rate DESC NULLS LAST;
$$;

-- ============================================================================
-- SECTION 5: Enable Realtime for new tables
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_sessions;

-- teacher_checkins may already be in the publication from 00003;
-- use DO block to avoid error if already added
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE teacher_checkins;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- SECTION 6: Cron job for session generation
-- ============================================================================

-- Generate scheduled sessions from class_schedules (runs every 15 min,
-- Edge Function checks school timezone and only generates at ~3 AM local time)
SELECT cron.schedule(
  'generate-sessions',
  '*/15 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://zngiszdfdowjvwxqmexl.supabase.co/functions/v1/generate-sessions',
    body := '{"time": "' || now()::text || '"}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
