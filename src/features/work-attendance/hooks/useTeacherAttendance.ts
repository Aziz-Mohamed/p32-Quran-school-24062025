import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutationTracker } from '@/features/realtime';
import { workAttendanceService } from '../services/work-attendance.service';

/**
 * Admin: get all teacher check-ins for today (or a specific date).
 */
export function useSchoolAttendanceToday(schoolId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ['teacher-attendance-today', schoolId, date],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getSchoolAttendance({
        schoolId: schoolId!,
        date,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!schoolId,
  });
}

/**
 * Admin: get all teachers in the school.
 */
export function useSchoolTeachers(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['school-teachers', schoolId],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getSchoolTeachers(schoolId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!schoolId,
  });
}

/**
 * Admin: get pending override requests.
 */
export function usePendingOverrides(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['override-requests', schoolId],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getPendingOverrides(schoolId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!schoolId,
  });
}

/**
 * Admin: approve a manual override.
 */
export function useApproveOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checkinId, adminId }: { checkinId: string; adminId: string }) => {
      const { data, error } = await workAttendanceService.approveOverride(checkinId, adminId);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        mutationTracker.record('teacher_checkins', data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['override-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
    },
  });
}

/**
 * Admin: reject a manual override (deletes the check-in).
 */
export function useRejectOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkinId: string) => {
      const { error } = await workAttendanceService.rejectOverride(checkinId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['override-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
    },
  });
}

/**
 * Get teacher attendance history for a date range.
 */
export function useTeacherHistory(
  teacherId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['teacher-history', teacherId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await workAttendanceService.getTeacherHistory(
        teacherId!,
        startDate,
        endDate,
      );
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId,
  });
}
