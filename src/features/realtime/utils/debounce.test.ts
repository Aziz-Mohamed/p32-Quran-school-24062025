import { createDebouncedInvalidator } from './debounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

function createMockQueryClient() {
  return {
    invalidateQueries: jest.fn(),
  } as unknown as import('@tanstack/react-query').QueryClient;
}

describe('createDebouncedInvalidator', () => {
  it('does not fire immediately', () => {
    const qc = createMockQueryClient();
    const { invalidate } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);

    expect((qc.invalidateQueries as jest.Mock)).not.toHaveBeenCalled();
  });

  it('fires after debounce window', () => {
    const qc = createMockQueryClient();
    const { invalidate } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);
    jest.advanceTimersByTime(200);

    expect((qc.invalidateQueries as jest.Mock)).toHaveBeenCalledTimes(1);
    expect((qc.invalidateQueries as jest.Mock)).toHaveBeenCalledWith({
      queryKey: ['sessions'],
    });
  });

  it('coalesces multiple calls within the window', () => {
    const qc = createMockQueryClient();
    const { invalidate } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);
    jest.advanceTimersByTime(100);
    invalidate([['attendance']]);
    jest.advanceTimersByTime(200);

    // Both keys should be invalidated in a single batch
    expect((qc.invalidateQueries as jest.Mock)).toHaveBeenCalledTimes(2);
    const calls = (qc.invalidateQueries as jest.Mock).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContainEqual({ queryKey: ['sessions'] });
    expect(calls).toContainEqual({ queryKey: ['attendance'] });
  });

  it('deduplicates the same key within a batch', () => {
    const qc = createMockQueryClient();
    const { invalidate } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);
    invalidate([['sessions']]);
    jest.advanceTimersByTime(200);

    // Only one invalidation for 'sessions'
    expect((qc.invalidateQueries as jest.Mock)).toHaveBeenCalledTimes(1);
  });

  it('resets timer on each new call (trailing edge)', () => {
    const qc = createMockQueryClient();
    const { invalidate } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);
    jest.advanceTimersByTime(150); // 150ms in, not yet fired
    invalidate([['attendance']]);  // resets timer
    jest.advanceTimersByTime(150); // 300ms from start, but 150ms from last call

    // Should not have fired yet (only 150ms since last call)
    expect((qc.invalidateQueries as jest.Mock)).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50); // now 200ms since last call
    expect((qc.invalidateQueries as jest.Mock)).toHaveBeenCalled();
  });

  it('cleanup cancels pending invalidations', () => {
    const qc = createMockQueryClient();
    const { invalidate, cleanup } = createDebouncedInvalidator(qc, 200);

    invalidate([['sessions']]);
    cleanup();
    jest.advanceTimersByTime(300);

    expect((qc.invalidateQueries as jest.Mock)).not.toHaveBeenCalled();
  });
});
