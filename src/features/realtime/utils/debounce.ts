import type { QueryClient } from '@tanstack/react-query';

/**
 * Creates a trailing-edge debounced invalidator.
 * Coalesces multiple query key invalidation calls within `debounceMs`
 * into a single batch `invalidateQueries` call.
 */
export function createDebouncedInvalidator(
  queryClient: QueryClient,
  debounceMs: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const pendingKeys = new Set<string>();

  function invalidate(queryKeys: readonly (readonly string[])[]): void {
    for (const key of queryKeys) {
      pendingKeys.add(JSON.stringify(key));
    }

    // Trailing-edge: reset timer on each new event
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      const keys = Array.from(pendingKeys);
      pendingKeys.clear();

      for (const serialized of keys) {
        const queryKey = JSON.parse(serialized) as string[];
        queryClient.invalidateQueries({ queryKey });
      }
    }, debounceMs);
  }

  function cleanup(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingKeys.clear();
  }

  return { invalidate, cleanup };
}
