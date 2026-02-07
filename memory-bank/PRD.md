# Product Requirements Document (PRD)
## Quran School — Expo React Native

**Version:** 5.0.0  
**Last Updated:** February 2026  
**Platform:** Expo (React Native) with Expo Router  
**Backend:** Supabase  
**Status:** Pre-Development  

---

## 1. Vision & Philosophy

### 1.1 Product Vision

A **delightful** Quran learning management app that children enjoy using, teachers find efficient, parents trust for transparency, and admins can rely on for school operations. The app does **not** contain the Quran itself — it is a companion tool for managing Quran recitation learning, tracking student progress, and connecting the four roles in a Quran school ecosystem.

### 1.2 Design Philosophy

> **"Intuitive, simple, smooth — never in the way."**

| For Users | For Developers |
|-----------|----------------|
| Zero learning curve | File-based routing (Expo Router) |
| Smooth transitions, minimal animation | Colocated features |
| Consistent RTL/LTR experience | TypeScript-first |
| Fast time-to-interaction | Supabase-native patterns |

### 1.3 Why Expo React Native?

| Requirement | Expo Solution |
|-------------|---------------|
| Rapid production delivery | Expo managed workflow, EAS Build, OTA updates |
| RTL/LTR consistency | Logical CSS properties (`paddingStart`, `marginEnd`, `flexDirection`) + `I18nManager` |
| Cross-platform | Single codebase for iOS & Android |
| Localization | `expo-localization` + `i18next` |
| Performance | Hermes engine, React Native New Architecture |
| Open source friendly | Familiar React ecosystem, large community |
| Backend integration | Supabase JS SDK works natively |

### 1.4 Animation Philosophy

**Principle: Smooth, not showy.**

- ✅ Use `react-native-reanimated` for layout transitions and shared element transitions
- ✅ Subtle micro-interactions: button press feedback, page transitions, pull-to-refresh
- ✅ Meaningful motion: progress indicators filling, achievement reveals
- ❌ No heavy Lottie/Rive animation packs
- ❌ No excessive confetti, particle effects, or full-screen celebrations
- ❌ No animation that blocks user interaction or slows navigation

Goal: The app should feel **alive and responsive**, not **animated and heavy**.

---

## 2. Core Roles & Features

### 2.1 Role Overview

| Role | Primary Purpose | Key Actions |
|------|----------------|-------------|
| **Student** | Learn & track progress | View lessons, see homework, collect stickers/trophies, check leaderboard |
| **Teacher** | Manage & evaluate | Log sessions, award stickers, track student progress, check-in |
| **Parent** | Monitor & support | View child progress, attendance, class standing |
| **Admin** | Operate the school | CRUD students/teachers/classes, bulk attendance, reports |

### 2.2 Feature Matrix by Role

#### Student Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard | Progress overview, current homework, quick actions, recent achievements | P0 |
| Lessons | Browse assigned lessons, view lesson details, track completion | P0 |
| Sessions History | View past session logs with teacher evaluations | P0 |
| Gamification | Stickers collection, trophy room, leaderboard, achievements, levels, streaks | P0 |
| Profile | View/edit student profile | P1 |

#### Teacher Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard | Today's overview, check-in, alerts for students needing attention | P0 |
| Student Management | View student list, student details, top performers, needs-support list | P0 |
| Session Management | Create/edit session logs with evaluations | P0 |
| Awards | Award stickers to students | P0 |
| Class Progress | Analytics on class performance | P1 |
| Profile | View/edit teacher profile | P1 |

#### Parent Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard | Overview of all children, recent activity | P0 |
| Children | View each child's detailed progress and session history | P0 |
| Attendance | Calendar view of child attendance | P0 |
| Class Standing | See child's rank in class | P1 |
| Settings | Notification preferences, account settings | P1 |

#### Admin Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard | Quick stats, school health overview | P0 |
| Students Management | Full CRUD for all students | P0 |
| Teachers Management | Full CRUD for all teachers | P0 |
| Classes Management | Create/edit classes, assign students and teachers | P0 |
| Attendance | Bulk attendance marking | P0 |
| Reports | School-wide analytics and reports | P1 |

---

## 3. Architecture Overview

### 3.1 Philosophy: Feature-Driven, Expo-Native

This architecture follows **Expo and React conventions**:

- **File-based routing** via Expo Router (replaces GoRouter)
- **Feature colocation** — each feature keeps its hooks, components, types, and services together
- **React Query (TanStack Query)** for server state (replaces Bloc for data fetching)
- **Zustand** for lightweight client state (replaces Bloc for UI state)
- **Supabase SDK** directly in service files (replaces repository pattern verbosity)
- **TypeScript interfaces** for entities (replaces domain entities/models split)

### 3.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          EXPO APP                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    EXPO ROUTER                            │   │
│  │           File-based routing + Layouts                    │   │
│  │                                                           │   │
│  │   (auth)         (student)      (teacher)                 │   │
│  │   (parent)       (admin)                                  │   │
│  │                                                           │   │
│  │   Each route group has its own _layout.tsx                │   │
│  │   with role-specific navigation (tabs, drawer, etc.)      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FEATURES                               │   │
│  │                                                           │   │
│  │   /features/auth          → hooks, services, types        │   │
│  │   /features/gamification  → hooks, services, types        │   │
│  │   /features/sessions      → hooks, services, types        │   │
│  │   /features/lessons       → hooks, services, types        │   │
│  │   ...etc                                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  SHARED LAYER                             │   │
│  │                                                           │   │
│  │   /components  → Reusable UI components                   │   │
│  │   /hooks       → Shared custom hooks                      │   │
│  │   /lib         → Supabase client, utils, constants        │   │
│  │   /stores      → Zustand stores (auth, theme, locale)     │   │
│  │   /types       → Shared TypeScript interfaces             │   │
│  │   /i18n        → i18next config, en.json, ar.json         │   │
│  │   /theme       → Design tokens, colors, spacing, typography│  │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SUPABASE                                │   │
│  │                                                           │   │
│  │   Auth │ Database │ Storage │ Realtime │ Edge Functions    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Why This Architecture?

