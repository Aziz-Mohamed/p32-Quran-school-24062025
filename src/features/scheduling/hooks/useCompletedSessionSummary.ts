import { useQuery } from '@tanstack/react-query';
import { scheduledSessionService } from '../services/scheduled-session.service';
import type { AttendanceStatus, RecitationType } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttendanceSummaryRecord {
  id: string;
  student_id: string;
  status: AttendanceStatus;
  notes: string | null;
  students: {
    id: string;
    profiles: {
      full_name: string;
      name_localized: Record<string, string> | null;
      avatar_url: string | null;
    };
  };
}

export interface RecitationRecord {
  id: string;
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  recitation_type: RecitationType;
  accuracy_score: number | null;
  tajweed_score: number | null;
  fluency_score: number | null;
  needs_repeat: boolean;
  mistake_notes: string | null;
  created_at: string;
}

export interface EvaluationWithRecitations {
  id: string;
  student_id: string;
  memorization_score: number | null;
  tajweed_score: number | null;
  recitation_quality: number | null;
  notes: string | null;
  student: {
    id: string;
    profiles: {
      full_name: string;
      name_localized: Record<string, string> | null;
      avatar_url: string | null;
    };
  };
  recitations: RecitationRecord[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCompletedSessionSummary(
  scheduledSessionId: string | undefined,
  isCompleted: boolean,
) {
  return useQuery({
    queryKey: ['completed-session-summary', scheduledSessionId],
    queryFn: async () => {
      if (!scheduledSessionId) throw new Error('Session ID required');
      const result = await scheduledSessionService.getCompletedSessionSummary(scheduledSessionId);
      if (result.attendance.error) throw result.attendance.error;
      if (result.evaluations.error) throw result.evaluations.error;
      return {
        attendance: (result.attendance.data ?? []) as AttendanceSummaryRecord[],
        evaluations: (result.evaluations.data ?? []) as EvaluationWithRecitations[],
      };
    },
    enabled: !!scheduledSessionId && isCompleted,
  });
}
