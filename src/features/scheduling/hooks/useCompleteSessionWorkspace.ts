import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/features/attendance/services/attendance.service';
import { sessionsService } from '@/features/sessions/services/sessions.service';
import { scheduledSessionService } from '../services/scheduled-session.service';
import type { BulkAttendanceInput } from '@/features/attendance/types/attendance.types';

interface EvalData {
  memorization_score: number | null;
  tajweed_score: number | null;
  recitation_quality: number | null;
  notes: string;
  homework_assigned: string;
  homework_due_date: string | null;
}

interface CompleteSessionInput {
  scheduledSessionId: string;
  classId: string;
  teacherId: string;
  sessionDate: string;
  attendance: BulkAttendanceInput | null;
  evaluations: Record<string, EvalData>;
  schoolId: string;
}

/**
 * Composite mutation that orchestrates completing a scheduled session:
 * 1. Marks bulk attendance (with scheduled_session_id)
 * 2. Creates evaluation sessions for students with scores
 * 3. Links the first evaluation to the scheduled session
 * 4. Updates scheduled session status to 'completed'
 */
export function useCompleteSessionWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CompleteSessionInput) => {
      // 1. Mark attendance (class sessions only — attendance table requires class_id)
      if (input.attendance) {
        const { error: attendanceError } = await attendanceService.markBulkAttendance(
          input.attendance,
          input.schoolId,
          input.teacherId,
        );
        if (attendanceError) throw attendanceError;
      }

      // 2. Create evaluation sessions for students who have scores
      let firstEvalId: string | null = null;

      for (const [studentId, evalData] of Object.entries(input.evaluations)) {
        const hasScores =
          evalData.memorization_score != null ||
          evalData.tajweed_score != null ||
          evalData.recitation_quality != null;
        const hasContent = hasScores || evalData.notes.trim().length > 0;

        if (!hasContent) continue;

        const { data: session, error: sessionError } = await sessionsService.createSession({
          student_id: studentId,
          teacher_id: input.teacherId,
          class_id: input.classId || null,
          session_date: input.sessionDate,
          memorization_score: evalData.memorization_score,
          tajweed_score: evalData.tajweed_score,
          recitation_quality: evalData.recitation_quality,
          notes: evalData.notes.trim() || null,
          homework_assigned: evalData.homework_assigned.trim() || null,
          homework_due_date: evalData.homework_due_date,
        });

        if (sessionError) throw sessionError;

        if (!firstEvalId && session?.id) {
          firstEvalId = session.id;
        }
      }

      // 3. Link first evaluation to the scheduled session (if any)
      if (firstEvalId) {
        const { error: linkError } = await scheduledSessionService.linkEvaluation(
          input.scheduledSessionId,
          firstEvalId,
        );
        if (linkError) throw linkError;
      }

      // 4. Update status to completed
      const { error: statusError } = await scheduledSessionService.updateStatus(
        input.scheduledSessionId,
        'completed',
      );
      if (statusError) throw statusError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-session'] });
    },
  });
}