| Benefit | Explanation |
|---------|-------------|
| **Minimal boilerplate** | TanStack Query handles caching, retries, loading/error states out of the box |
| **Colocated logic** | Each feature's hooks, services, types, and components live together |
| **Type-safe end-to-end** | Supabase auto-generates TypeScript types from your schema |
| **React-native patterns** | Hooks as use cases, Context for DI — idiomatic React |
| **File-based routing** | Convention over configuration. Routes are file paths. |
| **Fast iteration** | Less abstraction layers = faster feature development |

---

## 4. Project Structure

```
quran-school/
├── app/                                    # Expo Router — file-based routing
│   ├── _layout.tsx                         # Root layout (providers, fonts, splash)
│   ├── index.tsx                           # Entry redirect (→ auth or role dashboard)
│   │
│   ├── (auth)/                             # Auth group (no bottom nav)
│   │   ├── _layout.tsx                     # Stack layout for auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── onboarding.tsx
│   │
│   ├── (student)/                          # Student role group
│   │   ├── _layout.tsx                     # Tab navigator for student
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx                 # Bottom tab configuration
│   │   │   ├── index.tsx                   # Student Dashboard
│   │   │   ├── lessons.tsx                 # Lessons list
│   │   │   ├── stickers.tsx                # Stickers/Gamification
│   │   │   └── profile.tsx                 # Student profile
│   │   ├── lessons/
│   │   │   └── [id].tsx                    # Lesson detail
│   │   ├── sessions/
│   │   │   ├── index.tsx                   # Session history
│   │   │   └── [id].tsx                    # Session detail
│   │   ├── trophy-room.tsx                 # Trophy room
│   │   └── leaderboard.tsx                 # Leaderboard
│   │
│   ├── (teacher)/                          # Teacher role group
│   │   ├── _layout.tsx                     # Tab navigator for teacher
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx                   # Teacher Dashboard
│   │   │   ├── students.tsx                # Students list
│   │   │   ├── sessions.tsx                # Session log
│   │   │   └── profile.tsx                 # Teacher profile
│   │   ├── students/
│   │   │   ├── [id].tsx                    # Student detail
│   │   │   ├── top-performers.tsx
│   │   │   └── needs-support.tsx
│   │   ├── sessions/
│   │   │   ├── create.tsx                  # Create session
│   │   │   └── [id].tsx                    # Session detail/edit
│   │   ├── awards/
│   │   │   └── index.tsx                   # Award sticker page
│   │   └── class-progress.tsx              # Class analytics
│   │
│   ├── (parent)/                           # Parent role group
│   │   ├── _layout.tsx                     # Tab navigator for parent
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx                   # Parent Dashboard
│   │   │   ├── children.tsx                # Children overview
│   │   │   └── settings.tsx                # Parent settings
│   │   ├── children/
│   │   │   └── [id].tsx                    # Child detail
│   │   ├── attendance/
│   │   │   └── [childId].tsx               # Attendance calendar
│   │   └── class-standing/
│   │       └── [childId].tsx               # Class ranking
│   │
│   ├── (admin)/                            # Admin role group
│   │   ├── _layout.tsx                     # Drawer navigator for admin
│   │   ├── index.tsx                       # Admin Dashboard
│   │   ├── students/
│   │   │   ├── index.tsx                   # Students list
│   │   │   ├── create.tsx                  # Add student
│   │   │   └── [id]/
│   │   │       ├── index.tsx               # Student detail
│   │   │       └── edit.tsx                # Edit student
│   │   ├── teachers/
│   │   │   ├── index.tsx                   # Teachers list
│   │   │   ├── create.tsx                  # Add teacher
│   │   │   └── [id]/
│   │   │       ├── index.tsx               # Teacher detail
│   │   │       └── edit.tsx                # Edit teacher
│   │   ├── classes/
│   │   │   ├── index.tsx                   # Classes list
│   │   │   ├── create.tsx                  # Add class
│   │   │   └── [id]/
│   │   │       ├── index.tsx               # Class detail
│   │   │       └── edit.tsx                # Edit class
│   │   ├── attendance/
│   │   │   └── index.tsx                   # Bulk attendance
│   │   └── reports/
│   │       └── index.tsx                   # Reports & analytics
│   │
│   └── +not-found.tsx                      # 404 screen
│
├── src/
│   ├── features/                           # Feature modules (business logic)
│   │   │
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useRegister.ts
│   │   │   │   ├── useLogout.ts
│   │   │   │   └── useCurrentUser.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts         # Supabase auth calls
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts           # User, AuthToken interfaces
│   │   │   ├── components/
│   │   │   │   ├── AuthFormField.tsx
│   │   │   │   ├── RoleSelector.tsx
│   │   │   │   └── SocialLoginButtons.tsx
│   │   │   └── index.ts                    # Barrel export
│   │   │
│   │   ├── dashboard/
│   │   │   ├── hooks/
│   │   │   │   ├── useStudentDashboard.ts
│   │   │   │   ├── useTeacherDashboard.ts
│   │   │   │   ├── useParentDashboard.ts
│   │   │   │   └── useAdminDashboard.ts
│   │   │   ├── services/
│   │   │   │   └── dashboard.service.ts
│   │   │   ├── types/
│   │   │   │   └── dashboard.types.ts
│   │   │   ├── components/
│   │   │   │   ├── ProgressOverviewCard.tsx
│   │   │   │   ├── CurrentHomeworkCard.tsx
│   │   │   │   ├── QuickActionsGrid.tsx
│   │   │   │   ├── RecentAchievementsRow.tsx
│   │   │   │   ├── CheckInCard.tsx
│   │   │   │   ├── TodayOverviewCard.tsx
│   │   │   │   ├── AlertsSection.tsx
│   │   │   │   ├── ChildOverviewCard.tsx
│   │   │   │   ├── RecentActivityList.tsx
│   │   │   │   ├── QuickStatsGrid.tsx
│   │   │   │   └── WifiConfigCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── lessons/
│   │   │   ├── hooks/
│   │   │   │   ├── useLessons.ts
│   │   │   │   ├── useLessonDetail.ts
│   │   │   │   ├── useCompleteLesson.ts
│   │   │   │   └── useHomework.ts
│   │   │   ├── services/
│   │   │   │   └── lessons.service.ts
│   │   │   ├── types/
│   │   │   │   └── lessons.types.ts        # Lesson, LessonProgress, Homework
│   │   │   ├── components/
│   │   │   │   ├── LessonCard.tsx
│   │   │   │   ├── LessonProgressIndicator.tsx
│   │   │   │   └── HomeworkBanner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── sessions/
│   │   │   ├── hooks/
│   │   │   │   ├── useSessions.ts
│   │   │   │   ├── useSessionDetail.ts
│   │   │   │   ├── useCreateSession.ts
│   │   │   │   └── useUpdateSession.ts
│   │   │   ├── services/
│   │   │   │   └── sessions.service.ts
│   │   │   ├── types/
│   │   │   │   └── sessions.types.ts       # Session, SessionEntry
│   │   │   ├── components/
│   │   │   │   ├── SessionCard.tsx
│   │   │   │   ├── SessionForm.tsx
│   │   │   │   └── SessionLogTile.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── gamification/
│   │   │   ├── hooks/
│   │   │   │   ├── useStickers.ts
│   │   │   │   ├── useTrophies.ts
│   │   │   │   ├── useLeaderboard.ts
│   │   │   │   ├── useAchievements.ts
│   │   │   │   ├── useStudentRank.ts
│   │   │   │   └── useAwardSticker.ts
│   │   │   ├── services/
│   │   │   │   └── gamification.service.ts
│   │   │   ├── types/
│   │   │   │   └── gamification.types.ts   # Sticker, Trophy, Achievement, LeaderboardEntry, StudentLevel
│   │   │   ├── components/
│   │   │   │   ├── StickerGrid.tsx
│   │   │   │   ├── StickerCard.tsx
│   │   │   │   ├── TrophyDisplay.tsx
│   │   │   │   ├── AchievementBadge.tsx
│   │   │   │   ├── LeaderboardTile.tsx
│   │   │   │   ├── RankBadge.tsx
│   │   │   │   ├── PointsCounter.tsx
│   │   │   │   ├── LevelProgressRing.tsx
│   │   │   │   ├── StreakIndicator.tsx
│   │   │   │   ├── StudentSelector.tsx
│   │   │   │   └── StickerPicker.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── students/                       # Student management (teacher + admin)
│   │   │   ├── hooks/
│   │   │   │   ├── useStudents.ts
│   │   │   │   ├── useStudentDetail.ts
│   │   │   │   ├── useCreateStudent.ts
│   │   │   │   ├── useUpdateStudent.ts
│   │   │   │   └── useDeleteStudent.ts
│   │   │   ├── services/
│   │   │   │   └── students.service.ts
│   │   │   ├── types/
│   │   │   │   └── students.types.ts       # StudentSummary, StudentDetail, StudentAdmin
│   │   │   ├── components/
│   │   │   │   ├── StudentListTile.tsx
│   │   │   │   ├── StudentStatsCard.tsx
│   │   │   │   └── StudentForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── teachers/                       # Teacher management (admin)
│   │   │   ├── hooks/
│   │   │   │   ├── useTeachers.ts
│   │   │   │   ├── useCreateTeacher.ts
│   │   │   │   ├── useUpdateTeacher.ts
│   │   │   │   └── useDeleteTeacher.ts
│   │   │   ├── services/
│   │   │   │   └── teachers.service.ts
│   │   │   ├── types/
│   │   │   │   └── teachers.types.ts
│   │   │   ├── components/
│   │   │   │   └── TeacherForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── classes/                        # Class management (admin)
│   │   │   ├── hooks/
│   │   │   │   ├── useClasses.ts
│   │   │   │   ├── useCreateClass.ts
│   │   │   │   ├── useUpdateClass.ts
│   │   │   │   └── useAssignStudents.ts
│   │   │   ├── services/
│   │   │   │   └── classes.service.ts
│   │   │   ├── types/
│   │   │   │   └── classes.types.ts        # ClassEntity, ClassSchedule
│   │   │   ├── components/
│   │   │   │   ├── ClassForm.tsx
│   │   │   │   └── StudentAssignment.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── hooks/
│   │   │   │   ├── useAttendance.ts
│   │   │   │   └── useBulkAttendance.ts
│   │   │   ├── services/
│   │   │   │   └── attendance.service.ts
│   │   │   ├── types/
│   │   │   │   └── attendance.types.ts
│   │   │   ├── components/
│   │   │   │   ├── AttendanceCalendar.tsx
│   │   │   │   └── BulkAttendanceForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── hooks/
│   │   │   │   └── useReports.ts
│   │   │   ├── services/
│   │   │   │   └── reports.service.ts
│   │   │   ├── types/
│   │   │   │   └── reports.types.ts
│   │   │   ├── components/
│   │   │   │   ├── ReportCard.tsx
│   │   │   │   └── ChartWidgets.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── children/                       # Parent's children management
│   │   │   ├── hooks/
│   │   │   │   ├── useChildren.ts
│   │   │   │   └── useChildDetail.ts
│   │   │   ├── services/
│   │   │   │   └── children.service.ts
│   │   │   ├── types/
│   │   │   │   └── children.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── profile/
│   │       ├── hooks/
│   │       │   ├── useProfile.ts
│   │       │   └── useUpdateProfile.ts
│   │       ├── services/
│   │       │   └── profile.service.ts
│   │       ├── types/
│   │       │   └── profile.types.ts
│   │       └── index.ts
│   │
│   ├── components/                         # Shared UI components
│   │   ├── ui/                             # Base design system components
│   │   │   ├── Button.tsx                  # Primary, Secondary, Ghost variants
│   │   │   ├── IconButton.tsx
│   │   │   ├── TextField.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Card.tsx                    # Base card with variants
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── BottomSheet.tsx
│   │   │
│   │   ├── feedback/                       # Feedback & state components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/                         # Layout components
│   │   │   ├── Screen.tsx                  # SafeArea + scroll wrapper
│   │   │   ├── Section.tsx                 # Content section with title
│   │   │   └── KeyboardAwareView.tsx
│   │   │
│   │   └── index.ts                        # Barrel export
│   │
│   ├── hooks/                              # Shared hooks
│   │   ├── useAuth.ts                      # Auth state hook (wraps store)
│   │   ├── useRole.ts                      # Current user role
│   │   ├── useRTL.ts                       # RTL detection helper
│   │   ├── useRefreshOnFocus.ts            # Refetch on screen focus
│   │   └── useDebounce.ts
│   │
│   ├── lib/                                # Core utilities & clients
│   │   ├── supabase.ts                     # Supabase client init
│   │   ├── queryClient.ts                  # TanStack Query config
│   │   ├── constants.ts                    # App-wide constants
│   │   ├── validators.ts                   # Form validation helpers
│   │   ├── formatters.ts                   # Date, number formatters
│   │   └── helpers.ts                      # Misc utility functions
│   │
│   ├── stores/                             # Zustand stores (client-only state)
│   │   ├── authStore.ts                    # Auth session, user role
│   │   ├── themeStore.ts                   # Light/dark mode
│   │   └── localeStore.ts                  # Language preference
│   │
│   ├── types/                              # Shared TypeScript types
│   │   ├── database.types.ts               # Supabase auto-generated types
│   │   ├── navigation.types.ts             # Route params
│   │   └── common.types.ts                 # Shared enums, utility types
│   │
│   ├── theme/                              # Design system tokens
│   │   ├── colors.ts                       # Color palette (light + dark)
│   │   ├── typography.ts                   # Font sizes, weights, families
│   │   ├── spacing.ts                      # Spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48)
│   │   ├── radius.ts                       # Border radius tokens
│   │   ├── shadows.ts                      # Shadow presets
│   │   └── index.ts                        # Unified theme export
│   │
│   └── i18n/                               # Internationalization
│       ├── config.ts                       # i18next setup
│       ├── en.json                         # English strings
│       └── ar.json                         # Arabic strings
│
├── assets/                                 # Static assets
│   ├── images/
│   │   ├── stickers/
│   │   ├── trophies/
│   │   ├── avatars/
│   │   ├── badges/
│   │   └── onboarding/
│   ├── fonts/                              # Custom fonts (Arabic-friendly)
│   └── icon.png                            # App icon
│
├── app.json                                # Expo config
├── eas.json                                # EAS Build config
├── babel.config.js
├── tsconfig.json
├── package.json
└── .env                                    # Supabase URL + anon key
```

