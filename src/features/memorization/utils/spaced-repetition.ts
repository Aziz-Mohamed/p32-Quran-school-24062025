// SM-2 algorithm adapted for Quran Hifz methodology.
// Quality grade = weighted: accuracy(50%) + fluency(30%) + tajweed(20%)
// Maps to: Hifz Jadid → Muraja'ah Qareebah → Muraja'ah Qadeemah

export interface SM2Input {
  accuracy_score: number | null;
  tajweed_score: number | null;
  fluency_score: number | null;
  current_ease_factor: number;
  current_interval: number;
  review_count: number;
}

export interface SM2Result {
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  quality_grade: number;
  status: 'new' | 'learning' | 'memorized' | 'needs_review';
}

const RECENT_REVIEW_DAYS = 20;

export function calculateQualityGrade(
  accuracy: number | null,
  fluency: number | null,
  tajweed: number | null,
): number {
  const a = accuracy ?? 3;
  const f = fluency ?? 3;
  const t = tajweed ?? 3;
  return a * 0.5 + f * 0.3 + t * 0.2;
}

export function calculateSM2(input: SM2Input): SM2Result {
  const grade = calculateQualityGrade(
    input.accuracy_score,
    input.fluency_score,
    input.tajweed_score,
  );

  let easeFactor = input.current_ease_factor;
  let interval = input.current_interval;
  let reviewCount = input.review_count + 1;

  if (grade < 3) {
    // Failed — reset
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    const nextDate = addDays(new Date(), 1);
    return {
      ease_factor: round2(easeFactor),
      interval_days: interval,
      next_review_date: toDateString(nextDate),
      quality_grade: round2(grade),
      status: 'needs_review',
    };
  }

  // Passed — advance
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  );

  if (reviewCount === 1) {
    interval = 1;
  } else if (reviewCount === 2) {
    interval = 3;
  } else {
    interval = Math.round(input.current_interval * easeFactor);
  }

  const nextDate = addDays(new Date(), interval);

  const status: SM2Result['status'] =
    grade >= 4 ? 'memorized' : 'learning';

  return {
    ease_factor: round2(easeFactor),
    interval_days: interval,
    next_review_date: toDateString(nextDate),
    quality_grade: round2(grade),
    status,
  };
}

export function classifyReviewType(
  firstMemorizedAt: string | null,
): 'new_hifz' | 'recent_review' | 'old_review' {
  if (!firstMemorizedAt) return 'new_hifz';
  const memorizedDate = new Date(firstMemorizedAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - memorizedDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= RECENT_REVIEW_DAYS ? 'recent_review' : 'old_review';
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
