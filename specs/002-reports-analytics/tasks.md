# Tasks: Reports & Analytics

**Input**: Design documents from `/specs/002-reports-analytics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. US1+US2+US3 share one phase (all P1, same admin dashboard screen). US4, US5, US6 each get their own phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6 from spec.md)

---

## Phase 1: Setup

**Purpose**: Type definitions, utilities, and database migration — foundational infrastructure for all stories

- [x] T001 Create report type definitions (TimePeriod, DateRange, TimeGranularity, SchoolKPISummary, AttendanceTrendPoint, ScoreTrendPoint, ScoreDistributionBucket, LevelDistributionBucket, TeacherActivitySummary, ClassAnalytics, StudentNeedingAttention, ChildScoreTrendPoint, ChildAttendanceSummary, ChildGamificationSummary, ChildProgressReport, ScoreRange) per data-model.md in `src/features/reports/types/reports.types.ts`
- [x] T002 [P] Create time-period utility (getDateRange mapping TimePeriod→DateRange+granularity per FR-016 and A-010/A-011: this_week starts Monday, this_month=1st of month, this_term=3 months ago, all_time=school creation date; getGranularity mapping per research.md Decision 3) in `src/features/reports/utils/time-period.ts`
- [x] T003 [P] Write RPC migration SQL with 5 functions (get_attendance_trend, get_score_trend, get_teacher_activity, get_students_needing_attention, get_child_score_trend) per data-model.md RPC signatures. All use SECURITY INVOKER + SET search_path = public. Use NULLIF for zero-denominator attendance rate. get_students_needing_attention accepts p_class_id, p_start_date, p_end_date — scopes sessions to date range per FR-011/A-003, limits to 10 results ordered by decline_amount DESC, applies fallback criterion when <3 sessions in range. get_teacher_activity excludes is_active=false profiles. In `supabase/migrations/00002_report_rpc_functions.sql`
- [x] T004 Apply migration to Supabase via `apply_migration` MCP tool with name `report_rpc_functions` and the SQL from T003
- [x] T005 Run security advisors check via `get_advisors` MCP tool (type: security) — verify no mutable search_path warnings
- [x] T006 [P] Regenerate TypeScript types via `generate_typescript_types` MCP tool and update `supabase/types/database.types.ts`

**Checkpoint**: Types, utilities, and RPC functions are deployed. All subsequent phases can begin.

---

## Phase 2: Foundational (Shared Components & Hooks)

**Purpose**: Shared UI components and hooks that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create useTimePeriod hook (useState for TimePeriod defaulting to 'this_month' per FR-002, derives DateRange via getDateRange utility, exports { timePeriod, setTimePeriod, dateRange }) in `src/features/reports/hooks/useTimePeriod.ts`
- [x] T008 [P] Create ChartContainer wrapper component (accepts children, isLoading, isEmpty, isError, onRetry, emptyMessage, accessibilityLabel props; renders loading skeleton per FR-017, empty state with message per FR-013, error state with "Retry" button per FR-018, or chart content with accessibilityLabel per NFR-001; handles consistent sizing/padding) in `src/features/reports/components/ChartContainer.tsx`
- [x] T009 [P] Create ChartLegend component (renders horizontal list of legend items, each with a color indicator + optional dash pattern + label; supports solid/dashed/dotted indicators per NFR-002) in `src/features/reports/components/ChartLegend.tsx`
- [x] T010 [P] Create TimePeriodFilter component (wraps existing FilterChips component with TimePeriod options: "This Week", "This Month", "This Term", "All Time"; accepts value and onChange props; default highlight on "This Month") in `src/features/reports/components/TimePeriodFilter.tsx`

**Checkpoint**: Shared infrastructure ready — user story implementation can now begin

---

## Phase 3: Admin Reports Dashboard (Priority: P1) — US1 + US2 + US3

**Goal**: Admin sees a single reports screen with KPI cards, attendance trend chart, score distribution chart, and level distribution chart. All filterable by time period and optionally by class.

**Independent Test**: Log in as admin → navigate to Reports via dashboard card → verify KPIs display correct counts, attendance trend chart renders with time-series data, score/level distribution charts show student breakdowns. Change time period → all metrics update. Filter by class → charts reflect that class only. Empty school → meaningful empty states per chart.

### Service & Hook Layer

- [x] T011 [US1] Implement AdminReportsService with 5 methods (getSchoolKPIs, getAttendanceTrend, getScoreDistribution, getLevelDistribution, getTeacherActivity) per `contracts/admin-reports.service.md`. getSchoolKPIs uses parallel Promise.all for 6 queries. getScoreDistribution buckets client-side into 4 ranges with [1,2) [2,3) [3,4) [4,5] boundaries per FR-004. getTeacherActivity calls supabase.rpc(). Export singleton. In `src/features/reports/services/admin-reports.service.ts`
- [x] T012 [US1] Create useAdminReports hooks file with 5 TanStack Query hooks (useSchoolKPIs, useAttendanceTrend, useScoreDistribution, useLevelDistribution, useTeacherActivity). All use 5-minute staleTime per NFR-003. Query keys per data-model.md strategy. Each hook accepts relevant params (schoolId, dateRange, optional classId). In `src/features/reports/hooks/useAdminReports.ts`

### Components

- [x] T013 [P] [US1] Create KPICard component (displays a single metric with label, value, and optional icon; supports number and percentage formatting; loading state shows placeholder shimmer) in `src/features/reports/components/KPICard.tsx`
- [x] T014 [P] [US2] Create ClassFilter component (dropdown/select for class filtering; accepts classes array and selectedClassId; "All Classes" as default option; used by admin reports for attendance/distribution filtering per FR-006) in `src/features/reports/components/ClassFilter.tsx`
- [x] T015 [US1] Create KPIGrid component (responsive grid layout of KPICard components; renders 6 KPIs: active students, active teachers, total classes, attendance rate, average scores, stickers awarded) in `src/features/reports/components/KPIGrid.tsx`
- [x] T016 [P] [US2] Create AttendanceTrendChart component (line chart using victory-native CartesianChart + Line; x-axis = dates formatted per FR-020 based on granularity, y-axis = percentage 0-100% with "%" suffix; single green line for attendance rate; wraps in ChartContainer; accepts data, isLoading, isEmpty, isError, onRetry props; handles single-data-point per Edge Case 4; includes accessibilityLabel per NFR-001; skips days with no data per Edge Case 9) in `src/features/reports/components/AttendanceTrendChart.tsx`
- [x] T017 [P] [US3] Create ScoreDistributionChart component (vertical bar chart using victory-native CartesianChart + Bar; 4 bars color-coded per FR-004: red #EF4444, amber #F59E0B, blue #3B82F6, green #22C55E; shows count labels on bars including "0" for empty ranges per Edge Case 16; includes ChartLegend with FR-021 color-coded labels below chart; wraps in ChartContainer) in `src/features/reports/components/ScoreDistributionChart.tsx`
- [x] T018 [P] [US3] Create LevelDistributionChart component (horizontal bar chart using victory-native CartesianChart + Bar; one bar per level from Beginner to Quran Guardian; shows student count per level; wraps in ChartContainer) in `src/features/reports/components/LevelDistributionChart.tsx`

### Screens & Navigation

- [x] T019 [US1] Create admin reports index screen (ScrollView with pull-to-refresh per FR-019; TimePeriodFilter at top; KPIGrid; ClassFilter; AttendanceTrendChart; ScoreDistributionChart; LevelDistributionChart; "Teacher Activity" navigation link; uses useAdminReports hooks; passes dateRange and classId to all components; each section independently shows loading/error/empty states per FR-018; includes offline banner per NFR-004) in `app/(admin)/reports/index.tsx`
- [x] T020 [US1] Update admin layout to add reports routes (add `reports/index` and `reports/teacher-activity` screen definitions to the admin group layout) in `app/(admin)/_layout.tsx`
- [x] T021 [US1] Add Reports navigation card to admin dashboard (card with reports icon and label, navigates to `/reports` on press; positioned among existing admin dashboard cards) in `app/(admin)/index.tsx`
- [x] T022 [US1] Add i18n strings for admin reports — add `reports` namespace with all KPI labels, chart titles, time period labels, class filter labels, empty state messages per FR-013, error messages per FR-018, score range labels, and axis labels to `src/i18n/en.json` and `src/i18n/ar.json`

**Checkpoint**: Admin reports dashboard fully functional with KPIs, attendance trends, score distribution, and level distribution. Independently testable as admin user.

---

## Phase 4: Teacher Class Progress (Priority: P2) — US4

**Goal**: Teacher sees class-level analytics: score trends (3 lines), attendance trends, level distribution, and students needing attention. Teachers with multiple classes can switch between them.

**Independent Test**: Log in as teacher with assigned class → open Class Progress tab → verify score trend chart shows 3 separate lines (memorization/tajweed/recitation), attendance chart renders, level distribution displays, students needing attention list shows up to 10 students sorted by decline magnitude. Switch class → all data updates. Teacher with zero classes → empty state per Edge Case 7.

**Dependencies**: Reuses AttendanceTrendChart (T016) and LevelDistributionChart (T018) from Phase 3.

### Service & Hook Layer

- [x] T023 [US4] Implement TeacherReportsService with 5 methods (getClassAnalytics, getClassScoreTrend, getClassAttendanceTrend, getStudentsNeedingAttention, getTeacherClasses) per `contracts/teacher-reports.service.md`. getStudentsNeedingAttention(classId, dateRange) calls supabase.rpc('get_students_needing_attention', { p_class_id, p_start_date, p_end_date }) to scope attention list to selected time period per FR-011/A-003. getTeacherClasses fetches classes where teacher_id matches and is_active=true. Export singleton. In `src/features/reports/services/teacher-reports.service.ts`
- [x] T024 [US4] Create useTeacherReports hooks file with 5 TanStack Query hooks (useClassAnalytics, useClassScoreTrend, useClassAttendanceTrend, useStudentsNeedingAttention, useTeacherClasses). useStudentsNeedingAttention accepts classId and dateRange to scope to selected period. All use 5-minute staleTime. Query keys per data-model.md (needs-attention key includes startDate/endDate). In `src/features/reports/hooks/useTeacherReports.ts`

### Components

- [x] T025 [P] [US4] Create ScoreTrendChart component (line chart using victory-native CartesianChart + 3 Line components; memorization=solid teal #0D9488, tajweed=dashed gold #F5A623, recitation=dotted blue #3B82F6 per NFR-002 and research.md; x-axis dates per FR-020, y-axis scores 1-5 with 1 decimal; ChartLegend showing 3 lines with dash indicators; wraps in ChartContainer; handles single-data-point per Edge Case 4) in `src/features/reports/components/ScoreTrendChart.tsx`
- [x] T026 [P] [US4] Create StudentAttentionCard component (displays student name, avatar, current avg score, decline magnitude and direction indicator; shows flag reason: 'declining' or 'low_scores' per A-003) in `src/features/reports/components/StudentAttentionCard.tsx`
- [x] T027 [US4] Create StudentAttentionList component (renders up to 10 StudentAttentionCard items per FR-011; sorted by decline magnitude; shows empty state "No students need attention — all students are on track" when list is empty per FR-013) in `src/features/reports/components/StudentAttentionList.tsx`

### Screens & Navigation

- [x] T028 [US4] Create teacher class-progress screen (ScrollView with pull-to-refresh per FR-019; class selector dropdown at top per FR-009 using getTeacherClasses data; TimePeriodFilter; class summary KPIs (attendance rate, avg scores); ScoreTrendChart; AttendanceTrendChart (reuse from T016 with classId prop); LevelDistributionChart (reuse from T018 with classId); StudentAttentionList; each section independent loading/error per FR-018; handles zero classes with Edge Case 7 empty state) in `app/(teacher)/class-progress.tsx`
- [x] T029 [US4] Update teacher layout to add class-progress tab (add `class-progress` screen to teacher tab navigator with "Class Progress" label and appropriate icon) in `app/(teacher)/_layout.tsx`
- [x] T030 [US4] Add i18n strings for teacher reports — add teacher-specific labels (class progress title, class selector, score trend title, students needing attention title, attention reasons, empty states) to `src/i18n/en.json` and `src/i18n/ar.json`

**Checkpoint**: Teacher class progress screen fully functional. Teachers see score trends, attendance, level distribution, and students needing attention for their classes.

---

## Phase 5: Admin Teacher Activity (Priority: P2) — US5

**Goal**: Admin sees a summary of each teacher's activity — sessions logged, students evaluated, stickers awarded, last active date. Inactive teachers shown separately.

**Independent Test**: Log in as admin → navigate to teacher activity from reports screen → verify each teacher card shows correct metrics. Change time period → metrics update. Teacher with zero sessions → appears in "Inactive This Period" section with muted style per US-5 scenario 3. Zero teachers → empty state per Edge Case 10.

**Dependencies**: Uses useTeacherActivity hook from useAdminReports (T012). Uses TimePeriodFilter (T010).

### Components

- [x] T031 [P] [US5] Create TeacherActivityCard component (displays teacher name, avatar, sessions logged count, unique students evaluated, stickers awarded, and last active date; inactive variant with muted/greyed-out style and "0 sessions" label per US-5 scenario 3) in `src/features/reports/components/TeacherActivityCard.tsx`
- [x] T032 [US5] Create TeacherActivityList component (renders TeacherActivityCards; two sections: active teachers sorted by sessions desc, then "Inactive This Period" section sorted alphabetically per FR-007; uses FlashList; handles empty state per Edge Case 10) in `src/features/reports/components/TeacherActivityList.tsx`

### Screens & Navigation

- [x] T033 [US5] Create admin teacher-activity screen (ScrollView with pull-to-refresh per FR-019; TimePeriodFilter at top; TeacherActivityList; uses useTeacherActivity hook from useAdminReports; loading/error states per FR-017/FR-018) in `app/(admin)/reports/teacher-activity.tsx`
- [x] T034 [US5] Add teacher activity navigation link to admin reports index — add a card/button that navigates to `reports/teacher-activity` screen below the charts in `app/(admin)/reports/index.tsx`
- [x] T035 [US5] Add i18n strings for teacher activity — add labels (teacher activity title, sessions logged, students evaluated, stickers awarded, last active, inactive section header, empty state) to `src/i18n/en.json` and `src/i18n/ar.json`

**Checkpoint**: Admin can view teacher activity summary with active/inactive grouping, filtered by time period.

---

## Phase 6: Parent Child Progress (Priority: P3) — US6

**Goal**: Parent sees their child's score trends (with class average reference line), attendance summary, and gamification summary (stickers, achievements, level, streaks).

**Independent Test**: Log in as parent → navigate to child detail → tap "View Progress" → verify score trend chart shows 3 child lines + 3 dashed class avg reference lines, attendance summary shows correct counts/rate, gamification section shows stickers/achievements/level. Change time period → scores and attendance update. Child with no class → no reference lines, note displayed per Edge Case 8.

**Dependencies**: Uses ScoreTrendChart (T025) as base for ChildScoreTrendChart extension.

### Service & Hook Layer

- [x] T036 [US6] Implement ParentReportsService with 4 methods (getChildProgressReport orchestrator, getChildScoreTrend, getChildAttendanceSummary, getChildGamificationSummary) per `contracts/parent-reports.service.md`. getChildProgressReport uses Promise.all for parallel fetch. getChildAttendanceSummary computes rate per FR-014 with "N/A" for zero denominator per Edge Case 12. Export singleton. In `src/features/reports/services/parent-reports.service.ts`
- [x] T037 [US6] Create useParentReports hooks file with 4 TanStack Query hooks (useChildProgressReport, useChildScoreTrend, useChildAttendance, useChildGamification). All use 5-minute staleTime. Query keys per data-model.md. In `src/features/reports/hooks/useParentReports.ts`

### Components

- [x] T038 [P] [US6] Create ChildScoreTrendChart component (extends ScoreTrendChart pattern with 3 additional dashed reference lines for class averages per FR-012; class avg lines use neutral gray #9CA3AF with dashed stroke; handles missing class data per Edge Case 15 — gap in reference line when class has no data for a bucket; omits reference lines entirely when child has no class per Edge Case 8 with note text; ChartLegend shows 6 entries: 3 child + 3 class avg) in `src/features/reports/components/ChildScoreTrendChart.tsx`
- [x] T039 [P] [US6] Create ChildAttendanceSummary component (displays attendance stats: total days, present, absent, late, excused, and rate percentage; rate shows "N/A" when denominator is zero per Edge Case 12; visual indicator for rate quality) in `src/features/reports/components/ChildAttendanceSummary.tsx`
- [x] T040 [P] [US6] Create ChildGamificationSummary component (displays total stickers, achievements unlocked, current level with title, current streak, longest streak, total points; reads from ChildGamificationSummary type) in `src/features/reports/components/ChildGamificationSummary.tsx`

### Screens & Navigation

- [x] T041 [US6] Create parent progress screen (ScrollView with pull-to-refresh per FR-019; TimePeriodFilter at top; ChildScoreTrendChart; ChildAttendanceSummary; ChildGamificationSummary; uses useParentReports hooks with childId from route params; loading/error states per FR-017/FR-018; handles child without class per Edge Case 8) in `app/(parent)/progress/[childId].tsx`
- [x] T042 [US6] Update parent layout to add progress route (add `progress/[childId]` screen definition to parent group layout per A-009) in `app/(parent)/_layout.tsx`
- [x] T043 [US6] Add "View Progress" button to child detail screen (button/link that navigates to `progress/[childId]` per A-009; positioned below existing child detail content) in `app/(parent)/children/[id].tsx`
- [x] T044 [US6] Add i18n strings for parent reports — add labels (child progress title, score trend title, class average label, attendance summary labels, gamification labels, "Class comparison unavailable" note, empty states) to `src/i18n/en.json` and `src/i18n/ar.json`

**Checkpoint**: Parent can view comprehensive child progress report with score trends, attendance, and gamification data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and refinements that span multiple user stories

- [x] T045 Verify all chart empty states match FR-013 messages — audit each chart component (AttendanceTrendChart, ScoreDistributionChart, LevelDistributionChart, ScoreTrendChart, ChildScoreTrendChart) and confirm the emptyMessage prop matches the spec-defined text in `src/features/reports/components/*.tsx`
- [x] T046 Verify single-data-point handling in all chart components — confirm each chart renders a single dot/marker (not a line) with "Only one data point — more data is needed for trend analysis" note per Edge Case 4 in `src/features/reports/components/*.tsx`
- [x] T047 [P] Audit accessibility labels on all chart components — verify every chart has an accessibilityLabel that summarizes data in text form per NFR-001; verify score trend lines use dash patterns (solid/dashed/dotted) per NFR-002 in `src/features/reports/components/*.tsx`
- [x] T048 [P] Verify RTL layout on all report screens — confirm logical CSS (paddingStart/End, marginStart/End) throughout; verify chart surrounding UI (titles, legends, filters) respects RTL via I18nManager per A-013 in all screen files
- [x] T049 Run final security advisors check via `get_advisors` MCP tool (type: security) — verify no new warnings after all migrations and RPC functions

**Checkpoint**: All stories verified, accessible, RTL-compatible, and security-clean. Feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) from Setup — BLOCKS all user stories
- **US1+US2+US3 Admin Dashboard (Phase 3)**: Depends on Phase 2 completion
- **US4 Teacher Class Progress (Phase 4)**: Depends on Phase 2 completion. Reuses AttendanceTrendChart (T016) and LevelDistributionChart (T018) from Phase 3 — but these components can be built in Phase 3 before Phase 4 starts naturally via priority ordering
- **US5 Admin Teacher Activity (Phase 5)**: Depends on useTeacherActivity hook from T012 (Phase 3). Must follow Phase 3.
- **US6 Parent Child Progress (Phase 6)**: Depends on Phase 2 completion. Extends ScoreTrendChart (T025) from Phase 4. Best started after Phase 4.
- **Polish (Phase 7)**: Depends on all user story phases being complete

### User Story Dependencies

```text
Phase 1 (Setup)
  └─→ Phase 2 (Foundational)
        ├─→ Phase 3 (US1+US2+US3, P1) ──→ Phase 5 (US5, P2)
        ├─→ Phase 4 (US4, P2) ──→ Phase 6 (US6, P3)
        └─────────────────────────────────→ Phase 7 (Polish)
```

### Recommended Execution Order (Single Developer)

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7

### Parallel Opportunities Per Phase

**Phase 1**: T002 and T003 can run in parallel (different files, no shared imports)
**Phase 2**: T008, T009, T010 can run in parallel (independent components)
**Phase 3**: T013+T014, T016, T017, T018 can run in parallel (independent components). T011 and T012 are sequential (hooks depend on service).
**Phase 4**: T025 and T026 can run in parallel (independent components)
**Phase 5**: T031 can run in parallel with other phases
**Phase 6**: T038, T039, T040 can run in parallel (independent components)
**Phase 7**: T047 and T048 can run in parallel (different audit concerns)

---

## Parallel Example: Phase 3 Components

```text
# After T011 (service) and T012 (hooks) complete, launch all components in parallel:
T013: "Create KPICard in src/features/reports/components/KPICard.tsx"
T014: "Create ClassFilter in src/features/reports/components/ClassFilter.tsx"
T016: "Create AttendanceTrendChart in src/features/reports/components/AttendanceTrendChart.tsx"
T017: "Create ScoreDistributionChart in src/features/reports/components/ScoreDistributionChart.tsx"
T018: "Create LevelDistributionChart in src/features/reports/components/LevelDistributionChart.tsx"
```

## Parallel Example: Phase 6 Components

```text
# After T036 (service) and T037 (hooks) complete, launch all components in parallel:
T038: "Create ChildScoreTrendChart in src/features/reports/components/ChildScoreTrendChart.tsx"
T039: "Create ChildAttendanceSummary in src/features/reports/components/ChildAttendanceSummary.tsx"
T040: "Create ChildGamificationSummary in src/features/reports/components/ChildGamificationSummary.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 3: Admin Reports Dashboard Only)

1. Complete Phase 1: Setup (types, utils, migration)
2. Complete Phase 2: Foundational (shared components, useTimePeriod)
3. Complete Phase 3: Admin Reports Dashboard (US1+US2+US3)
4. **STOP and VALIDATE**: Test admin dashboard independently — KPIs, charts, filters, empty states
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (Admin Dashboard) → Test → Deploy **(MVP!)**
3. Phase 4 (Teacher Class Progress) → Test → Deploy
4. Phase 5 (Admin Teacher Activity) → Test → Deploy
5. Phase 6 (Parent Child Progress) → Test → Deploy
6. Phase 7 (Polish) → Final verification → Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1+US2+US3 combined into one phase because they share the same screen, service, and hooks
- All i18n tasks include both `en.json` and `ar.json` updates
- Column name: DB uses `recitation_quality` (not `recitation_score`) — all services must use correct name
- All RPC functions use SECURITY INVOKER + SET search_path = public
- All hooks use 5-minute staleTime per NFR-003
- All screens include pull-to-refresh per FR-019
