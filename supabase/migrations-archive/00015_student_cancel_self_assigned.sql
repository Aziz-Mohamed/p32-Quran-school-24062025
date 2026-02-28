-- ============================================================================
-- Migration 00015: Allow students to cancel their own self-assigned homework
-- ============================================================================
-- Students can self-assign revision homework (old_review assignments) via the
-- "Add to Revision Homework" action. This policy lets them reverse that action
-- by cancelling assignments they created themselves.
-- ============================================================================

CREATE POLICY "Student can cancel own self-assigned homework"
  ON memorization_assignments FOR UPDATE
  USING (
    school_id = get_user_school_id()
    AND student_id = auth.uid()
    AND assigned_by = auth.uid()
    AND get_user_role() = 'student'
  )
  WITH CHECK (
    status = 'cancelled'
  );
