# Quran School

A multi-tenant mobile platform for Quran schools to manage students, track memorization progress, handle attendance, schedule sessions, and gamify learning.

## Overview

Quran School is a companion tool for Quran learning — it does **not** contain Quran text, but references Quran metadata (surah, juz, rub' mappings) for progress tracking. Built for teachers, students, parents, and school administrators.

The app is fully bilingual (English and Arabic) with complete RTL support, and runs on iOS, Android, and web.

## Features

**Students** — Dashboard, memorization tracking, revision scheduler with freshness heatmap, Quran journey map (rub' progress), session history, sticker collection, leaderboard, schedule view.

**Teachers** — Class management, session evaluation workspace (scores 1-5 for memorization, tajweed, recitation quality), bulk attendance marking, sticker awarding, student progress tracking, work schedule and GPS/WiFi check-in, recitation plan management.

**Parents** — Multi-child dashboard, attendance calendar, memorization progress, class standing comparison, session details, schedule view.

**Admins** — Full school management (CRUD for students, teachers, parents, classes), reports (attendance trends, score trends, teacher activity, session completion, memorization stats), sticker management, work attendance oversight, school settings (location verification, permissions).

**Platform** — Push notifications, real-time updates, gamification (stickers, levels, leaderboard), multi-tenant school isolation via RLS, spaced repetition for revision scheduling.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo (React Native) | ~54 |
| Language | TypeScript (strict mode) | 5.9 |
| Runtime | React Native | 0.81 |
| React | React | 19 |
| Routing | Expo Router | v6 |
| Server State | TanStack Query | 5 |
| Client State | Zustand | 5 |
| Forms | react-hook-form + zod | 7 + 4 |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions, Storage) | JS v2 |
| i18n | i18next + react-i18next | 25 / 16 |
| Animations | react-native-reanimated | 4 |
| Lists | @shopify/flash-list | 2 |
| Charts | victory-native | 41 |
| Bottom Sheets | @gorhom/bottom-sheet | 5 |

## Architecture Overview

```
  Mobile App (Expo)
  +-- app/             Expo Router (file-based routing, role-based groups)
  +-- src/features/    Feature modules (hooks -> services -> Supabase)
  +-- src/stores/      Zustand (client state: auth, locale, theme)
  +-- src/components/  Shared UI primitives
          |
          | Supabase JS Client (typed)
          v
  Supabase Backend
  +-- PostgreSQL       20 tables, ~120 RLS policies, 16+ functions
  +-- Auth             Synthetic emails (user@school-slug.app)
  +-- Realtime         Role-based change subscriptions
  +-- Edge Functions   6 Deno functions (school/member management, notifications)
  +-- Storage          Sticker/reward image buckets
```

See [memory-bank/docs/ARCHITECTURE.md](memory-bank/docs/ARCHITECTURE.md) for the full deep-dive.

## Quick Start

**Prerequisites**: Node.js >= 18, Docker Desktop, Supabase CLI

```bash
# 1. Clone and install
git clone <repo-url>
cd quran-school
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — values come from step 3

# 3. Start local Supabase (requires Docker)
supabase start
# Copy the printed anon key into your .env

# 4. Apply migrations and seed data
supabase db reset

# 5. Start the app
npm start
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

See [memory-bank/docs/SETUP.md](memory-bank/docs/SETUP.md) for the full walkthrough including creating your first school, test users, remote Supabase setup, and troubleshooting.

## Project Structure

```
app/                        Expo Router — file-based routing
  (auth)/                   Login, create-school screens
  (student)/                Student tabs + standalone screens
  (teacher)/                Teacher tabs + session workspace
  (parent)/                 Parent tabs + child detail screens
  (admin)/                  Admin stack screens (CRUD, reports, settings)
  _layout.tsx               Root layout (providers, auth guard, realtime, notifications)

src/
  components/               Shared UI: ui/, forms/, lists/, layout/, feedback/
  features/                 18 feature modules, each with:
    <name>/                   hooks/ services/ components/ types/ utils/ index.ts
  hooks/                    Global hooks (useAuth, useRTL, useRole, useRoleTheme, ...)
  lib/                      Supabase client, queryClient, constants, quran-metadata
  stores/                   Zustand stores (auth, locale, theme, ui, workspaceDraft)
  theme/                    Design tokens (colors, typography, spacing, radius, shadows)
  types/                    Global types (database.types.ts, common.types.ts)
  i18n/                     Translations: en.json, ar.json, config.ts

supabase/
  migrations/               SQL migrations (consolidated schema ~1800 lines)
  functions/                6 Edge Functions (Deno/TypeScript)
  types/                    Auto-generated database types
  config.toml               Local Supabase config (ports, auth, realtime)
```

Feature modules: `attendance`, `auth`, `children`, `classes`, `dashboard`, `gamification`, `memorization`, `notifications`, `parents`, `profile`, `realtime`, `reports`, `scheduling`, `schools`, `sessions`, `students`, `teachers`, `work-attendance`.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Build and run on iOS Simulator |
| `npm run android` | Build and run on Android emulator |
| `npm run web` | Start web version |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Documentation

| Document | Contents |
|---|---|
| [Architecture](memory-bank/docs/ARCHITECTURE.md) | Data flow, feature modules, state management, routing, auth, multi-tenancy, realtime, i18n/RTL, theme, type safety |
| [Setup Guide](memory-bank/docs/SETUP.md) | Prerequisites, local Supabase, environment, running the app, creating schools/users, EAS builds, troubleshooting |
| [Contributing](memory-bank/docs/CONTRIBUTING.md) | Code conventions, naming, commits, PRs, how to add features/migrations/edge functions/translations, testing |
| [Database](memory-bank/docs/DATABASE.md) | Schema overview (20 tables), entity relationships, RLS model, functions, migration workflow, type generation |

## License

[MIT](LICENSE)