---

## 5. Technology Stack

### 5.1 Core Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| **Framework** | `expo` ~52 | Managed workflow |
| **Routing** | `expo-router` v4 | File-based navigation |
| **Server State** | `@tanstack/react-query` | Data fetching, caching, sync |
| **Client State** | `zustand` | Auth, theme, locale stores |
| **Backend** | `@supabase/supabase-js` | Auth, DB, Storage, Realtime |
| **Forms** | `react-hook-form` + `zod` | Form state + validation |
| **Animations** | `react-native-reanimated` | Smooth layout transitions |
| **i18n** | `i18next` + `react-i18next` + `expo-localization` | Localization |
| **Storage** | `expo-secure-store` | Secure token storage |
| **Async Storage** | `@react-native-async-storage/async-storage` | Preferences, cache |

### 5.2 UI Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| **Icons** | `@expo/vector-icons` (Ionicons / MaterialCommunityIcons) | Icon library |
| **Bottom Sheet** | `@gorhom/bottom-sheet` | Bottom sheet interactions |
| **Toast** | `react-native-toast-message` OR `burnt` | Notifications/feedback |
| **Calendar** | `react-native-calendars` | Attendance calendar (parent) |
| **Charts** | `victory-native` | Analytics & reports |
| **Skeleton** | `expo-skeleton` or custom with reanimated | Loading states |

