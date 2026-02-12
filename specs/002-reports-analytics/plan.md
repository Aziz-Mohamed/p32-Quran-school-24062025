# Implementation Plan: Reports & Analytics

**Branch**: `002-reports-analytics` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-reports-analytics/spec.md`

## Summary

Add school-wide reports for admins (KPIs, attendance trends, performance distribution, level distribution, teacher activity), class progress analytics for teachers (score trends, students needing attention), and child progress reports for parents (score trends with class average reference line). Uses Supabase RPC functions for time-series aggregations and victory-native for chart rendering. All data computed on-demand from existing tables.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React Native 0.83, Expo ~54, Expo Router v6, TanStack Query 5, victory-native 41.20.2, Supabase JS 2
**Storage**: Supabase PostgreSQL (remote) — existing tables: sessions, attendance, students, student_stickers, classes, profiles, levels
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS + Android (Expo managed workflow)
**Project Type**: Mobile (Expo Router file-based routing)
**Performance Goals**: All charts render within 3 seconds for 500 students / 12 months data (SC-002)
**Constraints**: Multi-tenant (school_id RLS), RTL/LTR support (EN/AR), logical CSS only
**Scale/Scope**: Up to 500 students per school, ~120K attendance rows, ~60K session rows over 12 months

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Multi-Tenant by Default | PASS | RPC functions accept school_id, RLS enforced via SECURITY INVOKER |
| II. Role-Based Access (4 Roles) | PASS | Admin sees school-wide, teacher sees own classes, parent sees own children |
| III. TypeScript-First, Strict Mode | PASS | All types defined in reports.types.ts, using Tables<> for DB types |
| IV. Feature Colocation | PASS | All reports code under src/features/reports/ |
| V. Logical CSS Only (RTL/LTR) | PASS | paddingStart/End, marginStart/End throughout. Charts render on Skia canvas (direction-agnostic) |
| VI. i18n Mandatory | PASS | All strings through t() with reports namespace in en.json/ar.json |
| VII. Supabase-Native Patterns | PASS | Direct SDK + supabase.rpc() calls. RPC functions have SET search_path = public |
| VIII. Minimal Animation | PASS | No animations in charts — static renders with data transitions |

## Project Structure

### Documentation (this feature)

```text
specs/002-reports-analytics/
├── plan.md              # This file
├── research.md          # Phase 0: aggregation strategy, victory-native patterns
├── data-model.md        # Phase 1: types, RPC signatures, service contracts
├── quickstart.md        # Phase 1: implementation order
├── contracts/           # Phase 1: service API contracts
│   ├── admin-reports.service.md
│   ├── teacher-reports.service.md
│   └── parent-reports.service.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
supabase/migrations/
└── 00002_report_rpc_functions.sql    # RPC functions for aggregations

src/features/reports/
├── types/
│   └── reports.types.ts              # All report type definitions
├── utils/
│   └── time-period.ts                # TimePeriod → DateRange + granularity
├── services/
│   ├── admin-reports.service.ts      # Admin school-wide queries
│   ├── teacher-reports.service.ts    # Teacher class progress queries
│   └── parent-reports.service.ts     # Parent child progress queries
├── hooks/
│   ├── useTimePeriod.ts              # Shared TimePeriod state + DateRange
│   ├── useAdminReports.ts            # TanStack Query hooks for admin
│   ├── useTeacherReports.ts          # TanStack Query hooks for teacher
│   └── useParentReports.ts           # TanStack Query hooks for parent
└── components/
    ├── ChartContainer.tsx            # Chart wrapper (loading/empty/error/sizing)
    ├── ChartLegend.tsx               # Color dots + labels legend
    ├── TimePeriodFilter.tsx           # FilterChips for period selection
    ├── ClassFilter.tsx               # Select dropdown for class filtering
    ├── KPICard.tsx                    # Single KPI metric card
    ├── KPIGrid.tsx                   # Grid layout of KPI cards
    ├── AttendanceTrendChart.tsx       # Line chart: attendance rate over time
    ├── ScoreTrendChart.tsx            # Line chart: 3 lines (mem/taj/rec)
    ├── ScoreDistributionChart.tsx     # Bar chart: score ranges
    ├── LevelDistributionChart.tsx     # Horizontal bar: students per level
    ├── TeacherActivityCard.tsx        # Single teacher activity card
    ├── TeacherActivityList.tsx        # FlashList of teacher cards
    ├── StudentAttentionCard.tsx       # Student needing attention card
    ├── StudentAttentionList.tsx       # List of attention students
    ├── ChildScoreTrendChart.tsx       # Score trend + class avg reference
    ├── ChildAttendanceSummary.tsx     # Attendance stats for child
    └── ChildGamificationSummary.tsx   # Stickers/achievements/level summary

app/(admin)/
├── _layout.tsx                       # Modified: add reports routes
├── index.tsx                         # Modified: add Reports navigation card
└── reports/
    ├── index.tsx                     # Admin reports dashboard
    └── teacher-activity.tsx          # Teacher activity detail

app/(teacher)/
├── _layout.tsx                       # Modified: add class-progress route
└── class-progress.tsx                # Teacher class progress screen

app/(parent)/
├── _layout.tsx                       # Modified: add progress route
├── children/[id].tsx                 # Modified: add View Progress button
└── progress/
    └── [childId].tsx                 # Child progress report screen

src/i18n/
├── en.json                           # Modified: add reports namespace
└── ar.json                           # Modified: add reports namespace
```

**Structure Decision**: Feature colocation in `src/features/reports/` following established project patterns. Routes follow Expo Router file-based routing under role-specific groups. RPC functions in a single migration file.

## Complexity Tracking

No constitution violations. All principles satisfied with standard patterns.
