import { useQuery } from '@tanstack/react-query';
import { revisionScheduleService } from '../services/revision-schedule.service';
import type { RevisionScheduleItem } from '../types/memorization.types';

export const useRevisionSchedule = (studentId: string | undefined, date?: string) => {
  return useQuery({
    queryKey: ['revision-schedule', studentId, date],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const { data, error } = await revisionScheduleService.getSchedule(studentId, date);
      if (error) throw error;
      return (data ?? []) as RevisionScheduleItem[];
    },
    enabled: !!studentId,
  });
};
