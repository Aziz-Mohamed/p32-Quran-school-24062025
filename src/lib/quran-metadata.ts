// ─── Quran Reference Data ────────────────────────────────────────────────────
//
// Static metadata for all 114 surahs of the Quran.
// This data never changes and is used for verse range selection,
// progress tracking, and display throughout the memorization feature.
// ─────────────────────────────────────────────────────────────────────────────

export interface SurahInfo {
  readonly number: number;
  readonly nameArabic: string;
  readonly nameEnglish: string;
  readonly ayahCount: number;
  readonly juzStart: number;
  readonly revelationType: 'meccan' | 'medinan';
}

export const SURAHS: readonly SurahInfo[] = [
  { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', ayahCount: 7, juzStart: 1, revelationType: 'meccan' },
  { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', ayahCount: 286, juzStart: 1, revelationType: 'medinan' },
  { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Ali Imran', ayahCount: 200, juzStart: 3, revelationType: 'medinan' },
  { number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', ayahCount: 176, juzStart: 4, revelationType: 'medinan' },
  { number: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Ma\'idah', ayahCount: 120, juzStart: 6, revelationType: 'medinan' },
  { number: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-An\'am', ayahCount: 165, juzStart: 7, revelationType: 'meccan' },
  { number: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-A\'raf', ayahCount: 206, juzStart: 8, revelationType: 'meccan' },
  { number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', ayahCount: 75, juzStart: 9, revelationType: 'medinan' },
  { number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', ayahCount: 129, juzStart: 10, revelationType: 'medinan' },
  { number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', ayahCount: 109, juzStart: 11, revelationType: 'meccan' },
  { number: 11, nameArabic: 'هود', nameEnglish: 'Hud', ayahCount: 123, juzStart: 11, revelationType: 'meccan' },
  { number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', ayahCount: 111, juzStart: 12, revelationType: 'meccan' },
  { number: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Ra\'d', ayahCount: 43, juzStart: 13, revelationType: 'medinan' },
  { number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', ayahCount: 52, juzStart: 13, revelationType: 'meccan' },
  { number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', ayahCount: 99, juzStart: 14, revelationType: 'meccan' },
  { number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', ayahCount: 128, juzStart: 14, revelationType: 'meccan' },
  { number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', ayahCount: 111, juzStart: 15, revelationType: 'meccan' },
  { number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', ayahCount: 110, juzStart: 15, revelationType: 'meccan' },
  { number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', ayahCount: 98, juzStart: 16, revelationType: 'meccan' },
  { number: 20, nameArabic: 'طه', nameEnglish: 'Ta-Ha', ayahCount: 135, juzStart: 16, revelationType: 'meccan' },
  { number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', ayahCount: 112, juzStart: 17, revelationType: 'meccan' },
  { number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', ayahCount: 78, juzStart: 17, revelationType: 'medinan' },
  { number: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Mu\'minun', ayahCount: 118, juzStart: 18, revelationType: 'meccan' },
  { number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', ayahCount: 64, juzStart: 18, revelationType: 'medinan' },
  { number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', ayahCount: 77, juzStart: 18, revelationType: 'meccan' },
  { number: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shu\'ara', ayahCount: 227, juzStart: 19, revelationType: 'meccan' },
  { number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', ayahCount: 93, juzStart: 19, revelationType: 'meccan' },
  { number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', ayahCount: 88, juzStart: 20, revelationType: 'meccan' },
  { number: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-Ankabut', ayahCount: 69, juzStart: 20, revelationType: 'meccan' },
  { number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', ayahCount: 60, juzStart: 21, revelationType: 'meccan' },
  { number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', ayahCount: 34, juzStart: 21, revelationType: 'meccan' },
  { number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', ayahCount: 30, juzStart: 21, revelationType: 'meccan' },
  { number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', ayahCount: 73, juzStart: 21, revelationType: 'medinan' },
  { number: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', ayahCount: 54, juzStart: 22, revelationType: 'meccan' },
  { number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', ayahCount: 45, juzStart: 22, revelationType: 'meccan' },
  { number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', ayahCount: 83, juzStart: 22, revelationType: 'meccan' },
  { number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', ayahCount: 182, juzStart: 23, revelationType: 'meccan' },
  { number: 38, nameArabic: 'ص', nameEnglish: 'Sad', ayahCount: 88, juzStart: 23, revelationType: 'meccan' },
  { number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', ayahCount: 75, juzStart: 23, revelationType: 'meccan' },
  { number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', ayahCount: 85, juzStart: 24, revelationType: 'meccan' },
  { number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', ayahCount: 54, juzStart: 24, revelationType: 'meccan' },
  { number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', ayahCount: 53, juzStart: 25, revelationType: 'meccan' },
  { number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', ayahCount: 89, juzStart: 25, revelationType: 'meccan' },
  { number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', ayahCount: 59, juzStart: 25, revelationType: 'meccan' },
  { number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', ayahCount: 37, juzStart: 25, revelationType: 'meccan' },
  { number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', ayahCount: 35, juzStart: 26, revelationType: 'meccan' },
  { number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', ayahCount: 38, juzStart: 26, revelationType: 'medinan' },
  { number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', ayahCount: 29, juzStart: 26, revelationType: 'medinan' },
  { number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', ayahCount: 18, juzStart: 26, revelationType: 'medinan' },
  { number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', ayahCount: 45, juzStart: 26, revelationType: 'meccan' },
  { number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', ayahCount: 60, juzStart: 26, revelationType: 'meccan' },
  { number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', ayahCount: 49, juzStart: 27, revelationType: 'meccan' },
  { number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', ayahCount: 62, juzStart: 27, revelationType: 'meccan' },
  { number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', ayahCount: 55, juzStart: 27, revelationType: 'meccan' },
  { number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', ayahCount: 78, juzStart: 27, revelationType: 'medinan' },
  { number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqi\'ah', ayahCount: 96, juzStart: 27, revelationType: 'meccan' },
  { number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', ayahCount: 29, juzStart: 27, revelationType: 'medinan' },
  { number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadilah', ayahCount: 22, juzStart: 28, revelationType: 'medinan' },
  { number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', ayahCount: 24, juzStart: 28, revelationType: 'medinan' },
  { number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', ayahCount: 13, juzStart: 28, revelationType: 'medinan' },
  { number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saff', ayahCount: 14, juzStart: 28, revelationType: 'medinan' },
  { number: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumu\'ah', ayahCount: 11, juzStart: 28, revelationType: 'medinan' },
  { number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', ayahCount: 11, juzStart: 28, revelationType: 'medinan' },
  { number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', ayahCount: 18, juzStart: 28, revelationType: 'medinan' },
  { number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', ayahCount: 12, juzStart: 28, revelationType: 'medinan' },
  { number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', ayahCount: 12, juzStart: 28, revelationType: 'medinan' },
  { number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', ayahCount: 30, juzStart: 29, revelationType: 'meccan' },
  { number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', ayahCount: 52, juzStart: 29, revelationType: 'meccan' },
  { number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', ayahCount: 52, juzStart: 29, revelationType: 'meccan' },
  { number: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Ma\'arij', ayahCount: 44, juzStart: 29, revelationType: 'meccan' },
  { number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', ayahCount: 28, juzStart: 29, revelationType: 'meccan' },
  { number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', ayahCount: 28, juzStart: 29, revelationType: 'meccan' },
  { number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', ayahCount: 20, juzStart: 29, revelationType: 'meccan' },
  { number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', ayahCount: 56, juzStart: 29, revelationType: 'meccan' },
  { number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', ayahCount: 40, juzStart: 29, revelationType: 'meccan' },
  { number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', ayahCount: 31, juzStart: 29, revelationType: 'medinan' },
  { number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', ayahCount: 50, juzStart: 29, revelationType: 'meccan' },
  { number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', ayahCount: 40, juzStart: 30, revelationType: 'meccan' },
  { number: 79, nameArabic: 'النازعات', nameEnglish: 'An-Nazi\'at', ayahCount: 46, juzStart: 30, revelationType: 'meccan' },
  { number: 80, nameArabic: 'عبس', nameEnglish: 'Abasa', ayahCount: 42, juzStart: 30, revelationType: 'meccan' },
  { number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', ayahCount: 29, juzStart: 30, revelationType: 'meccan' },
  { number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', ayahCount: 19, juzStart: 30, revelationType: 'meccan' },
  { number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', ayahCount: 36, juzStart: 30, revelationType: 'meccan' },
  { number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', ayahCount: 25, juzStart: 30, revelationType: 'meccan' },
  { number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', ayahCount: 22, juzStart: 30, revelationType: 'meccan' },
  { number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', ayahCount: 17, juzStart: 30, revelationType: 'meccan' },
  { number: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-A\'la', ayahCount: 19, juzStart: 30, revelationType: 'meccan' },
  { number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', ayahCount: 26, juzStart: 30, revelationType: 'meccan' },
  { number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', ayahCount: 30, juzStart: 30, revelationType: 'meccan' },
  { number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', ayahCount: 20, juzStart: 30, revelationType: 'meccan' },
  { number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', ayahCount: 15, juzStart: 30, revelationType: 'meccan' },
  { number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', ayahCount: 21, juzStart: 30, revelationType: 'meccan' },
  { number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duha', ayahCount: 11, juzStart: 30, revelationType: 'meccan' },
  { number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', ayahCount: 8, juzStart: 30, revelationType: 'meccan' },
  { number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', ayahCount: 8, juzStart: 30, revelationType: 'meccan' },
  { number: 96, nameArabic: 'العلق', nameEnglish: 'Al-Alaq', ayahCount: 19, juzStart: 30, revelationType: 'meccan' },
  { number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', ayahCount: 5, juzStart: 30, revelationType: 'meccan' },
  { number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', ayahCount: 8, juzStart: 30, revelationType: 'medinan' },
  { number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', ayahCount: 8, juzStart: 30, revelationType: 'medinan' },
  { number: 100, nameArabic: 'العاديات', nameEnglish: 'Al-Adiyat', ayahCount: 11, juzStart: 30, revelationType: 'meccan' },
  { number: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qari\'ah', ayahCount: 11, juzStart: 30, revelationType: 'meccan' },
  { number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', ayahCount: 8, juzStart: 30, revelationType: 'meccan' },
  { number: 103, nameArabic: 'العصر', nameEnglish: 'Al-Asr', ayahCount: 3, juzStart: 30, revelationType: 'meccan' },
  { number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', ayahCount: 9, juzStart: 30, revelationType: 'meccan' },
  { number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', ayahCount: 5, juzStart: 30, revelationType: 'meccan' },
  { number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', ayahCount: 4, juzStart: 30, revelationType: 'meccan' },
  { number: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Ma\'un', ayahCount: 7, juzStart: 30, revelationType: 'meccan' },
  { number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', ayahCount: 3, juzStart: 30, revelationType: 'meccan' },
  { number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', ayahCount: 6, juzStart: 30, revelationType: 'meccan' },
  { number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', ayahCount: 3, juzStart: 30, revelationType: 'medinan' },
  { number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', ayahCount: 5, juzStart: 30, revelationType: 'meccan' },
  { number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', ayahCount: 4, juzStart: 30, revelationType: 'meccan' },
  { number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', ayahCount: 5, juzStart: 30, revelationType: 'meccan' },
  { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', ayahCount: 6, juzStart: 30, revelationType: 'meccan' },
] as const;

// Total ayahs in the entire Quran
export const TOTAL_QURAN_AYAHS = 6236;

// ─── Juz Boundaries ─────────────────────────────────────────────────────────
// Each entry: [surahNumber, startAyah] — the first ayah of each juz.

export const JUZ_BOUNDARIES: readonly [surah: number, ayah: number][] = [
  [1, 1],     // Juz 1
  [2, 142],   // Juz 2
  [2, 253],   // Juz 3
  [3, 93],    // Juz 4
  [4, 24],    // Juz 5
  [4, 148],   // Juz 6
  [5, 83],    // Juz 7
  [6, 111],   // Juz 8
  [7, 88],    // Juz 9
  [8, 41],    // Juz 10
  [9, 93],    // Juz 11
  [11, 6],    // Juz 12
  [12, 53],   // Juz 13
  [15, 1],    // Juz 14
  [17, 1],    // Juz 15
  [18, 75],   // Juz 16
  [21, 1],    // Juz 17
  [23, 1],    // Juz 18
  [25, 21],   // Juz 19
  [27, 56],   // Juz 20
  [29, 46],   // Juz 21
  [33, 31],   // Juz 22
  [36, 28],   // Juz 23
  [39, 32],   // Juz 24
  [41, 47],   // Juz 25
  [46, 1],    // Juz 26
  [51, 31],   // Juz 27
  [58, 1],    // Juz 28
  [67, 1],    // Juz 29
  [78, 1],    // Juz 30
] as const;

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

const surahMap = new Map<number, SurahInfo>(
  SURAHS.map((s) => [s.number, s]),
);

export function getSurah(number: number): SurahInfo | undefined {
  return surahMap.get(number);
}

export function getNextAyah(
  surah: number,
  ayah: number,
): { surah: number; ayah: number } | null {
  const s = surahMap.get(surah);
  if (!s) return null;

  if (ayah < s.ayahCount) {
    return { surah, ayah: ayah + 1 };
  }

  // Move to next surah
  const next = surahMap.get(surah + 1);
  if (!next) return null; // End of Quran
  return { surah: surah + 1, ayah: 1 };
}

export function getTotalAyahsInRange(
  fromSurah: number,
  fromAyah: number,
  toSurah: number,
  toAyah: number,
): number {
  if (fromSurah === toSurah) {
    return toAyah - fromAyah + 1;
  }

  let total = 0;

  // Remaining ayahs in the first surah
  const firstSurah = surahMap.get(fromSurah);
  if (!firstSurah) return 0;
  total += firstSurah.ayahCount - fromAyah + 1;

  // Full surahs in between
  for (let s = fromSurah + 1; s < toSurah; s++) {
    const surah = surahMap.get(s);
    if (surah) total += surah.ayahCount;
  }

  // Ayahs in the last surah
  total += toAyah;

  return total;
}

export function getJuzForAyah(surah: number, ayah: number): number {
  let juz = 1;
  for (let i = JUZ_BOUNDARIES.length - 1; i >= 0; i--) {
    const [juzSurah, juzAyah] = JUZ_BOUNDARIES[i];
    if (surah > juzSurah || (surah === juzSurah && ayah >= juzAyah)) {
      juz = i + 1;
      break;
    }
  }
  return juz;
}

export function formatVerseRange(
  surahNumber: number,
  fromAyah: number,
  toAyah: number,
  language: 'ar' | 'en' = 'ar',
): string {
  const surah = surahMap.get(surahNumber);
  if (!surah) return '';

  const name = language === 'ar' ? surah.nameArabic : surah.nameEnglish;
  if (fromAyah === toAyah) {
    return `${name}: ${fromAyah}`;
  }
  return `${name}: ${fromAyah}-${toAyah}`;
}

export function formatRubVerseRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number,
  language: 'ar' | 'en' = 'ar',
): string {
  if (startSurah === endSurah) {
    return formatVerseRange(startSurah, startAyah, endAyah, language);
  }
  // Cross-surah rubʿ: show "Al-Baqarah: 142 – Ali Imran: 92"
  const s1 = surahMap.get(startSurah);
  const s2 = surahMap.get(endSurah);
  if (!s1 || !s2) return '';

  const name1 = language === 'ar' ? s1.nameArabic : s1.nameEnglish;
  const name2 = language === 'ar' ? s2.nameArabic : s2.nameEnglish;
  return `${name1}: ${startAyah} – ${name2}: ${endAyah}`;
}
