import { useQuery } from '@tanstack/react-query';
import { parentDashboardService } from '../services/parent-dashboard.service';
import type { ParentDashboardData } from '../types/dashboard.types';

/**
 * Hook for fetching parent dashboard data.
 */
export function useParentDashboard(parentId: string | undefined) {
  return useQuery<ParentDashboardData | null>({
    queryKey: ['parent-dashboard', parentId],
    queryFn: async () => {
      const { data, error } = await parentDashboardService.getDashboard(parentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!parentId,
    staleTime: 2 * 60 * 1000,
  });
}
