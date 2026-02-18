import 'react-native-reanimated';
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';

import { useAuthStore, type Profile } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import i18n from '@/i18n/config';
import { supabase } from '@/lib/supabase';

// ─── Keep Splash Screen Visible ──────────────────────────────────────────────

SplashScreen.preventAutoHideAsync();

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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
  const { isAuthenticated, isLoading, role } = useAuth();
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
  }, [isAuthenticated, isLoading, role, segments, router]);

  return <>{children}</>;
}
