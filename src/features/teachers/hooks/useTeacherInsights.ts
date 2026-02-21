import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook to fetch top performing students in a teacher's classes.
 * Ranked by current_level descending.
 */
export function useTopPerformers(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['top-performers', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(
          '*, profiles!students_id_fkey!inner(full_name, avatar_url), classes!inner(name, teacher_id)',
        )
        .eq('classes.teacher_id', teacherId!)
        .eq('is_active', true)
        .order('current_level', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId,
  });
}

/**
 * Hook to fetch students in a teacher's classes who may need support.
 * Returns students with lowest current_level or zero streak.
 */
export function useNeedsSupport(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['needs-support', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(
          '*, profiles!students_id_fkey!inner(full_name, avatar_url), classes!inner(name, teacher_id)',
        )
        .eq('classes.teacher_id', teacherId!)
        .eq('is_active', true)
        .order('current_level', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId,
  });
}
