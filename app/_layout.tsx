import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';

import { useAuthStore, type Profile } from '@/stores/authStore';
import { useLocaleStore } from '@/stores/localeStore';
import { useAuth } from '@/hooks/useAuth';
import i18n from '@/i18n/config';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { useRealtimeManager, useRealtimeReconnect } from '@/features/realtime';
import { useNotificationSetup } from '@/features/notifications/hooks/useNotificationSetup';
import { useNotificationHandler } from '@/features/notifications/hooks/useNotificationHandler';
import { NotificationSoftAsk } from '@/features/notifications/components/NotificationSoftAsk';
import { InAppBanner } from '@/features/notifications/components/InAppBanner';
import type { UserRole, NotificationPayload } from '@/features/notifications/types/notifications.types';

// ─── Keep Splash Screen Visible ──────────────────────────────────────────────

SplashScreen.preventAutoHideAsync();

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });
  const [storeHydrated, setStoreHydrated] = useState(false);

  // Wait for Zustand locale store to hydrate from AsyncStorage,
  // then sync i18n language with the persisted user preference.
  useEffect(() => {
    const syncLocale = () => {
      const { locale } = useLocaleStore.getState();
      if (i18n.language !== locale) {
        i18n.changeLanguage(locale);
      }
      setStoreHydrated(true);
    };

    if (useLocaleStore.persist.hasHydrated()) {
      syncLocale();
    } else {
      const unsub = useLocaleStore.persist.onFinishHydration(syncLocale);
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && storeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, storeHydrated]);

  if (!fontsLoaded || !storeHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(student)" />
            <Stack.Screen name="(teacher)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthGuard>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, role, profile } = useAuth();

  // ─── Realtime Subscriptions ─────────────────────────────────────────────────
  useRealtimeReconnect();
  useRealtimeManager();

  // ─── Push Notifications ───────────────────────────────────────────────────
  const {
    showSoftAsk,
    dismissSoftAsk,
    requestPermissions,
  } = useNotificationSetup({
    userId: profile?.id,
    isAuthenticated,
  });

  const handleEnableNotifications = async () => {
    dismissSoftAsk();
    await requestPermissions();
  };

  // ─── Notification Handler (tap + foreground) ──────────────────────────────
  const [bannerNotification, setBannerNotification] = useState<NotificationPayload | null>(null);

  const handleForegroundNotification = useCallback((payload: NotificationPayload) => {
    setBannerNotification(payload);
  }, []);

  const { navigateToNotification } = useNotificationHandler({
    isAuthenticated,
    onForegroundNotification: handleForegroundNotification,
  });

  const handleBannerPress = useCallback(
    (payload: NotificationPayload) => {
      setBannerNotification(null);
      navigateToNotification(payload.data);
    },
    [navigateToNotification],
  );

  const handleBannerDismiss = useCallback(() => {
    setBannerNotification(null);
  }, []);
  const initialize = useAuthStore((s) => s.initialize);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ─── Initialize Auth Listener ───────────────────────────────────────────────

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setProfile(data as Profile);
            }
            initialize();
          });
      } else {
        initialize();
      }
    });

    // Listen to auth changes (T116: handle token expiry)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        // Token expired or user signed out — clear auth state
        clearAuth();
        return;
      }
      if (session) {
        // Fetch profile on sign in or token refresh
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setProfile(data as Profile);
            }
          });
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setProfile, initialize, clearAuth]);

  // ─── Auth Guard Logic ────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      // Not authenticated - redirect to login unless already in auth group
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Wait for profile to be fetched before routing by role
      if (!profile) {
        return;
      }

      // Authenticated - redirect to role-based dashboard if in auth group
      if (inAuthGroup) {
        switch (role) {
          case 'student':
            router.replace('/(student)/');
            break;
          case 'teacher':
            router.replace('/(teacher)/');
            break;
          case 'parent':
            router.replace('/(parent)/');
            break;
          case 'admin':
            router.replace('/(admin)/');
            break;
          default:
            router.replace('/(auth)/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, role, profile, segments, router]);

  return (
    <>
      {children}
      <NotificationSoftAsk
        visible={showSoftAsk && isAuthenticated && !!profile}
        role={(role as UserRole) ?? 'student'}
        onEnable={handleEnableNotifications}
        onDismiss={dismissSoftAsk}
      />
      <InAppBanner
        notification={bannerNotification}
        onPress={handleBannerPress}
        onDismiss={handleBannerDismiss}
      />
    </>
  );
}
