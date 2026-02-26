import {
  getDecayInterval,
  computeFreshness,
  freshnessToState,
  computePoorRevisionTimestamp,
} from './freshness';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── getDecayInterval ───────────────────────────────────────────────────────

describe('getDecayInterval', () => {
  it.each([
    [0, 14],
    [-1, 14],
    [1, 21],
    [2, 30],
    [3, 45],
    [4, 60],
    [5, 60],
    [6, 75],
    [8, 75],
    [9, 90],
    [11, 90],
    [12, 120],
    [50, 120],
  ])('reviewCount %i → %i days', (reviewCount, expected) => {
    expect(getDecayInterval(reviewCount)).toBe(expected);
  });
});

// ─── freshnessToState ───────────────────────────────────────────────────────

describe('freshnessToState', () => {
  it.each([
    [0, 'dormant'],
    [-5, 'dormant'],
    [1, 'critical'],
    [24, 'critical'],
    [25, 'warning'],
    [49, 'warning'],
    [50, 'fading'],
    [74, 'fading'],
    [75, 'fresh'],
    [100, 'fresh'],
  ] as const)('percentage %i → %s', (percentage, expected) => {
    expect(freshnessToState(percentage)).toBe(expected);
  });
});

// ─── computeFreshness ───────────────────────────────────────────────────────

describe('computeFreshness', () => {
  it('returns 0% and dormant when dormantSince is set', () => {
    const result = computeFreshness('2026-02-20T10:00:00Z', 3, '2026-02-25T00:00:00Z');

    expect(result.percentage).toBe(0);
    expect(result.state).toBe('dormant');
    expect(result.daysUntilDormant).toBe(0);
    expect(result.intervalDays).toBe(45); // reviewCount 3
  });

  it('returns 100% when just reviewed (0 days elapsed)', () => {
    const result = computeFreshness('2026-02-26T10:00:00Z', 0, null);

    expect(result.percentage).toBe(100);
    expect(result.state).toBe('fresh');
    expect(result.intervalDays).toBe(14);
    expect(result.daysUntilDormant).toBe(14);
  });

  it('returns 50% at half the decay interval', () => {
    // reviewCount 0 → interval 14 days. 7 days ago → 50%
    const result = computeFreshness('2026-02-19T10:00:00Z', 0, null);

    expect(result.percentage).toBe(50);
    expect(result.state).toBe('fading');
    expect(result.daysUntilDormant).toBe(7);
  });

  it('returns 0% when fully elapsed', () => {
    // reviewCount 0 → interval 14 days. 14 days ago → 0%
    const result = computeFreshness('2026-02-12T10:00:00Z', 0, null);

    expect(result.percentage).toBe(0);
    expect(result.state).toBe('dormant');
    expect(result.daysUntilDormant).toBe(0);
  });

  it('clamps to 0% when beyond interval', () => {
    // reviewCount 0 → interval 14 days. 30 days ago → would be negative
    const result = computeFreshness('2026-01-27T10:00:00Z', 0, null);

    expect(result.percentage).toBe(0);
    expect(result.state).toBe('dormant');
  });

  it('uses correct interval for higher review counts', () => {
    // reviewCount 5 → interval 60 days. 30 days ago → 50%
    const result = computeFreshness('2026-01-27T10:00:00Z', 5, null);

    expect(result.percentage).toBe(50);
    expect(result.intervalDays).toBe(60);
  });

  it('floors the percentage (no rounding up)', () => {
    // reviewCount 0 → interval 14 days. 1 day ago → (1 - 1/14) * 100 = 92.857...
    const result = computeFreshness('2026-02-25T10:00:00Z', 0, null);

    expect(result.percentage).toBe(92); // floor, not 93
  });
});

// ─── computePoorRevisionTimestamp ───────────────────────────────────────────

describe('computePoorRevisionTimestamp', () => {
  it('returns a timestamp that yields ~50% freshness', () => {
    const intervalDays = 14;
    const timestamp = computePoorRevisionTimestamp(intervalDays);

    // Parse the result and verify it's ~7 days in the past
    const result = new Date(timestamp);
    const now = Date.now();
    const daysAgo = (now - result.getTime()) / MS_PER_DAY;

    expect(daysAgo).toBeCloseTo(7, 1);
  });

  it('scales with interval length', () => {
    const timestamp60 = computePoorRevisionTimestamp(60);
    const timestamp14 = computePoorRevisionTimestamp(14);

    const now = Date.now();
    const daysAgo60 = (now - new Date(timestamp60).getTime()) / MS_PER_DAY;
    const daysAgo14 = (now - new Date(timestamp14).getTime()) / MS_PER_DAY;

    expect(daysAgo60).toBeCloseTo(30, 1); // half of 60
    expect(daysAgo14).toBeCloseTo(7, 1);  // half of 14
  });

  it('returns a valid ISO string', () => {
    const timestamp = computePoorRevisionTimestamp(14);
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });
});
