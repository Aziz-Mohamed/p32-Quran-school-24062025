-- ============================================================================
-- Period Comparison RPC Function
-- Returns current vs previous period metrics in a single query.
-- Used by insight-first reports to compute trend arrows and pulse messages.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_period_comparison(
  p_school_id UUID,
  p_current_start DATE,
  p_current_end DATE,
  p_previous_start DATE,
  p_previous_end DATE,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  current_attendance_rate NUMERIC,
  previous_attendance_rate NUMERIC,
  current_avg_memorization NUMERIC,
  current_avg_tajweed NUMERIC,
  current_avg_recitation NUMERIC,
  previous_avg_memorization NUMERIC,
  previous_avg_tajweed NUMERIC,
  previous_avg_recitation NUMERIC,
  current_stickers BIGINT,
  previous_stickers BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH current_attendance AS (
    SELECT
      ROUND(
        (COUNT(*) FILTER (WHERE status = 'present') + COUNT(*) FILTER (WHERE status = 'late'))::NUMERIC
        / NULLIF(
            (COUNT(*) FILTER (WHERE status = 'present')
             + COUNT(*) FILTER (WHERE status = 'absent')
             + COUNT(*) FILTER (WHERE status = 'late')),
            0
          )
        * 100,
        1
      ) AS rate
    FROM attendance
    WHERE school_id = p_school_id
      AND date >= p_current_start
      AND date <= p_current_end
      AND (p_class_id IS NULL OR class_id = p_class_id)
  ),
  previous_attendance AS (
    SELECT
      ROUND(
        (COUNT(*) FILTER (WHERE status = 'present') + COUNT(*) FILTER (WHERE status = 'late'))::NUMERIC
        / NULLIF(
            (COUNT(*) FILTER (WHERE status = 'present')
             + COUNT(*) FILTER (WHERE status = 'absent')
             + COUNT(*) FILTER (WHERE status = 'late')),
            0
          )
        * 100,
        1
      ) AS rate
    FROM attendance
    WHERE school_id = p_school_id
      AND date >= p_previous_start
      AND date <= p_previous_end
      AND (p_class_id IS NULL OR class_id = p_class_id)
  ),
  current_scores AS (
    SELECT
      ROUND(AVG(memorization_score)::NUMERIC, 1) AS avg_mem,
      ROUND(AVG(tajweed_score)::NUMERIC, 1) AS avg_taj,
      ROUND(AVG(recitation_quality)::NUMERIC, 1) AS avg_rec
    FROM sessions
    WHERE school_id = p_school_id
      AND session_date >= p_current_start
      AND session_date <= p_current_end
      AND (p_class_id IS NULL OR class_id = p_class_id)
  ),
  previous_scores AS (
    SELECT
      ROUND(AVG(memorization_score)::NUMERIC, 1) AS avg_mem,
      ROUND(AVG(tajweed_score)::NUMERIC, 1) AS avg_taj,
      ROUND(AVG(recitation_quality)::NUMERIC, 1) AS avg_rec
    FROM sessions
    WHERE school_id = p_school_id
      AND session_date >= p_previous_start
      AND session_date <= p_previous_end
      AND (p_class_id IS NULL OR class_id = p_class_id)
  ),
  current_stickers_cte AS (
    SELECT COUNT(*) AS cnt
    FROM student_stickers ss
    JOIN students s ON ss.student_id = s.id
    WHERE s.school_id = p_school_id
      AND ss.awarded_at >= p_current_start::TIMESTAMP
      AND ss.awarded_at < (p_current_end + 1)::TIMESTAMP
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
  ),
  previous_stickers_cte AS (
    SELECT COUNT(*) AS cnt
    FROM student_stickers ss
    JOIN students s ON ss.student_id = s.id
    WHERE s.school_id = p_school_id
      AND ss.awarded_at >= p_previous_start::TIMESTAMP
      AND ss.awarded_at < (p_previous_end + 1)::TIMESTAMP
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
  )
  SELECT
    COALESCE(ca.rate, 0) AS current_attendance_rate,
    COALESCE(pa.rate, 0) AS previous_attendance_rate,
    COALESCE(cs.avg_mem, 0) AS current_avg_memorization,
    COALESCE(cs.avg_taj, 0) AS current_avg_tajweed,
    COALESCE(cs.avg_rec, 0) AS current_avg_recitation,
    COALESCE(ps.avg_mem, 0) AS previous_avg_memorization,
    COALESCE(ps.avg_taj, 0) AS previous_avg_tajweed,
    COALESCE(ps.avg_rec, 0) AS previous_avg_recitation,
    COALESCE(cst.cnt, 0) AS current_stickers,
    COALESCE(pst.cnt, 0) AS previous_stickers
  FROM current_attendance ca
  CROSS JOIN previous_attendance pa
  CROSS JOIN current_scores cs
  CROSS JOIN previous_scores ps
  CROSS JOIN current_stickers_cte cst
  CROSS JOIN previous_stickers_cte pst;
$$;
