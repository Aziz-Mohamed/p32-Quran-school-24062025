import { mutationTracker } from './mutation-tracker';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-02-26T10:00:00Z'));
  // Prune any leftover entries from previous tests
  jest.advanceTimersByTime(10000);
  mutationTracker.prune();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('mutationTracker', () => {
  describe('record + isDuplicate', () => {
    it('marks a fresh mutation as duplicate within 2s window', () => {
      mutationTracker.record('sessions', 'abc-123');
      expect(mutationTracker.isDuplicate('sessions', 'abc-123')).toBe(true);
    });

    it('returns false for unrecorded mutations', () => {
      expect(mutationTracker.isDuplicate('sessions', 'xyz-999')).toBe(false);
    });

    it('returns false after the 2s dedup window expires', () => {
      mutationTracker.record('sessions', 'abc-123');
      jest.advanceTimersByTime(2001);
      expect(mutationTracker.isDuplicate('sessions', 'abc-123')).toBe(false);
    });

    it('distinguishes different tables', () => {
      mutationTracker.record('sessions', 'abc-123');
      expect(mutationTracker.isDuplicate('attendance', 'abc-123')).toBe(false);
    });

    it('distinguishes different record IDs', () => {
      mutationTracker.record('sessions', 'abc-123');
      expect(mutationTracker.isDuplicate('sessions', 'def-456')).toBe(false);
    });
  });

  describe('prune', () => {
    it('removes entries older than 5s', () => {
      mutationTracker.record('sessions', 'abc-123');
      jest.advanceTimersByTime(5001);
      mutationTracker.prune();
      // After pruning, even within the original window it should be gone
      expect(mutationTracker.isDuplicate('sessions', 'abc-123')).toBe(false);
    });

    it('keeps entries within 5s', () => {
      mutationTracker.record('sessions', 'abc-123');
      jest.advanceTimersByTime(1000);
      mutationTracker.prune();
      expect(mutationTracker.isDuplicate('sessions', 'abc-123')).toBe(true);
    });
  });
});
