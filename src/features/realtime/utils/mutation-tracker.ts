const DEDUP_WINDOW_MS = 2000;
const MAX_AGE_MS = 5000;

/** In-memory Map<string, number> for local mutation deduplication */
const entries = new Map<string, number>();

function makeKey(table: string, recordId: string): string {
  return `${table}:${recordId}`;
}

/** Record a local mutation. Called in mutation onSuccess handlers. */
function record(table: string, recordId: string): void {
  entries.set(makeKey(table, recordId), Date.now());
}

/** Check if a realtime event should be skipped (matches recent local mutation). */
function isDuplicate(table: string, recordId: string): boolean {
  prune();
  const timestamp = entries.get(makeKey(table, recordId));
  if (timestamp === undefined) return false;
  return Date.now() - timestamp < DEDUP_WINDOW_MS;
}

/** Remove stale entries older than MAX_AGE_MS. */
function prune(): void {
  const now = Date.now();
  for (const [key, timestamp] of entries) {
    if (now - timestamp > MAX_AGE_MS) {
      entries.delete(key);
    }
  }
}

export const mutationTracker = { record, isDuplicate, prune };
