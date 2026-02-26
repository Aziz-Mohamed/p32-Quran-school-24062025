import { getGranularity, getDateRange } from './time-period';

beforeEach(() => {
  jest.useFakeTimers();
  // Thursday, Feb 26, 2026
  jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── getGranularity ─────────────────────────────────────────────────────────

describe('getGranularity', () => {
  it('returns "day" for this_week', () => {
    expect(getGranularity('this_week')).toBe('day');
  });

  it('returns "day" for this_month', () => {
    expect(getGranularity('this_month')).toBe('day');
  });

  it('returns "week" for this_term', () => {
    expect(getGranularity('this_term')).toBe('week');
  });

  it('returns "month" for all_time', () => {
    expect(getGranularity('all_time')).toBe('month');
  });
});

// ─── getDateRange ───────────────────────────────────────────────────────────

describe('getDateRange', () => {
  it('returns Monday as start for this_week', () => {
    const result = getDateRange('this_week');
    // Feb 26, 2026 is a Thursday → Monday is Feb 23
    expect(result.startDate).toBe('2026-02-23');
    expect(result.endDate).toBe('2026-02-26');
    expect(result.granularity).toBe('day');
  });

  it('returns 1st of month for this_month', () => {
    const result = getDateRange('this_month');
    expect(result.startDate).toBe('2026-02-01');
    expect(result.endDate).toBe('2026-02-26');
    expect(result.granularity).toBe('day');
  });

  it('returns 3 months back for this_term', () => {
    const result = getDateRange('this_term');
    expect(result.startDate).toBe('2025-11-26');
    expect(result.endDate).toBe('2026-02-26');
    expect(result.granularity).toBe('week');
  });

  it('uses schoolCreatedAt for all_time when provided', () => {
    const result = getDateRange('all_time', '2025-09-01');
    expect(result.startDate).toBe('2025-09-01');
    expect(result.endDate).toBe('2026-02-26');
    expect(result.granularity).toBe('month');
  });

  it('falls back to 1 year ago for all_time without schoolCreatedAt', () => {
    const result = getDateRange('all_time');
    expect(result.startDate).toBe('2025-02-26');
    expect(result.endDate).toBe('2026-02-26');
  });

  describe('Monday calculation edge cases', () => {
    it('handles Sunday correctly (Monday is 6 days back)', () => {
      // March 1, 2026 is a Sunday
      jest.setSystemTime(new Date('2026-03-01T10:00:00Z'));
      const result = getDateRange('this_week');
      expect(result.startDate).toBe('2026-02-23');
    });

    it('handles Monday itself (start is the same day)', () => {
      // Feb 23, 2026 is a Monday
      jest.setSystemTime(new Date('2026-02-23T10:00:00Z'));
      const result = getDateRange('this_week');
      expect(result.startDate).toBe('2026-02-23');
    });
  });
});
