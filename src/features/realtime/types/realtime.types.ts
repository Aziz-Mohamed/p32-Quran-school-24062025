export type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SubscriptionConfig {
  /** Database table name */
  table: string;
  /** Which event types to listen for */
  event: PostgresChangesEvent;
  /** Supabase filter string, e.g., 'student_id=eq.abc-123' */
  filter?: string;
  /** TanStack Query keys to invalidate when event fires */
  queryKeys: readonly (readonly string[])[];
}

export interface RoleSubscriptionProfile {
  /** Unique channel name for this user session */
  channelName: string;
  /** Array of table subscriptions for this role */
  subscriptions: SubscriptionConfig[];
  /** Debounce window in milliseconds for event coalescing */
  debounceMs: number;
}

export interface RealtimeStatus {
  /** Whether the channel is currently connected and receiving events */
  isConnected: boolean;
  /** Last error message, if any */
  lastError: string | null;
  /** Timestamp of last received event */
  lastEventAt: number | null;
}
