import { useQuery } from '@tanstack/react-query';
import { memorizationProgressService } from '../services/memorization-progress.service';
import type { MemorizationStats } from '../types/memorization.types';

export const useMemorizationStats = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['memorization-stats', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await memorizationProgressService.getStats(studentId);
      if (error) throw error;
      // RPC returns an array, take first row
      const stats = Array.isArray(data) ? data[0] : data;
      return (stats ?? null) as MemorizationStats | null;
    },
    enabled: !!studentId,
  });
};
