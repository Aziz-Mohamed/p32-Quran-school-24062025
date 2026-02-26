import { computeRubCoverage } from './rub-coverage';
import type { AyahRange } from './rub-coverage';

// Minimal rub reference data for testing (mimics quran_rub_reference rows)
// Al-Fatihah has 7 ayahs, so rub 1 starts at 1:1
// Rub 2 starts later in Al-Baqarah
const makeRub = (rubNumber: number, juzNumber: number, startSurah: number, startAyah: number) => ({
  id: `rub-${rubNumber}`,
  rub_number: rubNumber,
  juz_number: juzNumber,
  start_surah: startSurah,
  start_ayah: startAyah,
  hizb_number: Math.ceil(rubNumber / 4),
  created_at: '2026-01-01',
});

// Two consecutive rubs within Al-Baqarah for simple testing
// Rub 1: surah 1, ayah 1 → end is just before rub 2
// Rub 2: surah 2, ayah 1 → end is just before rub 3
const twoRubs = [
  makeRub(1, 1, 1, 1),   // starts at 1:1 (Al-Fatihah)
  makeRub(2, 1, 2, 1),   // starts at 2:1 (Al-Baqarah)
];

// ─── computeRubCoverage ─────────────────────────────────────────────────────

describe('computeRubCoverage', () => {
  it('returns empty array when rubData is empty', () => {
    expect(computeRubCoverage([], [])).toEqual([]);
  });

  it('returns empty array when no memorized progress and no pending', () => {
    const result = computeRubCoverage(twoRubs, [
      { surah_number: 1, from_ayah: 1, to_ayah: 7, status: 'in_progress' },
    ]);
    expect(result).toEqual([]);
  });

  it('computes full coverage for a single rub fully memorized', () => {
    // Rub 1 = surah 1:1 to 1:7 (7 ayahs — all of Al-Fatihah)
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 7, status: 'memorized' },
    ];
    const result = computeRubCoverage(twoRubs, progress);

    const rub1 = result.find((r) => r.rubNumber === 1);
    expect(rub1).toBeDefined();
    expect(rub1!.memorizedAyahs).toBe(7);
    expect(rub1!.totalAyahs).toBe(7);
    expect(rub1!.percentage).toBe(100);
  });

  it('computes partial coverage', () => {
    // Memorize only first 3 of 7 ayahs in Al-Fatihah
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 3, status: 'memorized' },
    ];
    const result = computeRubCoverage(twoRubs, progress);

    const rub1 = result.find((r) => r.rubNumber === 1);
    expect(rub1).toBeDefined();
    expect(rub1!.memorizedAyahs).toBe(3);
    expect(rub1!.percentage).toBe(Math.round((3 / 7) * 100));
  });

  it('does not double-count overlapping memorized ranges', () => {
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 5, status: 'memorized' },
      { surah_number: 1, from_ayah: 3, to_ayah: 7, status: 'memorized' },
    ];
    const result = computeRubCoverage(twoRubs, progress);

    const rub1 = result.find((r) => r.rubNumber === 1);
    expect(rub1!.memorizedAyahs).toBe(7); // union, not 10
  });

  it('counts uncertified ayahs from pending assignments', () => {
    const pending: AyahRange[] = [
      { id: 'a1', surah_number: 1, from_ayah: 1, to_ayah: 4 },
    ];
    const result = computeRubCoverage(twoRubs, [], pending);

    const rub1 = result.find((r) => r.rubNumber === 1);
    expect(rub1).toBeDefined();
    expect(rub1!.uncertifiedAyahs).toBe(4);
    expect(rub1!.memorizedAyahs).toBe(0);
    expect(rub1!.pendingAssignmentIds).toContain('a1');
  });

  it('deduplicates pending against certified ayahs', () => {
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 4, status: 'memorized' },
    ];
    const pending: AyahRange[] = [
      { id: 'a1', surah_number: 1, from_ayah: 1, to_ayah: 7 },
    ];
    const result = computeRubCoverage(twoRubs, progress, pending);

    const rub1 = result.find((r) => r.rubNumber === 1);
    expect(rub1!.memorizedAyahs).toBe(4);
    expect(rub1!.uncertifiedAyahs).toBe(3); // 5,6,7 not yet certified
    expect(rub1!.totalPercentage).toBe(100);
  });

  it('omits rubs with zero coverage', () => {
    // Only memorize in rub 1, rub 2 should not appear
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 3, status: 'memorized' },
    ];
    const result = computeRubCoverage(twoRubs, progress);

    expect(result.length).toBe(1);
    expect(result[0].rubNumber).toBe(1);
  });

  it('includes correct rub metadata in results', () => {
    const progress = [
      { surah_number: 1, from_ayah: 1, to_ayah: 7, status: 'memorized' },
    ];
    const result = computeRubCoverage(twoRubs, progress);

    const rub1 = result[0];
    expect(rub1.startSurah).toBe(1);
    expect(rub1.startAyah).toBe(1);
    expect(rub1.juzNumber).toBe(1);
  });
});