### 5.3 Development Dependencies

| Category | Library | Purpose |
|----------|---------|---------|
| **Type Safety** | `typescript` | Static typing |
| **Linting** | `eslint` + `prettier` | Code quality |
| **Type Gen** | `supabase gen types` | DB types from schema |
| **Testing** | `jest` + `@testing-library/react-native` | Unit & component tests |

---

## 6. RTL/LTR Strategy

### 6.1 Principles

**Use logical CSS properties everywhere.** Never use `left`/`right` for layout.

```typescript
// ✅ CORRECT — Logical properties (auto-flip in RTL)
const styles = StyleSheet.create({
  container: {
    paddingStart: 16,      // NOT paddingLeft
    paddingEnd: 16,        // NOT paddingRight
    marginStart: 8,        // NOT marginLeft
    marginEnd: 8,          // NOT marginRight
    flexDirection: 'row',  // Auto-flips in RTL
    alignSelf: 'flex-start', // Auto-flips in RTL
  },
  textAligned: {
    textAlign: 'left',     // In RN, this respects RTL (becomes right)
    writingDirection: 'auto',
  },
});

// ❌ WRONG — Physical properties (broken in RTL)
const badStyles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    marginLeft: 8,
  },
});
```

### 6.2 RTL Implementation Checklist

