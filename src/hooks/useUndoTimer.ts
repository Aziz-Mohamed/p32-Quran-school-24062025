import { useCallback, useEffect, useRef, useState } from 'react';

interface UndoTimerState<T> {
  /** The pending undo data, or null if no undo is active. */
  data: T | null;
  /** Set new undo data and start the auto-dismiss timer. */
  set: (value: T) => void;
  /** Clear the undo data and cancel the timer. */
  clear: () => void;
}

/**
 * Generic undo-with-timeout hook.
 * Stores a pending value that auto-clears after `timeoutMs` milliseconds.
 * Cleans up the timer on unmount.
 */
export function useUndoTimer<T>(timeoutMs = 30_000): UndoTimerState<T> {
  const [data, setData] = useState<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setData(null);
  }, []);

  const set = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setData(value);
      timerRef.current = setTimeout(() => setData(null), timeoutMs);
    },
    [timeoutMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { data, set, clear };
}
