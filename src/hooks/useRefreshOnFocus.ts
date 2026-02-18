import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Calls the provided `refetch` function every time the screen comes into
 * focus, skipping the initial mount to avoid a double-fetch with TanStack
 * Query's own initial load.
 */
export const useRefreshOnFocus = (refetch: () => void): void => {
  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
};
