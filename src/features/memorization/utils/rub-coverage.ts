import type { Tables } from '@/types/database.types';
import { SURAHS } from '@/lib/quran-metadata';

type RubReference = Tables<'quran_rub_reference'>;

export interface RubCoverage {
  rubNumber: number;
  juzNumber: number;
  totalAyahs: number;
  memorizedAyahs: number;
  percentage: number;
  uncertifiedAyahs: number;
  uncertifiedPercentage: number;
  totalPercentage: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  pendingAssignmentIds: string[];
}

interface MemorizationRange {
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  status: string;
}

export interface AyahRange {
  id: string;
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
}

// ─── Rub' End Boundary ───────────────────────────────────────────────────────

function getLastAyah(surahNumber: number): number {
  return SURAHS[surahNumber - 1]?.ayahCount ?? 1;
}

function getRubEnd(
  rubData: RubReference[],
  rubNumber: number,
): { endSurah: number; endAyah: number } {
  const nextRub = rubData.find((r) => r.rub_number === rubNumber + 1);

  if (nextRub) {
    if (nextRub.start_ayah === 1) {
      return {
        endSurah: nextRub.start_surah - 1,
        endAyah: getLastAyah(nextRub.start_surah - 1),
      };
    }
    return {
      endSurah: nextRub.start_surah,
      endAyah: nextRub.start_ayah - 1,
    };
  }

  // Last rub' of Quran
  return { endSurah: 114, endAyah: 6 };
}

// ─── Ayah Position Helpers ───────────────────────────────────────────────────
// Convert surah:ayah to a flat index for efficient overlap computation.

function toFlatIndex(surah: number, ayah: number): number {
  let index = 0;
  for (let s = 1; s < surah; s++) {
    index += SURAHS[s - 1]?.ayahCount ?? 0;
  }
  return index + ayah;
}

// ─── Core Coverage Computation ───────────────────────────────────────────────

/**
 * Compute how many ayahs within each rub' a student has memorized.
 * Returns only rub' with > 0 memorized or uncertified ayahs (sparse result).
 *
 * @param pendingAssignments — optional self-assigned new_hifz ranges (uncertified).
 *   These are de-duplicated against certified memorized ayahs so no double-counting.
 */
export function computeRubCoverage(
  rubData: RubReference[],
  progress: MemorizationRange[],
  pendingAssignments?: AyahRange[],
): RubCoverage[] {
  if (rubData.length === 0) return [];

  // Filter to only memorized ranges (certified by teacher)
  const memorized = progress.filter((p) => p.status === 'memorized');
  const hasMemoized = memorized.length > 0;
  const hasPending = (pendingAssignments?.length ?? 0) > 0;

  if (!hasMemoized && !hasPending) return [];

  // Convert memorized ranges to flat index intervals
  const memorizedIntervals = memorized.map((p) => ({
    start: toFlatIndex(p.surah_number, p.from_ayah),
    end: toFlatIndex(p.surah_number, p.to_ayah),
  }));

  // Convert pending assignments to flat index intervals (with ID for tracking)
  const pendingIntervals = (pendingAssignments ?? []).map((a) => ({
    id: a.id,
    start: toFlatIndex(a.surah_number, a.from_ayah),
    end: toFlatIndex(a.surah_number, a.to_ayah),
  }));

  const result: RubCoverage[] = [];

  for (const rub of rubData) {
    const end = getRubEnd(rubData, rub.rub_number);
    const rubStart = toFlatIndex(rub.start_surah, rub.start_ayah);
    const rubEnd = toFlatIndex(end.endSurah, end.endAyah);
    const totalAyahs = rubEnd - rubStart + 1;

    // Count certified (memorized) ayahs overlapping this rub'
    let memorizedAyahs = 0;
    const certifiedSet = new Set<number>();

    for (const interval of memorizedIntervals) {
      const overlapStart = Math.max(rubStart, interval.start);
      const overlapEnd = Math.min(rubEnd, interval.end);
      if (overlapStart <= overlapEnd) {
        for (let i = overlapStart; i <= overlapEnd; i++) {
          certifiedSet.add(i);
        }
      }
    }
    memorizedAyahs = certifiedSet.size;

    // Count uncertified ayahs (from pending assignments) excluding already-certified
    let uncertifiedAyahs = 0;
    const overlappingIds = new Set<string>();
    for (const interval of pendingIntervals) {
      const overlapStart = Math.max(rubStart, interval.start);
      const overlapEnd = Math.min(rubEnd, interval.end);
      if (overlapStart <= overlapEnd) {
        overlappingIds.add(interval.id);
        for (let i = overlapStart; i <= overlapEnd; i++) {
          if (!certifiedSet.has(i)) {
            uncertifiedAyahs++;
            certifiedSet.add(i); // prevent double-counting across assignments
          }
        }
      }
    }

    if (memorizedAyahs > 0 || uncertifiedAyahs > 0) {
      const clampedMem = Math.min(memorizedAyahs, totalAyahs);
      const clampedUncert = Math.min(uncertifiedAyahs, totalAyahs - clampedMem);
      const combinedPct = Math.min(
        100,
        Math.round(((clampedMem + clampedUncert) / totalAyahs) * 100),
      );

      result.push({
        rubNumber: rub.rub_number,
        juzNumber: rub.juz_number,
        totalAyahs,
        memorizedAyahs: clampedMem,
        percentage: Math.round((clampedMem / totalAyahs) * 100),
        uncertifiedAyahs: clampedUncert,
        uncertifiedPercentage: Math.round((clampedUncert / totalAyahs) * 100),
        totalPercentage: combinedPct,
        startSurah: rub.start_surah,
        startAyah: rub.start_ayah,
        endSurah: end.endSurah,
        endAyah: end.endAyah,
        pendingAssignmentIds: [...overlappingIds],
      });
    }
  }

  return result;
}
