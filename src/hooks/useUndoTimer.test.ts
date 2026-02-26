import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useUndoTimer } from './useUndoTimer';

// Minimal renderHook using react-test-renderer (React 19 compatible)
function renderHook<T>(hookFn: () => T) {
  const result = { current: null as T };
  function TestComponent() {
    result.current = hookFn();
    return null;
  }
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(React.createElement(TestComponent));
  });
  return { result, unmount: () => act(() => renderer.unmount()) };
}

describe('useUndoTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with null data', () => {
    const { result } = renderHook(() => useUndoTimer<string>());
    expect(result.current.data).toBeNull();
  });

  it('stores data after set()', () => {
    const { result } = renderHook(() => useUndoTimer<string>());

    act(() => {
      result.current.set('test-value');
    });

    expect(result.current.data).toBe('test-value');
  });

  it('clears data after clear()', () => {
    const { result } = renderHook(() => useUndoTimer<string>());

    act(() => {
      result.current.set('test-value');
    });
    expect(result.current.data).toBe('test-value');

    act(() => {
      result.current.clear();
    });
    expect(result.current.data).toBeNull();
  });

  it('auto-clears after the default timeout (30s)', () => {
    const { result } = renderHook(() => useUndoTimer<string>());

    act(() => {
      result.current.set('test-value');
    });
    expect(result.current.data).toBe('test-value');

    act(() => {
      jest.advanceTimersByTime(29_999);
    });
    expect(result.current.data).toBe('test-value');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.data).toBeNull();
  });

  it('respects custom timeout', () => {
    const { result } = renderHook(() => useUndoTimer<number>(5000));

    act(() => {
      result.current.set(42);
    });

    act(() => {
      jest.advanceTimersByTime(4999);
    });
    expect(result.current.data).toBe(42);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.data).toBeNull();
  });

  it('resets the timer when set() is called again', () => {
    const { result } = renderHook(() => useUndoTimer<string>(5000));

    act(() => {
      result.current.set('first');
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.data).toBe('first');

    act(() => {
      result.current.set('second');
    });

    // 3s more — would have expired the first timer, but second restarted it
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.data).toBe('second');

    // Expires at 5s from the second set()
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.data).toBeNull();
  });

  it('cleans up timer on unmount', () => {
    const { result, unmount } = renderHook(() => useUndoTimer<string>());

    act(() => {
      result.current.set('test');
    });

    unmount();

    // Should not throw or cause leaks
    act(() => {
      jest.runAllTimers();
    });
  });
});
