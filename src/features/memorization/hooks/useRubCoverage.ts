import { useMemo } from 'react';
import { useRubReference } from '@/features/gamification/hooks/useRubReference';
import { useRubCertifications } from '@/features/gamification/hooks/useRubCertifications';
import { useMemorizationProgress } from './useMemorizationProgress';
import { computeRubCoverage, type RubCoverage } from '../utils/rub-coverage';

/**
 * Combines rub' reference data with memorization progress to compute
 * per-rub' coverage (how many ayahs in each rub' are memorized).
 *
 * Returns:
 * - `inProgress`: rub' with 0 < coverage < 100% (actively being built)
 * - `completed`: rub' with 100% coverage but NOT yet certified (ready for certification)
 * - `allCoverage`: full sparse coverage map
 */
export function useRubCoverage(studentId: string | undefined) {
  const {
    data: rubReference = [],
    isLoading: refLoading,
  } = useRubReference();

  const {
    data: progress = [],
    isLoading: progressLoading,
  } = useMemorizationProgress({ studentId: studentId ?? '' });

  const {
    certMap,
    isLoading: certLoading,
  } = useRubCertifications(studentId);

  const allCoverage = useMemo(
    () => computeRubCoverage(rubReference, progress),
    [rubReference, progress],
  );

  // In progress: has some memorized ayahs, not 100%, and not yet certified
  const inProgress = useMemo(
    () =>
      allCoverage.filter(
        (c) => c.percentage > 0 && c.percentage < 100 && !certMap.has(c.rubNumber),
      ),
    [allCoverage, certMap],
  );

  // Completed: 100% coverage but not yet certified by teacher
  const completed = useMemo(
    () =>
      allCoverage.filter(
        (c) => c.percentage === 100 && !certMap.has(c.rubNumber),
      ),
    [allCoverage, certMap],
  );

  // Stats
  const totalRubInProgress = inProgress.length;
  const totalRubCompleted = completed.length;

  return {
    allCoverage,
    inProgress,
    completed,
    totalRubInProgress,
    totalRubCompleted,
    isLoading: refLoading || progressLoading || certLoading,
  };
}
