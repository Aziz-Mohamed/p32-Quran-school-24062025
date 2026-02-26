import { calculateQualityGrade, calculateSM2, classifyReviewType } from './spaced-repetition';
import type { SM2Input } from './spaced-repetition';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── calculateQualityGrade ──────────────────────────────────────────────────

describe('calculateQualityGrade', () => {
  it('computes weighted average: accuracy 50%, fluency 30%, tajweed 20%', () => {
    // 5*0.5 + 4*0.3 + 3*0.2 = 2.5 + 1.2 + 0.6 = 4.3
    expect(calculateQualityGrade(5, 4, 3)).toBeCloseTo(4.3);
  });

  it('returns 3 when all scores are null (default)', () => {
    // 3*0.5 + 3*0.3 + 3*0.2 = 3
    expect(calculateQualityGrade(null, null, null)).toBe(3);
  });

  it('defaults individual null scores to 3', () => {
    // 5*0.5 + 3*0.3 + 3*0.2 = 2.5 + 0.9 + 0.6 = 4
    expect(calculateQualityGrade(5, null, null)).toBe(4);
  });

  it('returns minimum grade with all 1s', () => {
    // 1*0.5 + 1*0.3 + 1*0.2 = 1
    expect(calculateQualityGrade(1, 1, 1)).toBe(1);
  });

  it('returns maximum grade with all 5s', () => {
    // 5*0.5 + 5*0.3 + 5*0.2 = 5
    expect(calculateQualityGrade(5, 5, 5)).toBe(5);
  });
});

// ─── calculateSM2 ───────────────────────────────────────────────────────────

describe('calculateSM2', () => {
  const baseInput: SM2Input = {
    accuracy_score: 5,
    fluency_score: 5,
    tajweed_score: 5,
    current_ease_factor: 2.5,
    current_interval: 1,
    review_count: 0,
  };

  describe('grade < 3 (failure)', () => {
    it('resets interval to 1 and reduces ease factor', () => {
      const input: SM2Input = {
        ...baseInput,
        accuracy_score: 1,
        fluency_score: 1,
        tajweed_score: 1,
      };
      const result = calculateSM2(input);

      expect(result.interval_days).toBe(1);
      expect(result.ease_factor).toBe(2.3); // 2.5 - 0.2
      expect(result.status).toBe('needs_review');
      expect(result.next_review_date).toBe('2026-02-27');
    });

    it('enforces ease factor floor of 1.3', () => {
      const input: SM2Input = {
        ...baseInput,
        accuracy_score: 1,
        fluency_score: 1,
        tajweed_score: 1,
        current_ease_factor: 1.3,
      };
      const result = calculateSM2(input);

      expect(result.ease_factor).toBe(1.3);
    });
  });

  describe('first review (review_count becomes 1)', () => {
    it('sets interval to 1 day', () => {
      const result = calculateSM2({ ...baseInput, review_count: 0 });

      expect(result.interval_days).toBe(1);
      expect(result.next_review_date).toBe('2026-02-27');
    });
  });

  describe('second review (review_count becomes 2)', () => {
    it('sets interval to 3 days', () => {
      const result = calculateSM2({ ...baseInput, review_count: 1 });

      expect(result.interval_days).toBe(3);
      expect(result.next_review_date).toBe('2026-03-01');
    });
  });

  describe('subsequent reviews (review_count >= 3)', () => {
    it('multiplies current interval by ease factor', () => {
      const input: SM2Input = {
        ...baseInput,
        review_count: 2,
        current_interval: 3,
        current_ease_factor: 2.5,
      };
      const result = calculateSM2(input);

      // interval = round(3 * new_ease_factor)
      // grade = 5, ease_factor = 2.5 + (0.1 - 0*0.08 + 0*0.02) = 2.6
      // interval = round(3 * 2.6) = 8
      expect(result.interval_days).toBe(8);
    });
  });

  describe('status determination', () => {
    it('returns "memorized" when grade >= 4', () => {
      const result = calculateSM2(baseInput); // grade = 5
      expect(result.status).toBe('memorized');
    });

    it('returns "learning" when 3 <= grade < 4', () => {
      const input: SM2Input = {
        ...baseInput,
        accuracy_score: 3,
        fluency_score: 3,
        tajweed_score: 3,
      };
      const result = calculateSM2(input); // grade = 3
      expect(result.status).toBe('learning');
    });
  });

  it('rounds quality_grade to 2 decimal places', () => {
    const input: SM2Input = {
      ...baseInput,
      accuracy_score: 4,
      fluency_score: 3,
      tajweed_score: 5,
    };
    const result = calculateSM2(input);
    // 4*0.5 + 3*0.3 + 5*0.2 = 2 + 0.9 + 1 = 3.9
    expect(result.quality_grade).toBe(3.9);
  });
});

// ─── classifyReviewType ─────────────────────────────────────────────────────

describe('classifyReviewType', () => {
  it('returns "new_hifz" when firstMemorizedAt is null', () => {
    expect(classifyReviewType(null)).toBe('new_hifz');
  });

  it('returns "recent_review" when within 20 days', () => {
    // 10 days ago
    expect(classifyReviewType('2026-02-16T10:00:00Z')).toBe('recent_review');
  });

  it('returns "recent_review" at exactly 20 days boundary', () => {
    expect(classifyReviewType('2026-02-06T10:00:00Z')).toBe('recent_review');
  });

  it('returns "old_review" when beyond 20 days', () => {
    // 21 days ago
    expect(classifyReviewType('2026-02-05T10:00:00Z')).toBe('old_review');
  });

  it('returns "old_review" for very old dates', () => {
    expect(classifyReviewType('2025-01-01T00:00:00Z')).toBe('old_review');
  });
});
