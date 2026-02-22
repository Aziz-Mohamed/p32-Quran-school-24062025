import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

type RubReference = Tables<'quran_rub_reference'>;

/**
 * Fetch all 240 rub' reference rows. Static data — cached indefinitely.
 */
export function useAllRubReferences() {
  return useQuery({
    queryKey: ['quran-rub-reference'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quran_rub_reference')
        .select('*')
        .order('rub_number', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Resolve a juz number (1-30) to its start/end ayah range.
 * Each juz = 8 rub' (rub 1-8 = juz 1, rub 9-16 = juz 2, etc.)
 */
export function resolveJuzRange(rubData: RubReference[], juzNumber: number) {
  const startRub = (juzNumber - 1) * 8 + 1;
  const endRub = juzNumber * 8;

  const startEntry = rubData.find((r) => r.rub_number === startRub);
  const endEntry = rubData.find((r) => r.rub_number === endRub);

  if (!startEntry || !endEntry) return null;

  // End of this juz = one ayah before the next rub' starts (or end of Quran)
  const nextRub = rubData.find((r) => r.rub_number === endRub + 1);

  let endSurah: number;
  let endAyah: number;

  if (nextRub) {
    // End at the ayah before the next rub' starts
    if (nextRub.start_ayah === 1) {
      // Next rub starts at beginning of a surah — end at last ayah of previous surah
      endSurah = nextRub.start_surah - 1;
      endAyah = getLastAyah(endSurah);
    } else {
      endSurah = nextRub.start_surah;
      endAyah = nextRub.start_ayah - 1;
    }
  } else {
    // Last juz — ends at end of Quran (114:6)
    endSurah = 114;
    endAyah = 6;
  }

  return {
    start_surah: startEntry.start_surah,
    start_ayah: startEntry.start_ayah,
    end_surah: endSurah,
    end_ayah: endAyah,
  };
}

/**
 * Resolve a hizb number (1-60) to its start/end ayah range.
 * Each hizb = 4 rub' (rub 1-4 = hizb 1, rub 5-8 = hizb 2, etc.)
 */
export function resolveHizbRange(rubData: RubReference[], hizbNumber: number) {
  const startRub = (hizbNumber - 1) * 4 + 1;
  const endRub = hizbNumber * 4;

  const startEntry = rubData.find((r) => r.rub_number === startRub);
  const endEntry = rubData.find((r) => r.rub_number === endRub);

  if (!startEntry || !endEntry) return null;

  const nextRub = rubData.find((r) => r.rub_number === endRub + 1);

  let endSurah: number;
  let endAyah: number;

  if (nextRub) {
    if (nextRub.start_ayah === 1) {
      endSurah = nextRub.start_surah - 1;
      endAyah = getLastAyah(endSurah);
    } else {
      endSurah = nextRub.start_surah;
      endAyah = nextRub.start_ayah - 1;
    }
  } else {
    endSurah = 114;
    endAyah = 6;
  }

  return {
    start_surah: startEntry.start_surah,
    start_ayah: startEntry.start_ayah,
    end_surah: endSurah,
    end_ayah: endAyah,
  };
}

/**
 * Resolve a rub' number (1-240) to its start/end ayah range.
 */
export function resolveRubRange(rubData: RubReference[], rubNumber: number) {
  const entry = rubData.find((r) => r.rub_number === rubNumber);
  if (!entry) return null;

  const nextRub = rubData.find((r) => r.rub_number === rubNumber + 1);

  let endSurah: number;
  let endAyah: number;

  if (nextRub) {
    if (nextRub.start_ayah === 1) {
      endSurah = nextRub.start_surah - 1;
      endAyah = getLastAyah(endSurah);
    } else {
      endSurah = nextRub.start_surah;
      endAyah = nextRub.start_ayah - 1;
    }
  } else {
    endSurah = 114;
    endAyah = 6;
  }

  return {
    start_surah: entry.start_surah,
    start_ayah: entry.start_ayah,
    end_surah: endSurah,
    end_ayah: endAyah,
  };
}

// Surah ayah counts (index 0 = surah 1)
const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function getLastAyah(surahNumber: number): number {
  return SURAH_AYAH_COUNTS[surahNumber - 1] ?? 1;
}