| Area | Approach |
|------|----------|
| Flex direction | Use `row` (auto-flips). Avoid `row-reverse` unless intentional. |
| Padding/Margin | `paddingStart` / `paddingEnd` / `marginStart` / `marginEnd` |
| Positioning | `start` / `end` instead of `left` / `right` |
| Text alignment | `textAlign: 'left'` auto-respects RTL in React Native |
| Icons | Flip directional icons (arrows, chevrons) using `I18nManager.isRTL` |
| Layout toggling | Use `I18nManager.forceRTL()` when language changes, then reload app |
| Fonts | Include Arabic-compatible font (e.g., Noto Sans Arabic, IBM Plex Arabic) |

### 6.3 Language Switching

```typescript
// When user switches language:
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

const switchLanguage = async (lang: 'en' | 'ar') => {
  const isRTL = lang === 'ar';
  
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    await Updates.reloadAsync(); // Required for RTL to take effect
  }
  
  i18n.changeLanguage(lang);
  localeStore.setLocale(lang);
};
```

---

## 7. Supabase Backend Architecture

### 7.1 Authentication

| Feature | Implementation |
|---------|---------------|
| Email/Password signup | `supabase.auth.signUp()` |
| Login | `supabase.auth.signInWithPassword()` |
| Forgot password | `supabase.auth.resetPasswordForEmail()` |
| Session management | Auto-refresh via Supabase SDK, token stored in `expo-secure-store` |
| Role assignment | Custom `profiles` table with `role` column, populated on signup |
| Auth guards | Expo Router middleware / redirect in root `_layout.tsx` based on auth state |

### 7.2 Database Schema (Core Tables)

```sql
-- Profiles (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Classes
classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id),
  schedule JSONB,             -- { days: ['mon','wed','fri'], time: '16:00' }
  max_students INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Students (extended profile)
students (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  parent_id UUID REFERENCES profiles(id),
  date_of_birth DATE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  current_level TEXT,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
)

-- Lessons
lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  description TEXT,
  surah_name TEXT,
  ayah_from INTEGER,
  ayah_to INTEGER,
  lesson_type TEXT CHECK (lesson_type IN ('memorization', 'revision', 'tajweed', 'recitation')),
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Lesson Progress
lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  lesson_id UUID REFERENCES lessons(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
)

-- Sessions (teacher evaluations)
sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  teacher_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lesson_id UUID REFERENCES lessons(id),
  recitation_quality INTEGER CHECK (recitation_quality BETWEEN 1 AND 5),
  tajweed_score INTEGER CHECK (tajweed_score BETWEEN 1 AND 5),
  memorization_score INTEGER CHECK (memorization_score BETWEEN 1 AND 5),
  notes TEXT,
  homework_assigned TEXT,
  homework_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Homework
homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  student_id UUID REFERENCES students(id),
  description TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Attendance
attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES profiles(id),
  notes TEXT,
  UNIQUE(student_id, date)
)

-- Stickers
stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,              -- e.g., 'memorization', 'behavior', 'attendance'
  points_value INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true
)

-- Awarded Stickers
student_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  sticker_id UUID REFERENCES stickers(id),
  awarded_by UUID REFERENCES profiles(id),  -- teacher who awarded
  awarded_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT
)

-- Trophies
trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  criteria JSONB,             -- { type: 'sticker_count', threshold: 50 }
  is_active BOOLEAN DEFAULT true
)

-- Student Trophies
student_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  trophy_id UUID REFERENCES trophies(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, trophy_id)
)

-- Achievements
achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  badge_image_url TEXT,
  criteria JSONB,             -- { type: 'streak_days', threshold: 7 }
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
)

-- Student Achievements
student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, achievement_id)
)

-- Teacher Check-ins
teacher_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE
)
```

