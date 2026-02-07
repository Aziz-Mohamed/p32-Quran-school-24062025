import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Database } from '@/types/database.types';

// ─── Custom Storage Adapter ─────────────────────────────────────────────────
//
// Uses expo-secure-store on native platforms for encrypted token storage.
// Falls back to localStorage on web.
// ─────────────────────────────────────────────────────────────────────────────

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ─── Environment Variables ──────────────────────────────────────────────────

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'YOUR_SUPABASE_URL';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR_SUPABASE_ANON_KEY';

// ─── Supabase Client ────────────────────────────────────────────────────────

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
