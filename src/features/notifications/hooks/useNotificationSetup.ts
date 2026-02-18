import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { notificationsService } from '../services/notifications.service';

const SOFT_ASK_SHOWN_KEY = 'notifications_soft_ask_shown';

interface UseNotificationSetupOptions {
  userId: string | undefined;
  isAuthenticated: boolean;
}

interface UseNotificationSetupResult {
  showSoftAsk: boolean;
  dismissSoftAsk: () => void;
  requestPermissions: () => Promise<boolean>;
  expoPushToken: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
}

export function useNotificationSetup({
  userId,
  isAuthenticated,
}: UseNotificationSetupOptions): UseNotificationSetupResult {
  const [showSoftAsk, setShowSoftAsk] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const tokenRefreshSubscription = useRef<Notifications.Subscription | null>(null);

  // Check if this is the first time on this device
  const checkFirstTime = useCallback(async () => {
    const shown = await AsyncStorage.getItem(SOFT_ASK_SHOWN_KEY);
    if (!shown) {
      setShowSoftAsk(true);
    }
  }, []);

  // Register the push token with the backend
  const registerPushToken = useCallback(
    async (token: string) => {
      if (!userId) return;

      try {
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        await notificationsService.registerToken(userId, token, platform);
        setExpoPushToken(token);

        if (__DEV__) {
          console.log('[Notifications] Token registered:', token.substring(0, 20) + '...');
        }
      } catch (error) {
        if (__DEV__) {
          console.log('[Notifications] registerPushToken error:', error);
        }
      }
    },
    [userId],
  );

  // Get the Expo push token
  const getAndRegisterToken = useCallback(async () => {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log('[Notifications] Push notifications require a physical device');
      }
      return;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        if (__DEV__) {
          console.log(
            '[Notifications] No EAS projectId found. Run `eas init` to configure push notifications.',
          );
        }
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      await registerPushToken(tokenData.data);
    } catch (error) {
      if (__DEV__) {
        console.log('[Notifications] getExpoPushTokenAsync error:', error);
      }
    }
  }, [registerPushToken]);

  // Request permissions and register token
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.log('[Notifications] Push notifications require a physical device');
      }
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus === 'granted') {
      await getAndRegisterToken();
      return true;
    }

    if (__DEV__) {
      console.log('[Notifications] Permission denied:', finalStatus);
    }
    return false;
  }, [getAndRegisterToken]);

  // Dismiss the soft-ask and mark it as shown
  const dismissSoftAsk = useCallback(() => {
    setShowSoftAsk(false);
    AsyncStorage.setItem(SOFT_ASK_SHOWN_KEY, 'true');
  }, []);

  // Main setup effect
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    let mounted = true;

    const setup = async () => {
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2F9E44',
        });
      }

      // Configure foreground notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        }),
      });

      // Check current permission status
      const { status } = await Notifications.getPermissionsAsync();
      if (!mounted) return;
      setPermissionStatus(status);

      if (status === 'granted') {
        // Already have permission — register token
        await getAndRegisterToken();
      } else if (status === 'undetermined') {
        // Never asked — check if we should show soft-ask
        await checkFirstTime();
      }
      // If 'denied', don't pester — user explicitly declined
    };

    setup();

    // Set up token refresh listener — re-fetch the Expo push token
    // when the underlying device token rotates (addPushTokenListener
    // fires with a native device token, not an Expo token)
    tokenRefreshSubscription.current = Notifications.addPushTokenListener(() => {
      if (mounted) {
        getAndRegisterToken();
      }
    });

    return () => {
      mounted = false;
      tokenRefreshSubscription.current?.remove();
    };
  }, [isAuthenticated, userId, getAndRegisterToken, checkFirstTime, registerPushToken]);

  return {
    showSoftAsk,
    dismissSoftAsk,
    requestPermissions,
    expoPushToken,
    permissionStatus,
  };
}
