# Tasks — Quran School MVP Roadmap

> Feature-driven phases. Update status as work progresses.
> `[ ]` = pending | `[x]` = done | `[-]` = skipped

---

## Phase 1: Foundations

- [ ] Initialize fresh Expo project (SDK 54, TypeScript, Expo Router v6)
- [ ] Set up project structure (app/, src/features/, src/components/, src/lib/, src/stores/, src/theme/, src/i18n/, src/types/)
- [ ] Configure path aliases (`@/` -> `./src/`) in tsconfig.json
- [ ] Design system tokens (colors, typography, spacing, radius, shadows)
- [ ] Shared UI components: Button, IconButton, TextField, Card, Badge, Avatar, SearchBar, Dropdown, DatePicker, BottomSheet, Divider
- [ ] Feedback components: LoadingSpinner, SkeletonLoader, EmptyState, ErrorState, Toast
- [ ] Layout components: Screen (SafeArea + scroll), Section, KeyboardAwareView
- [ ] i18n setup (i18next + expo-localization + en.json + ar.json) with RTL switching
- [ ] Supabase project setup + local dev config
- [ ] Database schema migration — all tables including `schools` (multi-tenant)
- [ ] RLS policies for all tables (school-scoped via `get_user_school_id()`)
- [ ] Supabase client init (`src/lib/supabase.ts`) + auto-generated types
- [ ] TanStack Query client setup (`src/lib/queryClient.ts`)
- [ ] Zustand stores: authStore, themeStore, localeStore
- [ ] Auth feature: login, register, forgot-password screens
- [ ] Auth service: Supabase auth calls + session management (expo-secure-store)
- [ ] Role-based route protection in root `_layout.tsx`
- [ ] Onboarding screen (role selection on first login)

## Phase 2: Core Loop — Admin + Teacher

### Admin
- [ ] Admin layout (drawer or tab navigator)
- [ ] Admin dashboard (quick stats, school health, quick actions)
- [ ] Students CRUD (list, create, detail, edit, deactivate)
- [ ] Teachers CRUD (list, create, detail, edit, deactivate)
- [ ] Classes CRUD (list, create, detail, edit, student/teacher assignment)
- [ ] Bulk attendance (select class -> mark all students)
- [ ] Simple reports/analytics (attendance trends, performance distribution)

### Teacher
- [ ] Teacher layout (bottom tab navigator)
- [ ] Teacher dashboard (check-in/out, today overview, alerts)
- [ ] Student list + detail (class students, search, performance charts)
- [ ] Top performers + needs-support views
- [ ] Session logging (create/edit: student, date, lesson, scores, notes, homework)
- [ ] Award stickers (student selector, sticker picker, reason)

## Phase 3: Core Loop — Student + Parent

### Student
- [ ] Student layout (bottom tab navigator)
- [ ] Student dashboard (greeting, progress ring, homework card, quick actions, achievements)
- [ ] Lessons list + detail (grouped by status, progress bar)
- [ ] Sessions history + detail (past evaluations)
- [ ] Stickers page (grid, locked/unlocked, category breakdown)
- [ ] Trophy room (earned + locked with criteria + progress)
- [ ] Leaderboard (class top 10, weekly/all-time toggle)
- [ ] Levels + streaks display

### Parent
- [ ] Parent layout (bottom tab navigator)
- [ ] Parent dashboard (child cards, recent activity timeline)
- [ ] Children overview + child detail (progress, sessions, stickers summary)
- [ ] Attendance calendar (monthly, color-coded)
- [ ] Class standing (anonymous rank, trend indicator)

## Phase 4: Polish & Ship

- [ ] i18n completion — all strings for all screens in en.json + ar.json
- [ ] Full RTL testing pass (every screen in Arabic)
- [ ] Error handling: typed errors in services, ErrorState on all screens
- [ ] Loading states: skeleton loaders on all list/detail screens
- [ ] Empty states: guided messaging on all empty screens
- [ ] Form validation: zod schemas for all forms
- [ ] Performance audit (FlashList everywhere, expo-image, staleTime tuning)
- [ ] Multi-tenant verification (create 2 schools, verify complete data isolation)
- [ ] EAS Build config (eas.json) + test on physical iOS + Android devices
- [ ] Final QA pass

---

## Progress Log

| Date       | Phase | What                                    |
|------------|-------|-----------------------------------------|
| 2026-02-07 | —     | Memory-bank source of truth created     |
