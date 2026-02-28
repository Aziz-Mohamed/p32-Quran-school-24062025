# Architecture

## Philosophy and Principles

1. **Feature-driven colocation**: Each feature module is self-contained with its own hooks, services, components, types, and utils. No scattering related code across the tree.

2. **Type safety end-to-end**: Auto-generated `database.types.ts` flows through services, hooks, and into component props. No `any` escape hatches.

3. **Server state vs client state**: Remote data lives in TanStack Query (caching, retries, staleness). Local-only state lives in Zustand (auth, locale, theme). Never mix the two.

4. **Security at the database layer**: All access control is enforced via PostgreSQL RLS policies, not application code. The app trusts the database to reject unauthorized requests.

5. **Multi-tenancy by default**: Every data table is scoped by `school_id`. RLS ensures a user can never read or write data from another school.

6. **No Quran text**: The app is a companion tool for Quran learning. It tracks progress using Quran metadata (surah/juz/rub' mappings) but never stores or displays Quran text itself.

## Data Flow

```
User Action (tap button, submit form)
    |
    v
React Component
    | calls hook
    v
TanStack Query Hook (useQuery / useMutation)
    | delegates to
    v
Service (class-based singleton)
    | calls
    v
Supabase JS Client (typed with Database generic)
    | sends HTTP request
    v
Supabase PostgREST / Auth / Edge Functions
    | passes through
    v
PostgreSQL + RLS Policies
    | get_user_school_id() + get_user_role()
    v
Response --> Service --> Hook --> Component re-renders
```

**Concrete example** — marking attendance:

1. `AttendanceScreen` calls `useMarkBulkAttendance()` mutation
2. Hook calls `attendanceService.markBulkAttendance(records, schoolId, markedBy)`
3. Service calls `supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' })`
4. PostgREST routes to PostgreSQL; RLS checks `school_id = get_user_school_id()` and role is teacher/admin
5. Upsert succeeds (or is rejected by RLS)
6. On success, hook invalidates `['attendance']` query keys, triggering a refetch

## Feature Module Structure

Every feature in `src/features/` follows this canonical shape:

```
src/features/<name>/
  components/          # Feature-specific React components (PascalCase.tsx)
  hooks/               # TanStack Query hooks (use<Entity>.ts)
  services/            # Supabase API calls (<name>.service.ts)
  types/               # Feature-specific types (<name>.types.ts)
  utils/               # Pure utility functions
  index.ts             # Barrel exports (public API of the feature)
```

Rules:
- **`index.ts` is the only import target** for external consumers (screens in `app/`).
- Services are class-based singletons: `export const fooService = new FooService()`.
- Hooks wrap services with TanStack Query — `useQuery` for reads, `useMutation` for writes.
- Types derive from `database.types.ts` wherever possible using `Tables<'table_name'>`.

### Current Features (18 modules)

| Feature | Scope |
|---|---|
| `auth` | Login, logout, school creation, member management |
| `attendance` | Mark/view student attendance |
| `classes` | Class CRUD, teacher assignment |
| `children` | Parent's child management |
| `dashboard` | Role-specific dashboard data |
| `gamification` | Stickers, certifications, leaderboard, journey map |
| `memorization` | Recitations, assignments, progress, revision schedule |
| `notifications` | Push tokens, preferences, in-app banner |
| `parents` | Parent management |
| `profile` | User profile editing |
| `realtime` | Supabase Realtime subscriptions |
| `reports` | Analytics (attendance, scores, teacher activity, sessions) |
| `scheduling` | Class schedules, scheduled sessions, recitation plans |
| `schools` | School settings, location config |
| `sessions` | Session details, check-in |
| `students` | Student management, top performers, needs support |
| `teachers` | Teacher management, insights |
| `work-attendance` | Teacher GPS/WiFi check-in |

## State Management

### Server State — TanStack Query

All remote data is fetched and cached via TanStack Query hooks in feature modules.

**Configuration** (`src/lib/queryClient.ts`):
- `staleTime`: 5 minutes
- `gcTime`: 10 minutes
- `retry`: 2

**Query key convention**: `['entity-name', ...params]`

Examples:
```typescript
['attendance', classId, date]
['memorization-progress', { studentId, status }]
['student-dashboard']
['recitations', 'session', sessionId]
```

**Mutation pattern**: On success, invalidate related query keys:
```typescript
useMutation({
  mutationFn: (input) => service.create(input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['recitations'] });
    queryClient.invalidateQueries({ queryKey: ['memorization-progress'] });
  },
});
```

### Client State — Zustand

Five stores for local-only state:

| Store | Purpose | Persistence |
|---|---|---|
| `authStore` | Session, profile, schoolSlug, isAuthenticated | AsyncStorage (profile + slug only; session is in SecureStore via Supabase) |
| `localeStore` | Language (en/ar), isRTL | AsyncStorage |
| `themeStore` | Dark/light mode | AsyncStorage |
| `uiStore` | Ephemeral UI state (e.g., open modal count) | None |
| `workspaceDraftStore` | Teacher session workspace auto-save | AsyncStorage (auto-clears after 7 days) |

## Routing Architecture

File-based routing with Expo Router v6. Routes are organized into role-based groups:

```
app/
  _layout.tsx              # Root: QueryProvider, AuthGuard, Realtime, Notifications
  index.tsx                # Entry: redirects to role-specific dashboard
  +not-found.tsx           # 404 handler
  (auth)/
    login.tsx              # Username + school slug + password
    create-school.tsx      # Create new school + admin account
  (student)/
    (tabs)/                # Bottom tab navigation
      index.tsx            # Student dashboard
      memorization.tsx     # Memorization tracking
      revision.tsx         # Revision schedule (spaced repetition)
      journey.tsx          # Quran journey map (rub' progress)
      profile.tsx          # Student profile
    sessions/[id].tsx      # Session detail
    schedule/              # Class schedule views
    leaderboard.tsx        # Class leaderboard
  (teacher)/
    (tabs)/                # Bottom tab navigation
      index.tsx            # Teacher dashboard
      sessions.tsx         # Session management
      students.tsx         # Student list
      class-progress.tsx   # Class progress overview
      profile.tsx          # Teacher profile
    schedule/[id]/
      index.tsx            # Schedule detail
      workspace.tsx        # Session workspace (attendance, evaluation, recitations)
    students/[id].tsx      # Student detail
    awards/                # Sticker awarding
    assignments/create.tsx # Create memorization assignments
  (parent)/
    (tabs)/                # Bottom tab navigation
      index.tsx            # Parent dashboard
      children.tsx         # Children list
      settings.tsx         # Settings
    children/[id].tsx      # Child detail
    attendance/[childId]   # Child attendance calendar
    progress/[childId]     # Child progress
    memorization/[childId] # Child memorization details
  (admin)/
    index.tsx              # Admin dashboard
    students/              # CRUD + detail views
    teachers/              # CRUD + detail + work schedule
    parents/               # CRUD + detail views
    classes/               # CRUD + detail + schedule
    attendance/            # Attendance marking
    work-attendance/       # Teacher work attendance
    reports/               # Analytics dashboards
    settings/              # School location, permissions
    stickers/              # Sticker management
    members/               # Password reset
```

The `_layout.tsx` at the root acts as an auth guard:
- Unauthenticated users are redirected to `(auth)/login`
- Authenticated users are redirected to their role's dashboard: `(student)/`, `(teacher)/`, `(parent)/`, or `(admin)/`

## Authentication Flow

### Login

1. User enters: **username**, **password**, **school slug**
2. App builds synthetic email: `{username}@{school-slug}.app`
3. Calls `supabase.auth.signInWithPassword({ email, password })`
4. On success: session stored in SecureStore (native) / localStorage (web)
5. Profile fetched from `profiles` table, stored in Zustand `authStore`
6. AuthGuard in `_layout.tsx` redirects to role-based dashboard

### School Creation

1. `create-school` Edge Function (no auth required)
2. Creates school record + admin auth user (with `handle_new_profile` trigger creating the profile)
3. Returns session — user is automatically signed in as admin

### Member Creation (Admin Only)

1. Admin calls `create-member` Edge Function with fresh JWT
2. Edge Function uses `service_role` key to create auth user + profile
3. Username uniqueness is checked per-school (`UNIQUE(school_id, username)`)

### Token Storage

| Platform | Storage | Security |
|---|---|---|
| iOS | expo-secure-store (Keychain) | Hardware-encrypted |
| Android | expo-secure-store (Keystore) | Hardware-encrypted |
| Web | localStorage | Standard browser storage |

Supabase handles auto-refresh of JWT tokens via `autoRefreshToken: true`.

## Multi-Tenancy Model

```
                    school_id
                       |
  schools <--FK-- profiles <--FK-- students <--FK-- sessions
     |                                 |               |
     |                                 +--< attendance  +--< recitations
     |                                 +--< student_stickers
     |                                 +--< memorization_progress
     |
     +--< classes <--FK-- class_schedules
     +--< scheduled_sessions
     +--< teacher_checkins
```

Within a school, data is further scoped by role:
- **Admin**: sees all data within their school
- **Teacher**: sees only their own classes and students
- **Parent**: sees only their own children
- **Student**: sees only their own records

This scoping is enforced entirely at the database level via RLS policies.

## Realtime Architecture

Uses Supabase Realtime (PostgreSQL logical replication) to push changes to connected clients.

**Setup**: `useRealtimeManager` in the root `_layout.tsx` creates role-specific subscription profiles.

**How it works**:

1. On login, a Supabase Realtime channel is created based on the user's role
2. The channel subscribes to `postgres_changes` events on relevant tables
3. When a change arrives, the handler checks `mutationTracker` (deduplication)
4. If not a duplicate (i.e., not caused by the current user's own mutation), it triggers TanStack Query invalidation
5. Invalidation is debounced at 500ms to batch rapid changes

**Mutation deduplication**: When a mutation succeeds, the record ID is stored in `mutationTracker`. If a realtime event arrives for that same record ID shortly after, it's skipped to avoid double-invalidation.

**Catch-up**: When the channel reaches `SUBSCRIBED` status, all relevant query keys are invalidated to cover any events missed during connection setup.

## i18n and RTL

### Setup

- Library: `i18next` + `react-i18next`
- Languages: English (`en`), Arabic (`ar`)
- Translation files: `src/i18n/en.json` (~52KB, ~1200 keys), `src/i18n/ar.json` (~64KB)
- Key convention: `feature.section.element` (e.g., `auth.loginButton`, `student.tabs.dashboard`)

### RTL Handling

RTL is managed at three levels:

1. **Native**: `I18nManager.forceRTL(true)` for native component mirroring (requires app restart)
2. **Root view**: `direction: 'rtl'` on the root `GestureHandlerRootView`
3. **Component-level**: `useRTL()` hook returns `isRTL` boolean for conditional styles

### Localized Database Fields

Tables with user-facing names use a JSONB `name_localized` column:

```json
{ "en": "Beginner Class", "ar": "فصل المبتدئين" }
```

Resolved in PostgreSQL via `resolve_localized_name(localized, fallback, lang)` and in the app via `useLocalizedName()` hook.

## Theme System

Design tokens live in `src/theme/`:

| File | Contents |
|---|---|
| `colors.ts` | Primary (emerald/green), secondary (amber/gold), accents, neutral, semantic, gamification, surfaces (light/dark) |
| `typography.ts` | Font families, sizes, weights, line heights, text styles |
| `spacing.ts` | 4px-based scale |
| `radius.ts` | Border radius tokens |
| `shadows.ts` | Cross-platform shadow strings |

### Shadow Rule

React Native shadows must use `boxShadow` (available since RN 0.76):

```typescript
// Correct
boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)'

// NEVER use — causes artifacts on Android
elevation: 4

// NEVER use — iOS only, doesn't work on Android
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
```

### Role-Specific Theming

`useRoleTheme()` hook returns colors based on the current user's role. Each role has a distinct primary color for visual differentiation.

## Type Safety Chain

```
PostgreSQL Schema (20 tables, constraints, functions)
    | supabase gen types typescript
    v
database.types.ts (auto-generated, ~60KB)
    | Tables<'table_name'>, TablesInsert<'...'>, TablesUpdate<'...'>
    v
Feature types (e.g., attendance.types.ts)
    | extends/picks from database types
    v
Services (typed Supabase queries)
    | returns typed responses
    v
Hooks (typed return values from useQuery/useMutation)
    | passes typed data
    v
Components (typed props)
```

The auto-generated types include:
- `Tables<'table_name'>`: Row type (for reading)
- `TablesInsert<'table_name'>`: Insert type (required + optional columns)
- `TablesUpdate<'table_name'>`: Update type (all columns optional)
- Function argument and return types for RPC calls
