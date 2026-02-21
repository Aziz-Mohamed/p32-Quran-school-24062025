-- Fix: get_student_revision_schedule was only querying memorization_assignments for 'new_hifz'.
-- Self-assigned revision items (assignment_type = 'old_review' or 'recent_review') were invisible.
-- Add a 4th UNION to include pending review assignments.

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

  -- Review assignments (self-assigned from "Add to Plan" or teacher-assigned reviews)
  SELECT
    NULL::UUID AS progress_id,
    ma.surah_number,
    ma.from_ayah,
    ma.to_ayah,
    'assigned'::TEXT AS status,
    ma.assignment_type::TEXT AS review_type,
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
    AND ma.assignment_type IN ('old_review', 'recent_review')
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
