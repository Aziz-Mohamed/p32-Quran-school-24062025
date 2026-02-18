-- ============================================================================
-- Reports & Analytics — RPC Functions
-- All functions use SECURITY INVOKER + SET search_path = public
-- ============================================================================

-- ============================================================================
-- 1. get_attendance_trend
-- Groups attendance records by date_trunc(granularity, date), computes status
-- counts, and calculates rate = (present + late) / NULLIF(present + absent + late, 0) * 100.
-- Optional class filter.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_attendance_trend(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  bucket_date DATE,
  present_count BIGINT,
  absent_count BIGINT,
  late_count BIGINT,
  excused_count BIGINT,
  attendance_rate NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    date_trunc(p_granularity, a.date)::DATE AS bucket_date,
    COUNT(*) FILTER (WHERE a.status = 'present') AS present_count,
    COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_count,
    COUNT(*) FILTER (WHERE a.status = 'late') AS late_count,
    COUNT(*) FILTER (WHERE a.status = 'excused') AS excused_count,
    ROUND(
      (COUNT(*) FILTER (WHERE a.status = 'present') + COUNT(*) FILTER (WHERE a.status = 'late'))::NUMERIC
      / NULLIF(
          (COUNT(*) FILTER (WHERE a.status = 'present')
           + COUNT(*) FILTER (WHERE a.status = 'absent')
           + COUNT(*) FILTER (WHERE a.status = 'late')),
          0
        )
      * 100,
      1
    ) AS attendance_rate
  FROM attendance a
  WHERE a.school_id = p_school_id
    AND a.date >= p_start_date
    AND a.date <= p_end_date
    AND (p_class_id IS NULL OR a.class_id = p_class_id)
  GROUP BY bucket_date
  ORDER BY bucket_date;
$$;

-- ============================================================================
-- 2. get_score_trend
-- Groups sessions by date_trunc(granularity, session_date), computes AVG of
-- each score type. Excludes NULLs. Optional class filter.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_score_trend(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  bucket_date DATE,
  avg_memorization NUMERIC,
  avg_tajweed NUMERIC,
  avg_recitation NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    date_trunc(p_granularity, s.session_date)::DATE AS bucket_date,
    ROUND(AVG(s.memorization_score)::NUMERIC, 2) AS avg_memorization,
    ROUND(AVG(s.tajweed_score)::NUMERIC, 2) AS avg_tajweed,
    ROUND(AVG(s.recitation_quality)::NUMERIC, 2) AS avg_recitation
  FROM sessions s
  WHERE s.school_id = p_school_id
    AND s.session_date >= p_start_date
    AND s.session_date <= p_end_date
    AND (p_class_id IS NULL OR s.class_id = p_class_id)
    AND (s.memorization_score IS NOT NULL
         OR s.tajweed_score IS NOT NULL
         OR s.recitation_quality IS NOT NULL)
  GROUP BY bucket_date
  ORDER BY bucket_date;
$$;

-- ============================================================================
-- 3. get_teacher_activity
-- Joins profiles (role='teacher', is_active via profiles existing) with LEFT JOINs
-- to sessions and student_stickers for the given period. Excludes deactivated
-- teachers (profiles that don't have an active student record — but teachers are
-- identified by role, not student status).
-- Note: Edge Case 13 — we only include teachers whose profile exists and
-- there is no separate is_active flag on profiles. We rely on the presence
-- of a profile with role='teacher' in the school.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_teacher_activity(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  teacher_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  sessions_logged BIGINT,
  unique_students BIGINT,
  stickers_awarded BIGINT,
  last_active_date DATE
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS teacher_id,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT s.id) AS sessions_logged,
    COUNT(DISTINCT s.student_id) AS unique_students,
    COUNT(DISTINCT ss.id) AS stickers_awarded,
    MAX(s.session_date) AS last_active_date
  FROM profiles p
  LEFT JOIN sessions s
    ON s.teacher_id = p.id
    AND s.session_date >= p_start_date
    AND s.session_date <= p_end_date
  LEFT JOIN student_stickers ss
    ON ss.awarded_by = p.id
    AND ss.awarded_at >= p_start_date::TIMESTAMPTZ
    AND ss.awarded_at < (p_end_date + INTERVAL '1 day')::TIMESTAMPTZ
  WHERE p.school_id = p_school_id
    AND p.role = 'teacher'
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY sessions_logged DESC, p.full_name ASC;
$$;

-- ============================================================================
-- 4. get_students_needing_attention
-- Scopes sessions to date range when provided. Uses window functions to get
-- each student's last 6 sessions. Computes avg of rows 1-3 (current) and
-- 4-6 (previous). Flags students where current_avg < previous_avg OR any
-- score < 3 in last 2 sessions. Returns at most 10 rows ordered by
-- decline_amount DESC.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_students_needing_attention(
  p_class_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  current_avg NUMERIC,
  previous_avg NUMERIC,
  decline_amount NUMERIC,
  flag_reason TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_sessions AS (
    SELECT
      s.student_id,
      s.memorization_score,
      s.tajweed_score,
      s.recitation_quality,
      s.session_date,
      ROW_NUMBER() OVER (
        PARTITION BY s.student_id
        ORDER BY s.session_date DESC, s.created_at DESC
      ) AS rn
    FROM sessions s
    INNER JOIN students st ON st.id = s.student_id
    WHERE st.class_id = p_class_id
      AND (p_start_date IS NULL OR s.session_date >= p_start_date)
      AND (p_end_date IS NULL OR s.session_date <= p_end_date)
      AND (s.memorization_score IS NOT NULL
           OR s.tajweed_score IS NOT NULL
           OR s.recitation_quality IS NOT NULL)
  ),
  student_avgs AS (
    SELECT
      rs.student_id,
      -- Current avg: last 3 sessions (rn 1-3)
      AVG(
        CASE WHEN rs.rn <= 3 THEN
          (COALESCE(rs.memorization_score, 0)
           + COALESCE(rs.tajweed_score, 0)
           + COALESCE(rs.recitation_quality, 0))::NUMERIC
          / NULLIF(
              (CASE WHEN rs.memorization_score IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN rs.tajweed_score IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN rs.recitation_quality IS NOT NULL THEN 1 ELSE 0 END),
              0
            )
        END
      ) AS curr_avg,
      -- Previous avg: sessions 4-6
      AVG(
        CASE WHEN rs.rn BETWEEN 4 AND 6 THEN
          (COALESCE(rs.memorization_score, 0)
           + COALESCE(rs.tajweed_score, 0)
           + COALESCE(rs.recitation_quality, 0))::NUMERIC
          / NULLIF(
              (CASE WHEN rs.memorization_score IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN rs.tajweed_score IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN rs.recitation_quality IS NOT NULL THEN 1 ELSE 0 END),
              0
            )
        END
      ) AS prev_avg,
      -- Check if any score < 3 in last 2 sessions
      BOOL_OR(
        CASE WHEN rs.rn <= 2 THEN
          (rs.memorization_score IS NOT NULL AND rs.memorization_score < 3)
          OR (rs.tajweed_score IS NOT NULL AND rs.tajweed_score < 3)
          OR (rs.recitation_quality IS NOT NULL AND rs.recitation_quality < 3)
        ELSE FALSE END
      ) AS has_low_recent,
      COUNT(*) FILTER (WHERE rs.rn <= 3) AS session_count
    FROM ranked_sessions rs
    WHERE rs.rn <= 6
    GROUP BY rs.student_id
  )
  SELECT
    sa.student_id,
    p.full_name,
    p.avatar_url,
    ROUND(sa.curr_avg, 2) AS current_avg,
    ROUND(COALESCE(sa.prev_avg, 0), 2) AS previous_avg,
    ROUND(COALESCE(sa.prev_avg - sa.curr_avg, 0), 2) AS decline_amount,
    CASE
      WHEN sa.session_count >= 3 AND sa.prev_avg IS NOT NULL AND sa.curr_avg < sa.prev_avg
        THEN 'declining'
      WHEN sa.has_low_recent
        THEN 'low_scores'
      ELSE NULL
    END AS flag_reason
  FROM student_avgs sa
  INNER JOIN profiles p ON p.id = sa.student_id
  WHERE (
    (sa.session_count >= 3 AND sa.prev_avg IS NOT NULL AND sa.curr_avg < sa.prev_avg)
    OR sa.has_low_recent
  )
  ORDER BY decline_amount DESC
  LIMIT 10;
END;
$$;

-- ============================================================================
-- 5. get_child_score_trend
-- Uses two CTEs: one for the individual student's scores, one for all class
-- students' scores. Joins on bucket_date using FULL OUTER JOIN.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_child_score_trend(
  p_student_id UUID,
  p_class_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT
)
RETURNS TABLE (
  bucket_date DATE,
  avg_memorization NUMERIC,
  avg_tajweed NUMERIC,
  avg_recitation NUMERIC,
  class_avg_memorization NUMERIC,
  class_avg_tajweed NUMERIC,
  class_avg_recitation NUMERIC
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH child_scores AS (
    SELECT
      date_trunc(p_granularity, s.session_date)::DATE AS bucket,
      ROUND(AVG(s.memorization_score)::NUMERIC, 2) AS mem,
      ROUND(AVG(s.tajweed_score)::NUMERIC, 2) AS taj,
      ROUND(AVG(s.recitation_quality)::NUMERIC, 2) AS rec
    FROM sessions s
    WHERE s.student_id = p_student_id
      AND s.session_date >= p_start_date
      AND s.session_date <= p_end_date
      AND (s.memorization_score IS NOT NULL
           OR s.tajweed_score IS NOT NULL
           OR s.recitation_quality IS NOT NULL)
    GROUP BY bucket
  ),
  class_scores AS (
    SELECT
      date_trunc(p_granularity, s.session_date)::DATE AS bucket,
      ROUND(AVG(s.memorization_score)::NUMERIC, 2) AS mem,
      ROUND(AVG(s.tajweed_score)::NUMERIC, 2) AS taj,
      ROUND(AVG(s.recitation_quality)::NUMERIC, 2) AS rec
    FROM sessions s
    INNER JOIN students st ON st.id = s.student_id
    WHERE st.class_id = p_class_id
      AND s.session_date >= p_start_date
      AND s.session_date <= p_end_date
      AND (s.memorization_score IS NOT NULL
           OR s.tajweed_score IS NOT NULL
           OR s.recitation_quality IS NOT NULL)
    GROUP BY bucket
  )
  SELECT
    COALESCE(c.bucket, cl.bucket) AS bucket_date,
    c.mem AS avg_memorization,
    c.taj AS avg_tajweed,
    c.rec AS avg_recitation,
    cl.mem AS class_avg_memorization,
    cl.taj AS class_avg_tajweed,
    cl.rec AS class_avg_recitation
  FROM child_scores c
  FULL OUTER JOIN class_scores cl ON c.bucket = cl.bucket
  ORDER BY bucket_date;
$$;
