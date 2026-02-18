<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 (template) → 1.0.0 (initial ratification)

  Modified principles: N/A (first constitution)

  Added sections:
  - Core Principles (8 principles derived from PRD)
  - Technology & Architecture Constraints
  - Development Workflow
  - Governance

  Removed sections: N/A

  Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No update needed
    (Constitution Check section already references constitution file dynamically)
  - .specify/templates/spec-template.md: ✅ No update needed
    (Spec template is generic; principles enforced at plan/task level)
  - .specify/templates/tasks-template.md: ✅ No update needed
    (Task phases align with constitution workflow)
  - .specify/templates/checklist-template.md: ✅ No update needed
    (Checklist template is generic)
  - .specify/templates/agent-file-template.md: ✅ No update needed
    (Agent file template is generic)

  Follow-up TODOs: None
-->

# Quran School Constitution

## Core Principles

### I. Multi-Tenant by Default

Every school-scoped table MUST include a `school_id` foreign key.
All Row Level Security (RLS) policies MUST enforce school-scoping
via `get_user_school_id()`. Global tables (`trophies`,
`achievements`, `levels`) are the only exceptions. No query from
the application layer may return data across school boundaries
unless explicitly operating at the platform level.

### II. Role-Based Access (4 Roles)

The system recognizes exactly four roles: `student`, `teacher`,
`parent`, `admin`. Every RLS policy and application-level guard
MUST be scoped to one or more of these roles using
`get_user_role()`. Role assignment occurs at the `profiles` table
level. No implicit role escalation is permitted — a user MUST
have the declared role to access role-gated functionality.

### III. TypeScript-First, Strict Mode

All application code MUST be written in TypeScript with strict
mode enabled. No `any` types are permitted. Supabase-generated
types (`database.types.ts`) MUST be used for all database
interactions. Every entity passed between layers MUST have a
defined TypeScript interface.

### IV. Feature Colocation

Each feature MUST keep its hooks, services, types, and components
colocated in a single directory under `src/features/`. Shared code
lives in `src/components/`, `src/hooks/`, `src/lib/`, `src/stores/`,
`src/types/`, `src/theme/`, and `src/i18n/`. No feature may
directly import from another feature's internal files — shared
dependencies MUST be elevated to the shared layer.

### V. Logical CSS Only (RTL/LTR)

All layout properties MUST use logical CSS equivalents:
`paddingStart`/`paddingEnd` (not `paddingLeft`/`paddingRight`),
`marginStart`/`marginEnd`, `start`/`end` positioning (not
`left`/`right`). `flexDirection: 'row'` auto-flips and MUST be
used instead of `row-reverse` for standard layouts. Directional
icons MUST be flipped using `I18nManager.isRTL`. No physical
directional properties are permitted in any StyleSheet.

### VI. i18n Mandatory

All user-visible strings MUST go through the i18n system
(`i18next` + `react-i18next`). No hardcoded text strings in
components. Both English (`en.json`) and Arabic (`ar.json`)
translations MUST be maintained for every string. Language
switching MUST trigger RTL/LTR layout reconfiguration via
`I18nManager.forceRTL()`.

### VII. Supabase-Native Patterns

Authentication MUST use Supabase Auth (`signUp`,
`signInWithPassword`, `resetPasswordForEmail`). Data access MUST
use the Supabase JS SDK directly in service files — no ORM or
repository abstraction layer. RLS MUST be enabled on every table.
Migrations MUST be applied via Supabase migration tooling.
Functions MUST include `SET search_path = public` for security
compliance. Tables MUST be created before functions that reference
them.

### VIII. Minimal Animation, Maximum Responsiveness

Use `react-native-reanimated` for layout transitions and
shared-element transitions only. Micro-interactions (button press
feedback, pull-to-refresh, progress fills) are encouraged.
Full-screen celebrations, heavy Lottie/Rive packs, particle
effects, and animations that block user interaction are prohibited.
The app MUST feel alive and responsive, not animated and heavy.

## Technology & Architecture Constraints

- **Framework**: Expo ~54, managed workflow, Expo Router v6
- **Server state**: TanStack Query (React Query) — all data
  fetching and caching MUST use this library
- **Client state**: Zustand — limited to auth, theme, and locale
  stores. No global state for server-fetched data.
- **Forms**: `react-hook-form` + `zod` for all form handling
  and validation
- **Lists**: `FlashList` from `@shopify/flash-list` for all
  scrollable data lists (not FlatList or ScrollView)
- **Images**: `expo-image` for all image rendering (not RN Image)
- **Backend**: Supabase (Auth, Database, Storage, Realtime,
  Edge Functions)
- **Database design rules**:
  - All FKs MUST have explicit `ON DELETE` (CASCADE for ownership,
    SET NULL for optional refs)
  - All columns with defaults MUST have `NOT NULL`
  - CHECK constraints on all numeric ranges and enum-like text
  - `is_active` is a status flag, not soft-delete; RLS does NOT
    filter by `is_active` — app layer handles it
  - `updated_at` triggers on tables that need them

## Development Workflow

- **Routing**: File-based via Expo Router. Route groups map to
  roles: `(auth)`, `(student)`, `(teacher)`, `(parent)`, `(admin)`.
- **Query keys**: Follow `[feature, ...params]` convention
- **Services**: Each feature has a `.service.ts` file that wraps
  Supabase SDK calls. Services MUST NOT throw raw errors.
- **Components**: Business logic lives in hooks, not components.
  Components MUST be pure renderers.
- **Testing**: Jest + React Native Testing Library. Critical paths
  require integration tests. E2E via Detox or Maestro for login
  and session creation flows.
- **Code style**: ESLint + Prettier enforced. No inline styles for
  reusable patterns — use `StyleSheet.create`.
- **Naming**: PascalCase for components, camelCase with `use`
  prefix for hooks, `.service.ts` suffix for services,
  `.types.ts` suffix for types, kebab-case for route files,
  UPPER_SNAKE_CASE for constants.
- **Git commits**: No AI attribution in commit messages. Write
  commit messages as if a human developer wrote them.

## Governance

This constitution is the authoritative reference for all
architectural and code-quality decisions in the Quran School
project. It supersedes ad-hoc practices and local conventions.

- **Amendments**: Any change to a principle MUST be documented
  with rationale, approved by the project owner, and reflected
  in a version bump. Principle removals or redefinitions require
  a MAJOR version increment.
- **Versioning**: MAJOR.MINOR.PATCH semantic versioning.
  MAJOR = breaking governance changes; MINOR = new principles or
  expanded guidance; PATCH = clarifications and wording fixes.
- **Compliance**: All feature specs, implementation plans, and
  task lists MUST pass a Constitution Check before implementation
  begins. The plan template's "Constitution Check" section
  validates alignment with these principles.
- **Source of truth**: The PRD at `memory-bank/PRD.md` is the
  product-level source of truth. This constitution governs
  technical execution of that PRD.

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
