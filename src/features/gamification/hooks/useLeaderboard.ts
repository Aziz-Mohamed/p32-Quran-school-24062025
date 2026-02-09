import { useQuery } from '@tanstack/react-query';
import { gamificationService } from '../services/gamification.service';

export const useLeaderboard = (
  classId: string | undefined,
  period: 'weekly' | 'all-time' = 'all-time',
) => {
  return useQuery({
    queryKey: ['leaderboard', classId, period],
    queryFn: async () => {
      if (!classId) throw new Error('Class ID is required');
      const { data, error } = await gamificationService.getLeaderboard(classId, period);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!classId,
  });
};
