import type { Tables } from '@/types/database.types';
import { SURAHS } from '@/lib/quran-metadata';

type RubReference = Tables<'quran_rub_reference'>;

export interface RubCoverage {
  rubNumber: number;
  juzNumber: number;
  totalAyahs: number;
  memorizedAyahs: number;
  percentage: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

interface MemorizationRange {
  surah_number: number;
  from_ayah: number;
  to_ayah: number;
  status: string;
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
 * Returns only rub' with > 0 memorized ayahs (sparse result).
 */
export function computeRubCoverage(
  rubData: RubReference[],
  progress: MemorizationRange[],
): RubCoverage[] {
  if (rubData.length === 0) return [];

  // Filter to only memorized ranges
  const memorized = progress.filter((p) => p.status === 'memorized');
  if (memorized.length === 0) return [];

  // Convert memorized ranges to flat index intervals
  const memorizedIntervals = memorized.map((p) => ({
    start: toFlatIndex(p.surah_number, p.from_ayah),
    end: toFlatIndex(p.surah_number, p.to_ayah),
  }));

  const result: RubCoverage[] = [];

  for (const rub of rubData) {
    const end = getRubEnd(rubData, rub.rub_number);
    const rubStart = toFlatIndex(rub.start_surah, rub.start_ayah);
    const rubEnd = toFlatIndex(end.endSurah, end.endAyah);
    const totalAyahs = rubEnd - rubStart + 1;

    // Count overlapping ayahs
    let memorizedAyahs = 0;
    for (const interval of memorizedIntervals) {
      const overlapStart = Math.max(rubStart, interval.start);
      const overlapEnd = Math.min(rubEnd, interval.end);
      if (overlapStart <= overlapEnd) {
        memorizedAyahs += overlapEnd - overlapStart + 1;
      }
    }

    if (memorizedAyahs > 0) {
      result.push({
        rubNumber: rub.rub_number,
        juzNumber: rub.juz_number,
        totalAyahs,
        memorizedAyahs: Math.min(memorizedAyahs, totalAyahs),
        percentage: Math.round((Math.min(memorizedAyahs, totalAyahs) / totalAyahs) * 100),
        startSurah: rub.start_surah,
        startAyah: rub.start_ayah,
        endSurah: end.endSurah,
        endAyah: end.endAyah,
      });
    }
  }

  return result;
}
