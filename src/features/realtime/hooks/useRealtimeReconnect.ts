import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { focusManager, onlineManager, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

/**
 * Handles app lifecycle (foreground/background) for realtime reconnection.
 * Sets up focusManager and onlineManager integrations for TanStack Query.
 */
export function useRealtimeReconnect(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. AppState listener: foreground reconnection
    const handleAppStateChange = (nextState: AppStateStatus) => {
      // Update TanStack Query focus state
      focusManager.setFocused(nextState === 'active');

      if (nextState === 'active') {
        // Re-subscribe any disconnected channels
        const channels = supabase.getChannels();
        for (const channel of channels) {
          if (channel.state !== 'joined') {
            channel.subscribe();
          }
        }

        // Refetch all stale queries
        queryClient.invalidateQueries();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 2. Online manager: network state detection
    // Use a simple listener that checks connectivity on app state changes.
    // expo-network integration is done via the event listener pattern.
    let isSetup = false;
    const setupOnlineManager = async () => {
      try {
        const Network = await import('expo-network');
        onlineManager.setEventListener((setOnline) => {
          const checkConnection = async () => {
            try {
              const state = await Network.getNetworkStateAsync();
              setOnline(state.isConnected ?? true);
            } catch {
              // If we can't check, assume online
              setOnline(true);
            }
          };

          // Check on app state changes
          const netSub = AppState.addEventListener('change', (status) => {
            if (status === 'active') {
              checkConnection();
            }
          });

          // Initial check
          checkConnection();

          return () => {
            netSub.remove();
          };
        });
        isSetup = true;
      } catch {
        // expo-network not available, skip online manager setup
        if (__DEV__) {
          console.log('[Realtime] expo-network not available, skipping onlineManager setup');
        }
      }
    };

    setupOnlineManager();

    return () => {
      subscription.remove();
      if (isSetup) {
        onlineManager.setEventListener(() => () => {});
      }
    };
  }, [queryClient]);
}
