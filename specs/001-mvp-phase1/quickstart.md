# Quickstart: Quran School MVP (Phase 1)

**Feature**: `001-mvp-phase1` | **Date**: 2026-02-08

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go on a physical device
- Supabase project (ID: `zngiszdfdowjvwxqmexl`, region: eu-west-1)
- Supabase CLI (for deploying Edge Functions)

## Environment Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd p32-Quran-school-24062025
git checkout 001-mvp-phase1
npm install
```

### 2. Environment variables

Create `.env` (or use `app.config.ts` extra):

```env
EXPO_PUBLIC_SUPABASE_URL=https://zngiszdfdowjvwxqmexl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

These are loaded by `src/lib/supabase.ts` via the Expo config.

### 3. Database schema

The schema is already applied via `supabase/migrations/00001_initial_schema.sql`. To apply the username + points migration:

```bash
# If using Supabase CLI locally:
supabase db push

# Or apply via MCP / Supabase dashboard
```

### 4. Edge Functions

Deploy the 3 Edge Functions required for auth:

```bash
supabase functions deploy create-school
supabase functions deploy create-member
supabase functions deploy reset-member-password
```

Each function needs `SUPABASE_SERVICE_ROLE_KEY` set as a secret:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Development

### Start the dev server

```bash
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go.

### Key commands

| Command | Purpose |
|---------|---------|
| `npx expo start` | Start development server |
| `npx expo start --clear` | Start with cleared Metro cache |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

### Regenerate types after schema changes

After any migration, regenerate TypeScript types:

```bash
npx supabase gen types typescript --project-id zngiszdfdowjvwxqmexl > src/types/database.types.ts
```

## Project Architecture

### Routing

Expo Router v6 with file-based routing. Route groups map to roles:

```
app/(auth)/     → Login, Create School (unauthenticated)
app/(student)/  → Student tabs + detail screens
app/(teacher)/  → Teacher tabs + detail screens
app/(parent)/   → Parent tabs + detail screens
app/(admin)/    → Admin dashboard + management screens
```

`AuthGuard` in `app/_layout.tsx` handles role-based routing automatically.

### Feature modules

Each feature in `src/features/<name>/` contains:

```
<feature>/
├── hooks/          → useXxx React Query hooks
├── services/       → xxx.service.ts (Supabase SDK calls)
├── types/          → xxx.types.ts
├── components/     → Feature-specific components
└── index.ts        → Barrel export
```

### Data flow

```
Screen → useXxxHook (TanStack Query) → xxxService (Supabase SDK) → PostgreSQL (RLS enforced)
                                                                        ↓
                                                              DB Triggers (points/levels)
```

### State management

| Layer | Tool | What it stores |
|-------|------|---------------|
| Server state | TanStack Query | All database data (sessions, students, classes, etc.) |
| Auth state | Zustand (authStore) | Session, profile, isAuthenticated |
| UI preferences | Zustand (themeStore, localeStore) | Theme mode, locale, RTL flag |
| Secure storage | expo-secure-store | Auth tokens (managed by Supabase client) |
| Preferences | AsyncStorage | Persisted Zustand stores, last school slug |

## Testing the Full Flow

### Manual testing sequence

1. **Create a school**: Open app → "Create a School" → Fill name + your details → Verify admin dashboard loads
2. **Create a teacher**: Admin → Teachers → Create → Fill name → Note generated username → Set password → Save
3. **Create a class**: Admin → Classes → Create → Name + assign teacher → Save
4. **Create students**: Admin → Students → Create → Fill name → Assign class → Set password → Save (repeat for a few)
5. **Link parent**: Admin → Students → Create parent account → Link to student(s)
6. **Log in as teacher**: Logout → Login with teacher credentials → Verify teacher dashboard
7. **Create a session**: Teacher → Log Session → Select student → Fill scores → Add homework → Save → Verify points update
8. **Award sticker**: Teacher → Award Sticker → Select student → Pick sticker → Confirm
9. **Log in as student**: Logout → Login as student → Verify dashboard shows level, homework, stickers
10. **Check leaderboard**: Student → Leaderboard → Verify ranking
11. **Mark attendance**: Login as admin → Attendance → Select class → Mark all present → Submit
12. **Log in as parent**: Logout → Login as parent → Verify child card, attendance calendar, class standing

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout, providers, AuthGuard |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/queryClient.ts` | TanStack Query configuration |
| `src/lib/constants.ts` | App constants, points table, levels |
| `src/lib/helpers.ts` | Utility functions |
| `src/stores/authStore.ts` | Auth state management |
| `src/features/auth/` | Auth hooks, service, types, components |
| `src/components/` | Shared UI, layout, feedback, form components |
| `src/hooks/` | Shared hooks (useAuth, useRole, useRTL, etc.) |
| `src/theme/` | Colors, typography, spacing, radius, shadows |
| `src/i18n/` | i18n config, en.json, ar.json |
| `src/types/database.types.ts` | Auto-generated Supabase types |
| `supabase/migrations/` | Database migrations |
