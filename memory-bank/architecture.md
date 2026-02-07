# Architecture — Quran School

> Condensed architecture reference. Full details in `prd.md` sections 3-8, 12.

## Philosophy

**Feature-driven, Expo-native.** Minimal abstraction layers, maximum colocation.

- File-based routing via Expo Router v6
- Feature colocation — each feature keeps its hooks, components, types, and services together
- TanStack Query for server state (caching, retries, loading/error states)
- Zustand for lightweight client state (auth, theme, locale)
- Supabase SDK directly in service files
- TypeScript interfaces for all entities

## Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Expo (managed workflow) | SDK 54 |
| Runtime | React Native + Hermes | 0.83 |
| Routing | Expo Router (file-based) | v6 |
| Language | TypeScript (strict) | 5.9 |
| Server State | TanStack Query | v5 (5.90+) |
| Client State | Zustand | v5 (5.0+) |
| Backend | Supabase (Auth, DB, Storage, Realtime, Edge Functions) | 2.95+ |
| Forms | react-hook-form + zod | 7.71+ / 4.3+ |
| Animations | react-native-reanimated | v4 (4.2+) |
| i18n | i18next + react-i18next + expo-localization | 25.8+ / 16.5+ / 17.0+ |
| Lists | @shopify/flash-list | 2.2+ |
| Images | expo-image | 3.0+ |
| Icons | @expo/vector-icons (Ionicons, MaterialCommunityIcons) | latest |
| Secure Storage | expo-secure-store | 15.0+ |
| Bottom Sheet | @gorhom/bottom-sheet | 5.2+ |
| Calendar | react-native-calendars | 1.1314+ |
| Charts | victory-native | 41.20+ |

## Project Structure

```
quran-school/
├── app/                          # Expo Router — screens & layouts only
│   ├── _layout.tsx               # Root: providers, fonts, auth guard
│   ├── index.tsx                 # Entry redirect
│   ├── (auth)/                   # Auth screens (stack)
│   ├── (student)/                # Student screens (tabs + stack)
│   ├── (teacher)/                # Teacher screens (tabs + stack)
│   ├── (parent)/                 # Parent screens (tabs + stack)
│   ├── (admin)/                  # Admin screens (drawer + stack)
│   └── +not-found.tsx
│
├── src/
│   ├── features/                 # Feature modules (colocated)
│   │   ├── auth/                 # hooks/, services/, types/, components/
│   │   ├── dashboard/
│   │   ├── lessons/
│   │   ├── sessions/
│   │   ├── gamification/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── attendance/
│   │   ├── reports/
│   │   ├── children/
│   │   └── profile/
│   │
│   ├── components/               # Shared UI
│   │   ├── ui/                   # Button, Card, TextField, SearchBar, etc.
│   │   ├── feedback/             # SkeletonLoader, EmptyState, Toast, etc.
│   │   └── layout/               # Screen, Section, KeyboardAwareView
│   │
│   ├── hooks/                    # Shared hooks (useAuth, useRole, useRTL, etc.)
│   ├── lib/                      # supabase.ts, queryClient.ts, constants, validators, formatters
│   ├── stores/                   # Zustand (authStore, themeStore, localeStore)
│   ├── types/                    # database.types.ts, navigation.types.ts, common.types.ts
│   ├── theme/                    # colors, typography, spacing, radius, shadows
│   └── i18n/                     # config.ts, en.json, ar.json
│
├── assets/                       # images/, fonts/, stickers/, trophies/
├── supabase/                     # migrations/, config.toml, seed.sql
├── memory-bank/                  # Source of truth docs
└── package.json
```

## Key Patterns

### Data Flow

```
Screen (app/) → Feature Hook (src/features/X/hooks/) → Service (src/features/X/services/) → Supabase
                     ↕                                        ↕
              TanStack Query (cache)                   Database + RLS
```

- **Screens** call feature hooks only — no direct Supabase calls in screens
- **Hooks** use TanStack Query (`useQuery` / `useMutation`) wrapping services
- **Services** call Supabase SDK directly, return typed data
- **Zustand** for client-only state (auth session, theme, locale)
- **Components are pure** — business logic lives in hooks, not components

### Multi-Tenant Pattern

- `schools` table is the root entity
- Every data table has `school_id UUID NOT NULL REFERENCES schools(id)`
- RLS policies filter by `school_id` using helper: `get_user_school_id()`
- App stores current `school_id` in auth context after login
- All queries implicitly scoped to school via RLS — no manual filtering in app code

### Auth Flow

```
App Launch → Check Session → No Session → (auth)/login
                           → Has Session → Fetch Profile (role + school_id)
                                         → Route to /(role)/
```

- Session token stored in `expo-secure-store`
- Profile includes `role` + `school_id`
- Root `_layout.tsx` handles redirect logic based on auth state and role
- DB trigger creates `profiles` row on signup with role and school_id

### RTL Strategy

- **Logical CSS everywhere**: `paddingStart`, `marginEnd`, `flexDirection: 'row'` (auto-flips)
- **Never** use `paddingLeft`, `marginRight`, `left`, `right`
- Language switch triggers `I18nManager.forceRTL()` + `Updates.reloadAsync()`
- Include Arabic-compatible fonts (Noto Sans Arabic, IBM Plex Arabic)
- Directional icons flip using `I18nManager.isRTL`

### Performance Rules

| Rule | Implementation |
|------|---------------|
| Lists | `FlashList` (never FlatList) |
| Images | `expo-image` (never RN Image) |
| Loading | Skeleton loaders (never spinners) |
| Caching | TanStack Query `staleTime: 5min` default |
| Heavy screens | `React.lazy` + `Suspense` |
| Fonts | Preloaded in root layout splash |
| Bundle | Hermes bytecode + tree-shaking |

### Code Rules

1. TypeScript strict — no `any` types
2. All text through i18n — no hardcoded strings
3. Logical CSS only — no `left`/`right`
4. Every list uses FlashList
5. Every image uses expo-image
6. Every form uses react-hook-form + zod
7. No inline styles for reusable patterns — use StyleSheet.create
8. Services never throw raw errors — typed error handling
9. Query keys follow `[feature, ...params]` convention
10. Components are pure — logic in hooks
