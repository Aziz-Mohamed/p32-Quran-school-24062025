import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { RoleSubscriptionProfile, RealtimeStatus } from '../types/realtime.types';
import { mutationTracker } from '../utils/mutation-tracker';
import { createDebouncedInvalidator } from '../utils/debounce';
import { getQueryKeysForEvent } from '../config/event-query-map';

/**
 * Core subscription hook. Sets up a single Supabase Realtime channel
 * with multiple table listeners. Handles debounce, dedup, and cleanup.
 */
export function useRealtimeSubscription(
  profile: RoleSubscriptionProfile | null,
): RealtimeStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastError: null,
    lastEventAt: null,
  });
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (!profile || profile.subscriptions.length === 0) {
      setStatus({ isConnected: false, lastError: null, lastEventAt: null });
      return;
    }

    const { invalidate, cleanup: cleanupDebounce } = createDebouncedInvalidator(
      queryClient,
      profile.debounceMs,
    );

    // Collect all query keys across all subscriptions for catch-up refetch
    const allQueryKeys = profile.subscriptions.flatMap((s) => s.queryKeys);

    // Build channel with all listeners
    let channel = supabase.channel(profile.channelName);

    for (const sub of profile.subscriptions) {
      const config: Record<string, unknown> = {
        event: sub.event,
        schema: 'public',
        table: sub.table,
      };
      if (sub.filter) {
        config.filter = sub.filter;
      }

      channel = channel.on(
        'postgres_changes' as never,
        config as never,
        (payload: { new?: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          const newRecord = payload.new ?? {};
          const recordId = (newRecord as Record<string, unknown>).id as string | undefined;

          // Dedup check: skip if this is our own recent mutation
          if (recordId && mutationTracker.isDuplicate(sub.table, recordId)) {
            if (__DEV__) {
              console.log(`[Realtime] ${profile.channelName}: skipped duplicate ${sub.table}:${recordId}`);
            }
            return;
          }

          if (__DEV__) {
            console.log(`[Realtime] ${profile.channelName}: ${payload.eventType ?? sub.event} on ${sub.table}`);
          }

          // Get query keys to invalidate and debounce the invalidation
          const queryKeys = getQueryKeysForEvent(sub.table, sub.event, { new: newRecord });
          invalidate(queryKeys);

          setStatus((prev) => ({ ...prev, lastEventAt: Date.now() }));
        },
      );
    }

    channel.subscribe((channelStatus, err) => {
      if (__DEV__) {
        console.log(`[Realtime] ${profile.channelName}: ${channelStatus}${err ? ` (${err.message})` : ''}`);
      }

      switch (channelStatus) {
        case 'SUBSCRIBED':
          setStatus({ isConnected: true, lastError: null, lastEventAt: statusRef.current.lastEventAt });
          // Catch-up refetch: invalidate all query keys to cover events missed during setup
          for (const key of allQueryKeys) {
            queryClient.invalidateQueries({ queryKey: key as string[] });
          }
          break;
        case 'CHANNEL_ERROR':
          setStatus((prev) => ({
            ...prev,
            isConnected: false,
            lastError: err?.message ?? 'Channel error',
          }));
          break;
        case 'TIMED_OUT':
          setStatus((prev) => ({
            ...prev,
            isConnected: false,
            lastError: 'Connection timed out',
          }));
          break;
        case 'CLOSED':
          setStatus((prev) => ({ ...prev, isConnected: false }));
          break;
      }
    });

    return () => {
      cleanupDebounce();
      supabase.removeChannel(channel);
    };
  }, [profile?.channelName, profile?.subscriptions.length, queryClient]);

  return status;
}