### 7.3 Row Level Security (RLS)

Every table **must** have RLS enabled. Key policies:

| Table | Student | Teacher | Parent | Admin |
|-------|---------|---------|--------|-------|
| `profiles` | Own only | Own + class students | Own + children | All |
| `students` | Own data | Class students | Own children | All (CRUD) |
| `lessons` | Read class lessons | Read/write class lessons | Read children's class | All |
| `sessions` | Read own | Read/write class | Read children's | All |
| `attendance` | Read own | Read/write class | Read children's | All (CRUD) |
| `student_stickers` | Read own | Read/write (award) | Read children's | All |
| `homework` | Read own | Read/write | Read children's | All |

### 7.4 Supabase Realtime (Optional — Phase 2)

For live updates in Phase 2:
- Teacher awards a sticker → Student sees it live on dashboard
- Admin marks attendance → Parent sees update
- Use Supabase Realtime subscriptions with TanStack Query's `invalidateQueries`

### 7.5 Supabase Edge Functions (Optional)

| Function | Purpose |
|----------|---------|
| `calculate-leaderboard` | Compute and cache leaderboard rankings |
| `check-achievements` | Evaluate if student earned new achievements after session |
| `send-notification` | Push notification via Expo Push API |

---

## 8. Authentication & Authorization Flow

### 8.1 Auth Flow

```
App Launch
    │
    ▼
Check Supabase Session
    │
    ├── No Session → (auth)/login
    │
    └── Has Session → Fetch Profile
                        │
                        ├── role: student  → (student)/(tabs)/
                        ├── role: teacher  → (teacher)/(tabs)/
                        ├── role: parent   → (parent)/(tabs)/
                        └── role: admin    → (admin)/
```

### 8.2 Route Protection

In `app/_layout.tsx`:

```typescript
// Simplified auth guard concept
const { session, isLoading } = useAuth();
const { role } = useRole();
const segments = useSegments();

useEffect(() => {
  if (isLoading) return;
  
  const inAuthGroup = segments[0] === '(auth)';
  
  if (!session && !inAuthGroup) {
    router.replace('/(auth)/login');
  } else if (session && inAuthGroup) {
    // Redirect to role-specific dashboard
    router.replace(`/(${role})/`);
  }
}, [session, isLoading]);
```

### 8.3 Registration Flow

1. User selects role (Student, Teacher, Parent)
2. Fills registration form (name, email, password)
3. `supabase.auth.signUp()` creates auth user
4. Database trigger (or Edge Function) creates `profiles` row with role
5. If Student: admin/teacher must link to class and parent
6. If Parent: admin links children (students) to parent
7. Redirect to role dashboard

---

## 9. Gamification System (Student)

### 9.1 Points System

| Action | Points |
|--------|--------|
| Session completed | +10 |
| Good recitation score (4-5) | +5 bonus |
| Homework completed on time | +10 |
| Homework completed late | +5 |
| Daily streak maintained | +3 per day |
| Perfect attendance (week) | +20 bonus |

### 9.2 Levels

| Level | Points Required | Title |
|-------|----------------|-------|
| 1 | 0 | Beginner |
| 2 | 50 | Seeker |
| 3 | 150 | Reciter |
| 4 | 300 | Memorizer |
| 5 | 500 | Scholar |
| 6 | 800 | Hafiz Star |
| 7 | 1200 | Master |
| 8 | 1800 | Champion |
| 9 | 2500 | Legend |
| 10 | 3500 | Quran Guardian |

### 9.3 Stickers

Teachers award stickers manually after sessions. Categories:
- ⭐ Memorization Excellence
- 🎯 Perfect Tajweed
- 📖 Consistent Recitation
- 🏆 Best Effort
- ❤️ Helping Others
- 🔥 Streak Master

### 9.4 Trophies

Auto-awarded based on milestones:
- 10 stickers collected
- 50 stickers collected
- 7-day streak
- 30-day streak
- Complete a full Juz
- Top of leaderboard for a week

### 9.5 Leaderboard

- Class-level leaderboard (ranked by total points)
- Weekly reset option for fair competition
- Shows top 10 + current student's rank
- Uses Supabase RPC or Edge Function for efficient ranking

---

## 10. Screen Specifications

### 10.1 Student Screens

**Dashboard**
- Greeting with student name and current level
- Progress ring showing overall completion percentage
- Current homework card with due date
- Quick actions: Go to Lessons, View Stickers, Leaderboard
- Recent achievements (horizontal scroll)

**Lessons List**
- Grouped by status: In Progress, Not Started, Completed
- Each card shows: title, surah/ayah range, type badge, progress bar
- Tap → Lesson Detail

**Lesson Detail**
- Lesson info (surah, ayah range, type)
- Progress status
- Session history for this lesson
- Homework if assigned

**Stickers Page**
- Grid of all collected stickers
- Locked stickers shown with opacity
- Total count and category breakdown
- Tap to see sticker detail + who awarded it

**Trophy Room**
- Display earned trophies prominently
- Locked trophies with criteria shown
- Progress toward next trophy

**Leaderboard**
- Class leaderboard (top 10)
- Current student highlighted
- Points and level for each entry
- Weekly / All-time toggle

**Sessions History**
- List of past sessions, sorted by date
- Each shows: date, teacher, scores, notes preview
- Tap → Session Detail

### 10.2 Teacher Screens

