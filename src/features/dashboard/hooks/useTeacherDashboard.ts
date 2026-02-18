import { useQuery } from '@tanstack/react-query';
import { teacherDashboardService } from '../services/teacher-dashboard.service';

export const useTeacherDashboard = (teacherId: string | undefined) => {
  return useQuery({
    queryKey: ['teacher-dashboard', teacherId],
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID is required');
      return teacherDashboardService.getDashboard(teacherId);
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
