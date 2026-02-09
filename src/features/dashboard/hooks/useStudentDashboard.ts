import { useQuery } from '@tanstack/react-query';
import { studentDashboardService } from '../services/student-dashboard.service';

export const useStudentDashboard = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-dashboard', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      return studentDashboardService.getDashboard(studentId);
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