**Dashboard**
- Check-in / Check-out button with time
- Today's overview: sessions logged, students seen
- Alerts: students with declining performance, missing homework
- Quick actions: Log Session, Award Sticker

**Students List**
- All students in teacher's class(es)
- Search and filter
- Quick stats: attendance rate, average scores
- Navigation to: Top Performers, Needs Support

**Student Detail**
- Full profile with photo
- Performance charts (scores over time)
- Recent sessions
- Sticker history
- Attendance record

**Create/Edit Session**
- Select student (or from student detail)
- Date picker (defaults to today)
- Lesson reference
- Score sliders: Recitation (1-5), Tajweed (1-5), Memorization (1-5)
- Notes field
- Homework assignment + due date
- Save → triggers point calculation

**Award Sticker**
- Student selector (searchable)
- Sticker picker (grid of available stickers)
- Optional reason text
- Award → student receives points + sticker

**Class Progress**
- Class-wide statistics
- Average scores chart
- Attendance trends
- Students distribution by level

### 10.3 Parent Screens

**Dashboard**
- Card per child showing: name, class, level, today's status
- Recent activity timeline across all children

**Child Detail**
- Profile info
- Current level and points
- Progress overview
- Recent sessions with scores
- Sticker collection summary
- Link to: Attendance, Class Standing

**Attendance Calendar**
- Monthly calendar view
- Color-coded: present (green), absent (red), late (yellow), excused (blue)
- Attendance rate percentage

**Class Standing**
- Child's rank in class
- Anonymous leaderboard (shows ranks, not other students' names for privacy)
- Trend indicator (up/down/same vs. last week)

### 10.4 Admin Screens

**Dashboard**
- Quick stats: total students, teachers, classes, today's attendance rate
- School health indicators
- Quick actions: Add Student, Add Teacher, Create Class

**Students Management**
- Full list with search, filter by class/status
- Add / Edit / Deactivate students
- Form fields: name, class assignment, parent link, date of birth
- Bulk actions (future)

**Teachers Management**
- Full list with search
- Add / Edit / Deactivate teachers
- Assign to classes

**Classes Management**
- List of all classes
- Create/edit: name, description, schedule, assigned teacher, max students
- Student assignment interface (add/remove students from class)

**Bulk Attendance**
- Select class → shows all students
- Mark each: Present / Absent / Late / Excused
- Bulk actions: Mark all present
- Submit → creates attendance records

**Reports**
- Overall school statistics
- Attendance trends (line chart)
- Performance distribution (bar chart)
- Teacher activity summary
- Export options (future)

---

## 11. Design System

### 11.1 Color Palette

```typescript
const colors = {
  // Primary — Deep Teal (trust, education, Islamic aesthetic)
  primary: {
    50: '#E6F7F5',
    100: '#B3E8E2',
    200: '#80D9CE',
    300: '#4DCABB',
    400: '#26BFA9',
    500: '#0D9488', // Main primary
    600: '#0B7A71',
    700: '#08615A',
    800: '#064843',
    900: '#03302D',
  },
  
  // Secondary — Warm Gold (achievement, reward)
  secondary: {
    50: '#FFF9E6',
    100: '#FFEDB3',
    200: '#FFE180',
    300: '#FFD54D',
    400: '#FFCD26',
    500: '#F5A623', // Main secondary
    600: '#D4901E',
    700: '#B37A19',
    800: '#926414',
    900: '#714E0F',
  },
  
  // Neutral
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFB',
    100: '#F1F5F8',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gamification
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};
```

### 11.2 Typography

```typescript
const typography = {
  // Use system fonts + Arabic-compatible custom font
  fontFamily: {
    regular: 'Inter-Regular',       // or system default
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    arabic: 'NotoSansArabic-Regular', // Arabic-specific
    arabicBold: 'NotoSansArabic-Bold',
  },
  
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
};
```

### 11.3 Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};
```

### 11.4 Border Radius

```typescript
const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};
```

---

## 12. Data Flow Patterns

### 12.1 Fetching Data (TanStack Query)

```typescript
// features/lessons/hooks/useLessons.ts
import { useQuery } from '@tanstack/react-query';
import { lessonsService } from '../services/lessons.service';

export const useLessons = (classId: string) => {
  return useQuery({
    queryKey: ['lessons', classId],
    queryFn: () => lessonsService.getByClass(classId),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
```

### 12.2 Mutations

```typescript
// features/sessions/hooks/useCreateSession.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsService } from '../services/sessions.service';

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Points are calculated server-side via DB trigger or Edge Function
    },
  });
};
```

### 12.3 Service Layer

```typescript
// features/sessions/services/sessions.service.ts
import { supabase } from '@/lib/supabase';
import type { Session, CreateSessionInput } from '../types/sessions.types';

