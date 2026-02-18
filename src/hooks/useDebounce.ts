import { useEffect, useState } from 'react';

/**
 * Debounces a rapidly-changing value. The returned value only updates
 * after `delay` milliseconds of inactivity.
 *
 * @example
 * const debouncedSearch = useDebounce(searchText, 300);
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
