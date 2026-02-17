import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memorizationProgressService } from '../services/memorization-progress.service';
import type { ProgressFilters } from '../types/memorization.types';
import type { TablesUpdate } from '@/types/database.types';

export const useMemorizationProgress = (filters: ProgressFilters) => {
  return useQuery({
    queryKey: ['memorization-progress', filters],
    queryFn: async () => {
      const { data, error } = await memorizationProgressService.getProgress(filters);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!filters.studentId,
  });
};

export const useUpsertProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['upsert-progress'],
    mutationFn: (input: {
      studentId: string;
      surahNumber: number;
      fromAyah: number;
      toAyah: number;
      schoolId: string;
      updates: Partial<TablesUpdate<'memorization_progress'>>;
    }) =>
      memorizationProgressService.upsertProgress(
        input.studentId,
        input.surahNumber,
        input.fromAyah,
        input.toAyah,
        input.schoolId,
        input.updates,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorization-progress'] });
      queryClient.invalidateQueries({ queryKey: ['memorization-stats'] });
      queryClient.invalidateQueries({ queryKey: ['revision-schedule'] });
    },
  });
};
