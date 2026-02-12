# Quickstart: Reports & Analytics

**Feature**: 002-reports-analytics | **Date**: 2026-02-12

## Implementation Order

### Phase 0: Foundation (no UI dependencies)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 0.1 | Create type definitions | — | `src/features/reports/types/reports.types.ts` |
| 0.2 | Create time-period utility | 0.1 | `src/features/reports/utils/time-period.ts` |
| 0.3 | Write RPC migration SQL | 0.1 | `supabase/migrations/00002_report_rpc_functions.sql` |
| 0.4 | Apply migration to Supabase | 0.3 | Via `apply_migration` MCP tool |
| 0.5 | Run security advisors check | 0.4 | Via `get_advisors` MCP tool |
| 0.6 | Regenerate TypeScript types | 0.4 | Via `generate_typescript_types` MCP tool |

### Phase 1: Service Layer

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 1.1 | Implement admin reports service | 0.2, 0.4 | `src/features/reports/services/admin-reports.service.ts` |
| 1.2 | Implement teacher reports service | 0.2, 0.4 | `src/features/reports/services/teacher-reports.service.ts` |
| 1.3 | Implement parent reports service | 0.2, 0.4 | `src/features/reports/services/parent-reports.service.ts` |

### Phase 2: Hook Layer

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 2.1 | Create useTimePeriod hook | 0.2 | `src/features/reports/hooks/useTimePeriod.ts` |
| 2.2 | Create useAdminReports hooks | 1.1, 2.1 | `src/features/reports/hooks/useAdminReports.ts` |
| 2.3 | Create useTeacherReports hooks | 1.2, 2.1 | `src/features/reports/hooks/useTeacherReports.ts` |
| 2.4 | Create useParentReports hooks | 1.3, 2.1 | `src/features/reports/hooks/useParentReports.ts` |

### Phase 3: Shared Chart Components

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 3.1 | ChartContainer wrapper | — | `src/features/reports/components/ChartContainer.tsx` |
| 3.2 | ChartLegend component | — | `src/features/reports/components/ChartLegend.tsx` |
| 3.3 | TimePeriodFilter (wraps FilterChips) | 0.1 | `src/features/reports/components/TimePeriodFilter.tsx` |
| 3.4 | ClassFilter (wraps Select) | — | `src/features/reports/components/ClassFilter.tsx` |
| 3.5 | KPICard + KPIGrid | — | `src/features/reports/components/KPICard.tsx`, `KPIGrid.tsx` |

### Phase 4: Admin Report Charts (P1)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 4.1 | AttendanceTrendChart | 3.1, 3.2 | `src/features/reports/components/AttendanceTrendChart.tsx` |
| 4.2 | ScoreDistributionChart | 3.1 | `src/features/reports/components/ScoreDistributionChart.tsx` |
| 4.3 | LevelDistributionChart | 3.1 | `src/features/reports/components/LevelDistributionChart.tsx` |

### Phase 5: Admin Report Screens (P1)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 5.1 | Admin reports index screen | 2.2, 3.3–3.5, 4.1–4.3 | `app/(admin)/reports/index.tsx` |
| 5.2 | Update admin layout (add routes) | 5.1 | `app/(admin)/_layout.tsx` |
| 5.3 | Add Reports nav card to admin dashboard | 5.2 | `app/(admin)/index.tsx` |
| 5.4 | Add i18n strings (admin reports) | 5.1 | `src/i18n/en.json`, `ar.json` |

### Phase 6: Teacher Reports (P2)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 6.1 | ScoreTrendChart (3 lines) | 3.1, 3.2 | `src/features/reports/components/ScoreTrendChart.tsx` |
| 6.2 | StudentAttentionCard + List | — | `src/features/reports/components/StudentAttention*.tsx` |
| 6.3 | Teacher class-progress screen | 2.3, 3.3, 3.4, 4.1, 4.3, 6.1, 6.2 | `app/(teacher)/class-progress.tsx` |
| 6.4 | Update teacher layout | 6.3 | `app/(teacher)/_layout.tsx` |
| 6.5 | Add i18n strings (teacher reports) | 6.3 | `src/i18n/en.json`, `ar.json` |

### Phase 7: Admin Teacher Activity (P2)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 7.1 | TeacherActivityCard + List | — | `src/features/reports/components/TeacherActivity*.tsx` |
| 7.2 | Admin teacher-activity screen | 2.2, 3.3, 7.1 | `app/(admin)/reports/teacher-activity.tsx` |
| 7.3 | Add teacher activity link to reports index | 7.2 | `app/(admin)/reports/index.tsx` |

### Phase 8: Parent Child Progress (P3)

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 8.1 | ChildScoreTrendChart (+ class avg ref) | 3.1, 3.2 | `src/features/reports/components/ChildScoreTrendChart.tsx` |
| 8.2 | ChildAttendanceSummary | — | `src/features/reports/components/ChildAttendanceSummary.tsx` |
| 8.3 | ChildGamificationSummary | — | `src/features/reports/components/ChildGamificationSummary.tsx` |
| 8.4 | Parent progress screen | 2.4, 3.3, 8.1–8.3 | `app/(parent)/progress/[childId].tsx` |
| 8.5 | Update parent layout | 8.4 | `app/(parent)/_layout.tsx` |
| 8.6 | Add "View Progress" to child detail | 8.5 | `app/(parent)/children/[id].tsx` |
| 8.7 | Add i18n strings (parent reports) | 8.4 | `src/i18n/en.json`, `ar.json` |

### Phase 9: Polish & Verification

| Step | Task | Depends On | Output |
|------|------|-----------|--------|
| 9.1 | Empty states for all charts | All chart components | Chart component files |
| 9.2 | Single-data-point handling | All chart components | Chart component files |
| 9.3 | Verify RTL layout on all screens | All screens | Screen files |
| 9.4 | Run security advisors check | All | Via `get_advisors` MCP tool |

## Key Implementation Notes

1. **useTimePeriod** is the shared state hook: `{ timePeriod, setTimePeriod, dateRange }`. All report hooks take `dateRange`, not `timePeriod`.

2. **staleTime**: Use 5 minutes for all report queries (matching queryClient defaults). Reports are read-heavy and don't need real-time freshness.

3. **ScoreTrendChart reuse**: Used by both teacher class-progress (FR-010) and as the base of ChildScoreTrendChart (FR-012). ChildScoreTrendChart extends it with 3 dashed reference lines for class averages.

4. **AttendanceTrendChart reuse**: Used by both admin reports (school-wide or class-filtered) and teacher class-progress (always class-filtered). Class filter is a prop.

5. **Column name**: Sessions table uses `recitation_quality` (not `recitation_score`). All RPC functions and services use the correct column name.

6. **RPC security**: All functions use `SECURITY INVOKER` + `SET search_path = public`. RLS on underlying tables provides multi-tenant enforcement.
