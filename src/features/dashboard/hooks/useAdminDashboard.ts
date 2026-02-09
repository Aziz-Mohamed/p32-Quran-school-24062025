import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '../services/admin-dashboard.service';

/**
 * Hook for fetching admin dashboard data.
 * Uses the school ID to scope all queries.
 */
export function useAdminDashboard(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['admin-dashboard', schoolId],
    queryFn: () => adminDashboardService.getDashboard(schoolId!),
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
