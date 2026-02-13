import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinService } from '../services/checkin.service';
import { mutationTracker } from '@/features/realtime';

/**
 * Hook for fetching today's check-in for a teacher.
 */
export function useTodayCheckin(teacherId: string | undefined) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['teacher-checkin', teacherId, today],
    queryFn: async () => {
      const { data, error } = await checkinService.getTodayCheckin(teacherId!);
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

/**
 * Mutation hook for checking in.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherId, schoolId }: { teacherId: string; schoolId: string }) =>
      checkinService.checkIn(teacherId, schoolId),
    onSuccess: (data) => {
      if (data?.data?.id) {
        mutationTracker.record('teacher_checkins', data.data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });
}

/**
 * Mutation hook for checking out.
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinId: string) => checkinService.checkOut(checkinId),
    onSuccess: (data, checkinId) => {
      mutationTracker.record('teacher_checkins', checkinId);
      queryClient.invalidateQueries({ queryKey: ['teacher-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });
}
