import {
  SURAHS,
  TOTAL_QURAN_AYAHS,
  getSurah,
  getNextAyah,
  getTotalAyahsInRange,
  getJuzForAyah,
  formatVerseRange,
  formatRubVerseRange,
  getMushafPage,
  getMushafPageRange,
} from './quran-metadata';

// ─── Static data integrity ──────────────────────────────────────────────────

describe('SURAHS', () => {
  it('has 114 surahs', () => {
    expect(SURAHS).toHaveLength(114);
  });

  it('starts with Al-Fatihah (7 ayahs)', () => {
    expect(SURAHS[0].number).toBe(1);
    expect(SURAHS[0].ayahCount).toBe(7);
  });

  it('ends with An-Nas (6 ayahs)', () => {
    expect(SURAHS[113].number).toBe(114);
    expect(SURAHS[113].ayahCount).toBe(6);
  });

  it('total ayahs sum to 6236', () => {
    const total = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
    expect(total).toBe(TOTAL_QURAN_AYAHS);
  });
});

// ─── getSurah ───────────────────────────────────────────────────────────────

describe('getSurah', () => {
  it('returns Al-Fatihah for number 1', () => {
    const surah = getSurah(1);
    expect(surah).toBeDefined();
    expect(surah!.nameEnglish).toBe('Al-Fatihah');
  });

  it('returns An-Nas for number 114', () => {
    const surah = getSurah(114);
    expect(surah).toBeDefined();
    expect(surah!.nameEnglish).toBe('An-Nas');
  });

  it('returns undefined for invalid number', () => {
    expect(getSurah(0)).toBeUndefined();
    expect(getSurah(115)).toBeUndefined();
    expect(getSurah(-1)).toBeUndefined();
  });
});

// ─── getNextAyah ────────────────────────────────────────────────────────────

describe('getNextAyah', () => {
  it('returns next ayah within same surah', () => {
    expect(getNextAyah(1, 3)).toEqual({ surah: 1, ayah: 4 });
  });

  it('moves to next surah when at last ayah', () => {
    // Al-Fatihah has 7 ayahs
    expect(getNextAyah(1, 7)).toEqual({ surah: 2, ayah: 1 });
  });

  it('returns null at end of Quran', () => {
    // An-Nas (114) has 6 ayahs
    expect(getNextAyah(114, 6)).toBeNull();
  });

  it('returns null for invalid surah', () => {
    expect(getNextAyah(0, 1)).toBeNull();
    expect(getNextAyah(115, 1)).toBeNull();
  });
});

// ─── getTotalAyahsInRange ───────────────────────────────────────────────────

describe('getTotalAyahsInRange', () => {
  it('counts ayahs within a single surah', () => {
    // Al-Fatihah: ayah 1 to 7 = 7 ayahs
    expect(getTotalAyahsInRange(1, 1, 1, 7)).toBe(7);
  });

  it('counts a partial range within one surah', () => {
    expect(getTotalAyahsInRange(1, 2, 1, 5)).toBe(4);
  });

  it('counts across two surahs', () => {
    // Al-Fatihah 1:5 to 2:3
    // 1:5-1:7 = 3 ayahs + 2:1-2:3 = 3 ayahs = 6
    expect(getTotalAyahsInRange(1, 5, 2, 3)).toBe(6);
  });

  it('counts across multiple surahs', () => {
    // 1:1 to 3:1
    // Full surah 1 (7) + Full surah 2 (286) + 3:1 (1) = 294
    expect(getTotalAyahsInRange(1, 1, 3, 1)).toBe(294);
  });

  it('returns 1 for a single ayah', () => {
    expect(getTotalAyahsInRange(2, 100, 2, 100)).toBe(1);
  });

  it('returns 0 for invalid cross-surah range', () => {
    // Invalid fromSurah (0) with different toSurah triggers the surahMap lookup
    expect(getTotalAyahsInRange(0, 1, 1, 5)).toBe(0);
  });
});

// ─── getJuzForAyah ──────────────────────────────────────────────────────────

describe('getJuzForAyah', () => {
  it('returns juz 1 for Al-Fatihah:1', () => {
    expect(getJuzForAyah(1, 1)).toBe(1);
  });

  it('returns juz 1 for Al-Baqarah:141 (just before juz 2)', () => {
    expect(getJuzForAyah(2, 141)).toBe(1);
  });

  it('returns juz 2 for Al-Baqarah:142 (juz 2 boundary)', () => {
    expect(getJuzForAyah(2, 142)).toBe(2);
  });

  it('returns juz 30 for An-Naba:1', () => {
    expect(getJuzForAyah(78, 1)).toBe(30);
  });

  it('returns juz 30 for An-Nas:6 (last ayah)', () => {
    expect(getJuzForAyah(114, 6)).toBe(30);
  });
});

// ─── formatVerseRange ───────────────────────────────────────────────────────

describe('formatVerseRange', () => {
  it('formats a single ayah', () => {
    expect(formatVerseRange(1, 3, 3, 'en')).toBe('Al-Fatihah: 3');
  });

  it('formats an ayah range', () => {
    expect(formatVerseRange(1, 1, 7, 'en')).toBe('Al-Fatihah: 1-7');
  });

  it('uses Arabic name when language is ar', () => {
    expect(formatVerseRange(1, 1, 7, 'ar')).toBe('الفاتحة: 1-7');
  });

  it('returns empty string for invalid surah', () => {
    expect(formatVerseRange(0, 1, 1, 'en')).toBe('');
  });
});

// ─── formatRubVerseRange ────────────────────────────────────────────────────

describe('formatRubVerseRange', () => {
  it('delegates to formatVerseRange for same-surah range', () => {
    expect(formatRubVerseRange(1, 1, 1, 7, 'en')).toBe('Al-Fatihah: 1-7');
  });

  it('formats cross-surah range with dash separator', () => {
    const result = formatRubVerseRange(1, 1, 2, 141, 'en');
    expect(result).toBe('Al-Fatihah: 1 – Al-Baqarah: 141');
  });

  it('uses Arabic names when language is ar', () => {
    const result = formatRubVerseRange(1, 1, 2, 141, 'ar');
    expect(result).toBe('الفاتحة: 1 – البقرة: 141');
  });
});

// ─── getMushafPage ──────────────────────────────────────────────────────────

describe('getMushafPage', () => {
  it('returns page 1 for rub 1', () => {
    expect(getMushafPage(1)).toBe(1);
  });

  it('returns undefined for invalid rub', () => {
    expect(getMushafPage(0)).toBeUndefined();
    expect(getMushafPage(241)).toBeUndefined();
  });
});

// ─── getMushafPageRange ─────────────────────────────────────────────────────

describe('getMushafPageRange', () => {
  it('returns page range for rubs 1-2', () => {
    const result = getMushafPageRange(1, 2);
    expect(result).toBeDefined();
    expect(result!.startPage).toBe(1);
    // endPage = page of rub 3 - 1 = 7 - 1 = 6
    expect(result!.endPage).toBe(6);
  });

  it('returns 604 as end page for last rub', () => {
    const result = getMushafPageRange(240, 240);
    expect(result).toBeDefined();
    expect(result!.endPage).toBe(604);
  });

  it('returns undefined for invalid start rub', () => {
    expect(getMushafPageRange(0, 5)).toBeUndefined();
  });
});