export const sessionsService = {
  getByStudent: async (studentId: string): Promise<Session[]> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, lessons(title, surah_name), profiles!teacher_id(full_name)')
      .eq('student_id', studentId)
      .order('session_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  create: async (input: CreateSessionInput): Promise<Session> => {
    const { data, error } = await supabase
      .from('sessions')
      .insert(input)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

---

## 13. Performance & Optimization

### 13.1 Guidelines

| Area | Strategy |
|------|----------|
| Images | Use `expo-image` for optimized loading with caching |
| Lists | `FlashList` from `@shopify/flash-list` for all scrollable lists |
| Queries | TanStack Query's `staleTime` and `gcTime` to avoid refetching |
| Bundle | Expo's tree-shaking + Hermes bytecode |
| Navigation | Lazy load heavy screens with `React.lazy` + `Suspense` |
| Fonts | Preload with `expo-font` in root layout splash |
| Skeleton | Show skeleton loaders instead of spinners for perceived speed |

### 13.2 Offline Considerations (Phase 2)

- TanStack Query's built-in offline support with `persistQueryClient`
- Supabase offline queue for mutations
- Show stale data with "offline" indicator

---

## 14. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (hooks, services, utils) | Jest | 80% |
| Components | React Native Testing Library | Key components |
| Integration (screens) | React Native Testing Library + MSW | Happy paths |
| E2E | Detox or Maestro | Critical flows (login, session creation) |

---

## 15. Deployment & CI/CD

| Stage | Tool |
|-------|------|
| Build | EAS Build (managed) |
| OTA Updates | EAS Update |
| CI | GitHub Actions → lint + test + build |
| Distribution | EAS Submit to App Store + Google Play |
| Environment | `.env.production` / `.env.development` with Supabase keys |

---

## 16. Phase Plan

### Phase 1 (MVP) — Target: Production-Ready

**Auth**
- Email/password login and registration
- Role-based routing
- Forgot password

**Student**
- Dashboard
- Lessons (view only, progress tracking)
- Session history
- Gamification (stickers, trophies, leaderboard, levels, streaks)

**Teacher**
- Dashboard with check-in
- Student management (view)
- Session logging (create/edit)
- Award stickers

**Parent**
- Dashboard
- Children overview + detail
- Attendance calendar

**Admin**
- Dashboard
- Students CRUD
- Teachers CRUD
- Classes CRUD
- Bulk attendance

**Core**
- English + Arabic with full RTL/LTR
- Light mode (dark mode Phase 2)
- Supabase auth + RLS
- Basic design system

### Phase 2 — Enhancement

- Dark mode
- Realtime updates (sticker awards, attendance live sync)
- Push notifications (Expo Push + Supabase Edge Functions)
- Offline support
- Reports & analytics (admin)
- Class progress analytics (teacher)
- Profile editing for all roles
- Additional languages (Urdu, Turkish)

### Phase 3 — Growth

- Audio recording for recitation
- Parent feedback/ratings
- School-to-school leaderboard
- Custom sticker creation (admin)
- Export reports (PDF/CSV)
- Onboarding tour

---

## 17. Recommendations & Suggestions

These are optional additions that could enhance the app. Not required for MVP.

### 17.1 Suggested Enhancements

| Suggestion | Impact | Effort | Phase |
|------------|--------|--------|-------|
| **Daily Dua/Hadith** on student dashboard | Engagement | Low | 2 |
| **Parent satisfaction pulse** (quick emoji rating after viewing child's session) | Feedback | Low | 2 |
| **Teacher notes template** (pre-written common feedback) | Efficiency | Low | 1.5 |
| **Smart homework reminders** (push notification before due date) | Completion rates | Medium | 2 |
| **Student goal setting** (set weekly recitation goal with teacher) | Motivation | Medium | 2 |
| **Attendance streaks** for parents to see | Engagement | Low | 2 |
| **QR code check-in** for teachers | Convenience | Medium | 3 |
| **Recitation audio submission** (student records, teacher reviews async) | Core value | High | 3 |
| **Multi-school support** (one admin manages multiple locations) | Scale | High | 3 |
| **Progressive Web App** (admin panel on web via Expo Web) | Convenience | Medium | 3 |

### 17.2 UX Suggestions

- **Haptic feedback** on key actions (awarding sticker, completing lesson) using `expo-haptics`
- **Pull-to-refresh** on all list screens
- **Swipe gestures** on session cards (teacher) for quick actions
- **Smart defaults**: pre-select today's date, last-used class, etc.
- **Empty states** that guide users ("No sessions yet. Tap + to log your first session")

---

## 18. Conventions & Rules for Development

### 18.1 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files (components) | PascalCase | `StudentCard.tsx` |
| Files (hooks) | camelCase with `use` prefix | `useStudents.ts` |
| Files (services) | camelCase with `.service` suffix | `sessions.service.ts` |
| Files (types) | camelCase with `.types` suffix | `sessions.types.ts` |
| Route files | kebab-case | `forgot-password.tsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_STUDENTS_PER_CLASS` |
| Types/Interfaces | PascalCase | `StudentSummary` |
| Zustand stores | camelCase with `Store` suffix | `authStore.ts` |
| Query keys | Array of strings | `['sessions', studentId]` |

### 18.2 Import Aliases

```json
// tsconfig.json paths
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/features/*": ["./src/features/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/stores/*": ["./src/stores/*"],
  "@/theme/*": ["./src/theme/*"],
  "@/types/*": ["./src/types/*"],
  "@/i18n/*": ["./src/i18n/*"]
}
```

### 18.3 Code Rules

1. **TypeScript strict mode** — no `any` types
2. **All text must go through i18n** — no hardcoded strings in components
3. **Logical CSS only** — never `left`/`right` for layout
4. **Every list uses FlashList** — not FlatList or ScrollView for data lists
5. **Every image uses expo-image** — not RN's Image component
6. **Every form uses react-hook-form + zod** — consistent validation
7. **No inline styles for reusable patterns** — use StyleSheet.create
8. **Services never throw raw errors** — always typed error handling
9. **Query keys follow convention** — `[feature, ...params]`
10. **Components are pure** — business logic lives in hooks, not components

---

*This PRD is a living document. Update as decisions are made during development.*
