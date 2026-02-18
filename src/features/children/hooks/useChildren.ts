import { useQuery } from '@tanstack/react-query';
import { childrenService } from '../services/children.service';

/**
 * Hook for fetching a parent's children.
 */
export function useChildren(parentId: string | undefined) {
  return useQuery({
    queryKey: ['children', parentId],
    queryFn: async () => {
      const { data, error } = await childrenService.getChildren(parentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!parentId,
  });
}

/**
 * Hook for fetching detailed child info.
 */
export function useChildDetail(studentId: string | undefined) {
  return useQuery({
    queryKey: ['child-detail', studentId],
    queryFn: async () => {
      const result = await childrenService.getChildDetail(studentId!);
      if (result.studentError) throw result.studentError;
      return result;
    },
    enabled: !!studentId,
  });
}

/**
 * Hook for fetching anonymous class standing.
 */
export function useClassStanding(studentId: string | undefined, classId: string | undefined) {
  return useQuery({
    queryKey: ['class-standing', studentId, classId],
    queryFn: async () => {
      const { data, error } = await childrenService.getClassStanding(studentId!, classId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId && !!classId,
  });
}
