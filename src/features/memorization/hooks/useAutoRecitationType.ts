import { useMemo } from 'react';
import { useMemorizationProgress } from './useMemorizationProgress';
import { classifyRangeType } from '../utils/spaced-repetition';
import type { RecitationType } from '@/types/common.types';

interface UseAutoRecitationTypeParams {
  studentId: string | undefined;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  /** If a plan already provides a type (has assignment_id), skip auto-detection */
  planType?: RecitationType | null;
}

export function useAutoRecitationType({
  studentId,
  surahNumber,
  fromAyah,
  toAyah,
  planType,
}: UseAutoRecitationTypeParams) {
  const shouldAutoDetect = !planType && !!studentId && surahNumber >= 1;

  const { data: progress = [], isLoading } = useMemorizationProgress({
    studentId: studentId ?? '',
    surahNumber: shouldAutoDetect ? surahNumber : undefined,
  });

  const recitationType = useMemo<RecitationType>(() => {
    if (planType) return planType;
    if (!shouldAutoDetect || isLoading) return 'new_hifz';
    return classifyRangeType(progress, fromAyah, toAyah);
  }, [planType, shouldAutoDetect, isLoading, progress, fromAyah, toAyah]);

  return {
    recitationType,
    isLoading: shouldAutoDetect ? isLoading : false,
  };
}
