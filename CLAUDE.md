# Project Rules

## Git Commits

- NEVER commit, push, or create PRs unless the user explicitly asks you to. Always wait for user review and approval first.
- NEVER add "Co-Authored-By: Claude" or any similar attribution line to commit messages.
- NEVER mention Claude, AI, or any AI assistant in commit messages, PR descriptions, or code comments.
- Write commit messages as if a human developer wrote them.

## Active Technologies
- TypeScript 5.9 (strict mode) / React Native 0.83 / React 19 + Expo ~54, Expo Router v6, TanStack Query 5, Zustand 5, Supabase JS 2, react-hook-form 7 + zod 4, react-native-reanimated 4, i18next + react-i18next, FlashList 2, expo-image 3, react-native-calendars, victory-native, @gorhom/bottom-sheet 5 (001-mvp-phase1)
- Supabase PostgreSQL (remote), expo-secure-store (auth tokens), AsyncStorage (preferences) (001-mvp-phase1)
- TypeScript 5.9 (strict mode) + React Native 0.83, Expo ~54, Expo Router v6, TanStack Query 5, victory-native 41.20.2, Supabase JS 2 (002-reports-analytics)
- Supabase PostgreSQL (remote) — existing tables: sessions, attendance, students, student_stickers, classes, profiles, levels (002-reports-analytics)
- TypeScript 5.9 (strict mode) + `@supabase/supabase-js` v2 (Realtime built-in), `@tanstack/react-query` v5, Expo ~54, React Native 0.83 (003-realtime-updates)
- No new storage — subscribes to existing Supabase PostgreSQL tables via Realtime (003-realtime-updates)

## Recent Changes
- 001-mvp-phase1: Added TypeScript 5.9 (strict mode) / React Native 0.83 / React 19 + Expo ~54, Expo Router v6, TanStack Query 5, Zustand 5, Supabase JS 2, react-hook-form 7 + zod 4, react-native-reanimated 4, i18next + react-i18next, FlashList 2, expo-image 3, react-native-calendars, victory-native, @gorhom/bottom-sheet 5
