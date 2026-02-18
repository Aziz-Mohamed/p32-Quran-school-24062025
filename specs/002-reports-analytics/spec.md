# Feature Specification: Reports & Analytics

**Feature Branch**: `002-reports-analytics`
**Created**: 2026-02-11
**Status**: Draft
**Input**: Admin reports and teacher class progress analytics — Phase 2 enhancement for school-wide and class-level reporting with charts, attendance trends, performance distribution, and teacher activity summaries

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Views School-Wide Reports Dashboard (Priority: P1)

An admin opens the Reports section and sees a consolidated overview of their school's health. This includes key performance indicators such as overall attendance rate for a chosen time period, average student scores, student enrollment count, and gamification engagement metrics. The dashboard surfaces trends so the admin can identify whether the school is improving, stable, or declining.

**Why this priority**: Admins need a single place to understand school performance. Without aggregated data, they are forced to check individual student/class screens — which does not scale. This is the foundation all other reports build upon.

**Independent Test**: Can be fully tested by navigating to the Reports screen as admin and verifying that all KPI cards display accurate, up-to-date school-wide metrics. Delivers immediate value by giving admins visibility they currently lack.

**Acceptance Scenarios**:

1. **Given** an admin with an active school containing students, classes, and sessions, **When** they open the Reports screen, **Then** they see KPI cards showing: total active students, total active teachers, total classes, overall attendance rate (for selected period), and average session scores.
2. **Given** an admin viewing the reports dashboard, **When** they select a different time period (this week / this month / this term / all time), **Then** all metrics and charts update to reflect data from the selected period.
3. **Given** an admin whose school has no sessions or attendance data, **When** they open the Reports screen, **Then** they see meaningful empty states (e.g., "No attendance data yet — start marking attendance to see trends") instead of broken charts or zero values.

---

### User Story 2 - Admin Views Attendance Trends (Priority: P1)

An admin views an attendance trend chart that shows how attendance rates have changed over time. The chart displays daily or weekly data points for a selected time range. The admin can optionally filter by class to compare class-level attendance. This helps identify patterns like declining attendance on certain days or in certain classes.

**Why this priority**: Attendance is the most critical operational metric for a Quran school. Admins need to spot attendance problems early. This directly impacts student outcomes and parent satisfaction.

**Independent Test**: Can be tested by verifying the chart renders correctly with historical attendance data, responds to time period filters, and accurately reflects the underlying attendance records.

**Acceptance Scenarios**:

1. **Given** attendance data spanning at least 4 weeks, **When** the admin views the attendance trends chart, **Then** a line chart displays attendance rate per day or per week (based on time period), with the x-axis showing dates and the y-axis showing percentage (0-100%).
2. **Given** the admin is viewing attendance trends, **When** they filter by a specific class, **Then** the chart shows only attendance data for students in that class.
3. **Given** the admin selects "This Month" time period, **When** the chart renders, **Then** it shows daily data points for the current month with a clear visual indicator of the school-wide average attendance rate.

---

### User Story 3 - Admin Views Performance Distribution (Priority: P1)

An admin views a visualization showing how students are distributed across performance levels. This includes a bar chart of average session scores and a breakdown of students by their current gamification level. The admin can filter by class to compare class performance.

**Why this priority**: Understanding performance distribution helps admins identify whether the school's teaching is effective and where interventions are needed. It complements attendance trends to form a complete school health picture.

**Independent Test**: Can be tested by verifying score distribution charts render accurately and match the underlying session/level data. Delivers value by answering "how well are our students doing overall?"

**Acceptance Scenarios**:

1. **Given** session data with scores exists, **When** the admin views the performance distribution, **Then** a bar chart shows the distribution of average student scores across ranges (1-2: Needs Improvement, 2-3: Developing, 3-4: Proficient, 4-5: Excellent).
2. **Given** students at various gamification levels, **When** the admin views the level distribution, **Then** a horizontal bar chart shows how many students are at each level (Beginner through Quran Guardian).
3. **Given** the admin filters by a specific class, **When** the performance charts render, **Then** they reflect only students and sessions from that class.

---

### User Story 4 - Teacher Views Class Progress Analytics (Priority: P2)

A teacher opens the Class Progress screen and sees analytics for their assigned class(es). This includes class average scores over time, attendance rate, student level distribution, and a list of students needing attention. If a teacher has multiple classes, they can switch between them.

**Why this priority**: Teachers need class-level insights to adjust their teaching approach. While individual student views exist, teachers lack an aggregated class view to understand overall class trajectory.

**Independent Test**: Can be tested by logging in as a teacher with an assigned class and verifying that all class metrics display correctly. Delivers value by helping teachers identify class-wide patterns.

**Acceptance Scenarios**:

1. **Given** a teacher with one or more assigned classes, **When** they open the Class Progress screen, **Then** they see: class average attendance rate, average session scores (memorization, tajweed, recitation), and student count by level.
2. **Given** a teacher with multiple classes, **When** they switch between classes using a selector, **Then** all analytics update to reflect the selected class.
3. **Given** a teacher's class has sessions spanning multiple weeks, **When** they view the scores trend chart, **Then** a line chart shows three separate lines (memorization, tajweed, recitation) with weekly averages over time.
4. **Given** a teacher views class progress, **When** they look at the "students needing attention" section, **Then** they see up to 10 students whose scores have declined per the A-003 algorithm, ordered by decline magnitude (largest decline first).

---

### User Story 5 - Admin Views Teacher Activity Summary (Priority: P2)

An admin views a summary of teacher activity across the school, showing how many sessions each teacher has logged, how many students they have evaluated, and their sticker-awarding frequency. This helps admins ensure all teachers are engaged and workload is balanced.

**Why this priority**: Operational oversight requires understanding teacher engagement. This is secondary to student-facing metrics but important for school management.

**Independent Test**: Can be tested by verifying teacher activity cards display accurate session counts and sticker counts matching the database. Delivers value by highlighting teachers who may need support or recognition.

**Acceptance Scenarios**:

1. **Given** an admin viewing teacher activity, **When** the summary loads, **Then** each teacher card shows: sessions logged (in selected period), unique students evaluated, stickers awarded, and last active date.
2. **Given** a selected time period, **When** the admin changes it, **Then** teacher activity metrics update to reflect only activity within that period.
3. **Given** a teacher who has logged zero sessions in the selected period, **When** the admin views the summary, **Then** that teacher appears in a separate "Inactive This Period" section below active teachers, with their card displayed in a muted/greyed-out style and a "0 sessions" label.

---

### User Story 6 - Parent Views Child Progress Report (Priority: P3)

A parent views a progress summary for their child that includes score trends over time, attendance summary, and sticker/achievement history. This provides parents with a comprehensive view beyond the daily dashboard snapshot.

**Why this priority**: While parents already see daily activity on the dashboard, they lack historical trends. This is lower priority because the parent dashboard already surfaces the most important data.

**Independent Test**: Can be tested by verifying trend charts render for a parent's child with historical session/attendance data. Delivers value by deepening parent understanding of their child's trajectory.

**Acceptance Scenarios**:

1. **Given** a parent with a linked child who has session history, **When** they view the child's progress report, **Then** they see a line chart of session scores (memorization, tajweed, recitation as separate lines with class average as a dashed reference line), and an attendance summary for the selected period.
2. **Given** a parent's child has earned stickers and achievements, **When** they view the progress report, **Then** they see total stickers earned, achievements unlocked, and current level/streak information.

---

### Edge Cases

1. **Class with zero data in period**: When a class has zero sessions or zero attendance records for the selected time period, display a meaningful empty state per chart with guidance (e.g., "No sessions logged this week — scores will appear after the next session"), not empty or broken charts.
2. **Teacher assigned mid-term**: When a teacher is assigned to a class mid-term and historical data exists from a previous teacher, show all class data regardless of which teacher was assigned at the time.
3. **Student transfers between classes**: The student's data appears in whichever class they currently belong to. Historical sessions remain linked to the class they were logged under.
4. **Single data point in period**: When the selected time period has only one data point, render it as a single dot/marker on the chart with a text note below: "Only one data point — more data is needed for trend analysis." Do not render a line.
5. **Attendance without sessions**: When attendance has been marked but no sessions have been logged, attendance charts display normally; score charts show an empty state with "No sessions logged in this period."
6. **Excused absence treatment**: Excused absences are excluded from the denominator (they don't count as present or absent). Attendance rate = (present + late) / (present + absent + late).
7. **Teacher with zero assigned classes**: When a teacher has no assigned classes (is_active classes where teacher_id matches), the Class Progress screen shows an empty state: "No classes assigned — contact your school admin."
8. **Child without class assignment**: When a parent's child has no class_id (unassigned student), the progress report shows the child's individual score trends and attendance without the class average reference line. A note states: "Class comparison unavailable — student is not assigned to a class."
9. **Weekends and holidays in attendance trends**: Days with zero expected students (no attendance records exist for that date) are skipped in the attendance trend chart. The chart connects adjacent data points without gaps.
10. **Admin school with zero teachers**: When a school has no teacher profiles, the teacher activity section shows an empty state: "No teachers registered yet."
11. **Sessions with all NULL scores**: Students who have sessions logged but all three score fields are NULL (teacher logged presence without scoring) are excluded from score calculations and score distribution. If such a student's non-NULL sessions show decline, they still appear in the "students needing attention" list.
12. **Zero qualifying attendance days (denominator = 0)**: When a period has no attendance records that are present, absent, or late (e.g., all excused or no records), the attendance rate displays as "N/A" instead of a numeric percentage.
13. **Deactivated teacher**: Teachers with is_active=false in their profile are excluded from the teacher activity summary. If a deactivated teacher has session data in the selected period (from before deactivation), that data is still counted in student/class metrics but the teacher does not appear in the teacher activity list.
14. **All students in same score range**: When all students fall into a single score distribution range, the bar chart renders normally with one populated bar and three zero-height bars. All four range labels are shown regardless. A count of "0" is displayed on empty bars.
15. **Class average data gap in parent view**: When the class average has no data for a time bucket but the child has data, the class average reference line shows a gap for that bucket while the child's lines continue. When the child has no data but the class does, the child's lines show a gap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a school-wide reports dashboard for admin users showing KPI cards (active students, active teachers, total classes, attendance rate, average scores, total stickers awarded) for a selected time period. "Average scores" on the KPI card is the mean of per-student averages, where each student's average is the simple mean of their memorization, tajweed, and recitation scores across all sessions in the period.
- **FR-002**: System MUST allow admins to filter all reports by time period: This Week, This Month, This Term (last 3 months), and All Time. The default selection when opening the reports screen is "This Month."
- **FR-003**: System MUST display an attendance trend chart (line chart) showing attendance rate over time, with the ability to filter by class.
- **FR-004**: System MUST display a performance distribution chart (bar chart) showing student score distribution across defined ranges with inclusive lower bounds and exclusive upper bounds: [1, 2) = "Needs Improvement", [2, 3) = "Developing", [3, 4) = "Proficient", [4, 5] = "Excellent" (the 4-5 range includes 5.0). Each range is color-coded: red (#EF4444) for Needs Improvement, amber (#F59E0B) for Developing, blue (#3B82F6) for Proficient, green (#22C55E) for Excellent.
- **FR-005**: System MUST display a student level distribution chart showing the count of students at each gamification level.
- **FR-006**: System MUST allow admins to filter performance and level distribution charts by class.
- **FR-007**: System MUST display a teacher activity summary showing sessions logged, unique students evaluated, stickers awarded, and last active date for each teacher. The list is sorted by sessions logged (descending), with teachers who have zero sessions in the period grouped into a separate "Inactive This Period" section sorted alphabetically by name.
- **FR-008**: System MUST provide a Class Progress screen for teachers showing class-level metrics: average attendance rate, average session scores, and student level distribution.
- **FR-009**: System MUST allow teachers with multiple classes to switch between classes on the Class Progress screen.
- **FR-010**: System MUST display a scores trend chart (line chart) on the Class Progress screen showing three separate lines (memorization, tajweed, recitation) with weekly averages over time.
- **FR-011**: System MUST display a "students needing attention" list on the Class Progress screen, showing up to 10 students matching the A-003 decline algorithm within the selected time period. The list is sorted by decline magnitude (largest decline in average score first). Each entry shows the student's name, current average score, and the direction/magnitude of change.
- **FR-012**: System MUST provide a child progress report view for parents showing score trends (memorization, tajweed, recitation as separate lines with class average as a dashed reference line), attendance summary, and sticker/achievement history for the selected period. If the child has no class assignment, the class average reference line is omitted.
- **FR-013**: System MUST display meaningful empty states when no data is available for the selected period/filters. Each chart type has a specific message:
  - Attendance trend: "No attendance data yet — start marking attendance to see trends."
  - Score distribution: "No session scores recorded in this period."
  - Level distribution: "No students enrolled yet."
  - Score trend: "No sessions logged yet — scores will appear after sessions are recorded."
  - Teacher activity: "No teacher activity in this period."
  - Students needing attention: "No students need attention — all students are on track."
- **FR-014**: System MUST calculate attendance rate by excluding excused absences from the denominator: rate = (present + late) / (present + absent + late). When the denominator is zero, display "N/A" instead of a numeric rate.
- **FR-015**: System MUST scope all report data to the current user's school (multi-tenant isolation).
- **FR-016**: System MUST use adaptive chart data granularity based on the selected time period: This Week = daily data points, This Month = daily data points, This Term = weekly data points, All Time = monthly data points.
- **FR-017**: System MUST display a loading skeleton (placeholder cards and chart outlines) while report data is being fetched. Each report screen (admin dashboard, class progress, child progress) shows its own loading state.
- **FR-018**: System MUST display an error state with a "Retry" button when report data fails to load (RPC failure, network error, or query timeout). The error message is generic: "Unable to load report data. Please try again." Individual chart sections that fail show their own error state without blocking other sections that loaded successfully.
- **FR-019**: System MUST support pull-to-refresh on all report screens, which invalidates cached data and refetches all visible report sections.
- **FR-020**: System MUST format chart axes as follows: x-axis dates use short format based on locale (e.g., "Mon", "Jan 5", "Week 3", "Jan 2026" depending on granularity), y-axis percentages show whole numbers with "%" suffix (e.g., "85%"), y-axis scores show one decimal place (e.g., "3.5").
- **FR-021**: Score range labels (Needs Improvement, Developing, Proficient, Excellent) MUST be color-coded using the palette defined in FR-004 and displayed as a legend below the score distribution chart.

### Non-Functional Requirements

- **NFR-001**: All chart components MUST include an `accessibilityLabel` that summarizes the chart's data in text form (e.g., "Attendance trend chart showing 85% average attendance over the last 4 weeks").
- **NFR-002**: The chart color palette MUST be distinguishable under common color vision deficiencies (protanopia, deuteranopia). Score trend lines use both color and distinct dash patterns: memorization = solid line, tajweed = dashed line, recitation = dotted line.
- **NFR-003**: Report data is cached with a 5-minute staleTime. Navigating away and back within 5 minutes serves cached data. Pull-to-refresh (FR-019) bypasses the cache.
- **NFR-004**: When the device is offline, report screens display the last cached data (if available) with a banner: "You are offline — showing last updated data." If no cached data exists, show the error state from FR-018.

### Key Entities

- **Report Period**: A time range filter applied to all analytics (This Week, This Month, This Term, All Time). The data model uses snake_case equivalents: `this_week`, `this_month`, `this_term`, `all_time`. Determines the date boundaries for data aggregation.
- **Attendance Trend**: A time-series data point containing a date, total students expected, and counts by status (present, absent, late, excused), aggregated at adaptive granularity (daily for This Week/This Month, weekly for This Term, monthly for All Time).
- **Score Distribution**: An aggregation showing how many students fall into each performance band based on their average session scores.
- **Teacher Activity Summary**: An aggregation per teacher showing session count, unique students evaluated, stickers awarded, and last active timestamp for a given period.
- **Class Analytics**: Aggregated metrics for a single class including average scores (memorization, tajweed, recitation — note: the database column for recitation is `recitation_quality`, not `recitation_score`), attendance rate, and student level distribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can access a complete school health overview (attendance, performance, teacher activity) from the reports screen, reachable in 1 tap via the Reports navigation card on the admin dashboard.
- **SC-002**: All charts and metrics load and render within 3 seconds for schools with up to 500 students and 12 months of data, measured on a mid-range smartphone (e.g., Samsung Galaxy A54 or equivalent) over a 4G mobile connection.
- **SC-003**: Admins can identify underperforming classes — defined as classes whose attendance rate OR average score falls below the school-wide average — by viewing the class-filtered charts, without visiting each class individually.
- **SC-004**: Teachers can identify students needing attention in their class — defined as seeing the rendered "students needing attention" list with student names and decline indicators — within 10 seconds of opening the Class Progress screen.
- **SC-005**: Parents can see their child's score trajectory over time, answering the question "is my child improving?" without contacting the teacher.
- **SC-006**: All report data is consistent with individual record screens. Acceptable tolerance: scores may differ by ±0.1 due to floating-point rounding, and attendance rates may differ by ±1 percentage point. No discrepancy should exist in integer counts (student count, session count, sticker count).
- **SC-007**: Time period filtering works correctly across all reports, and changing the period updates all visible metrics simultaneously.

## Assumptions

- **A-001**: Report data is computed on-demand from existing tables (sessions, attendance, students, student_stickers). No pre-aggregation tables or materialized views are needed for Phase 2 scale (up to 500 students per school). Estimated query execution time for the most complex RPC (get_score_trend with 12 months of data) is under 2 seconds based on indexed date columns and school_id partitioning.
- **A-002**: "This Term" means the last 3 calendar months from today, not an academic term configuration. This is a product decision — configurable academic terms are out of scope for this feature and may be revisited in a future phase.
- **A-003**: The "students needing attention" algorithm: average of last 3 sessions < average of previous 3 sessions, OR any score < 3 in the last 2 sessions. This applies within the selected time period's date range. If a student has fewer than 3 sessions in the period, only the "any score < 3 in last 2 sessions" criterion applies.
- **A-004**: Score trend charts always display three separate lines (memorization, tajweed, recitation). KPI "average scores" on the admin dashboard is a two-level mean: first compute each student's average (mean of their memorization, tajweed, and recitation scores across sessions in the period), then compute the mean of those student averages. This prevents students with more sessions from disproportionately affecting the school average.
- **A-005**: "Late" attendance counts as "present" for attendance rate purposes (student was there, just late), matching the formula: rate = (present + late) / (present + absent + late).
- **A-006**: Export functionality (PDF/CSV) is explicitly out of scope for this feature and deferred to Phase 3 per PRD.
- **A-007**: Admin reports screen is accessible via a Reports navigation card on the admin dashboard (1 tap access per SC-001).
- **A-008**: Teacher Class Progress screen is accessible from the teacher tab navigation as a new "Class Progress" tab.
- **A-009**: Parent child progress report is accessible as a separate screen navigated from the child detail screen via a "View Progress" button, routed to `progress/[childId]`.
- **A-010**: "This Week" starts on Monday and ends on Sunday (ISO 8601 week definition).
- **A-011**: "All Time" start date is the school's creation date (from the `schools.created_at` column). Data before that date does not exist by definition.
- **A-012**: Report data freshness: 5-minute staleTime is acceptable. Reports are not real-time — a delay of up to 5 minutes between data entry and report reflection is expected behavior.
- **A-013**: Chart rendering is direction-agnostic (Skia canvas does not flip). Surrounding UI elements (labels, legends, filters) follow the app's RTL settings via React Native's I18nManager. No chart-level RTL mirroring is required.
- **A-014**: Existing RLS policies on underlying tables (sessions, attendance, students, etc.) provide multi-tenant enforcement for all RPC functions, which use `SECURITY INVOKER` to execute queries as the calling user. No additional RLS policies are needed for the report feature.
- **A-015**: victory-native v41 CartesianChart, Line, and Bar APIs are considered stable for production use. The library is already installed in the project dependencies.

## Scope Boundaries

### In Scope
- Admin school-wide reports dashboard with KPIs and charts
- Admin attendance trend visualization (line chart)
- Admin performance distribution visualization (bar chart)
- Admin student level distribution visualization
- Admin teacher activity summary
- Teacher class progress analytics screen
- Parent child progress report view
- Time period filtering on all reports
- Class filtering on admin reports
- Multi-class switching for teachers
- Empty states for all report views
- Loading states for all report views
- Error states with retry for all report views
- Pull-to-refresh on all report screens
- Chart accessibility (screen reader labels, color-blind-safe patterns)
- Offline display of cached report data

### Out of Scope
- Report export (PDF/CSV) — Phase 3
- Scheduled/automated report delivery (email) — Phase 3
- Custom date range picker (only preset periods) — Future
- Cross-school comparisons — Phase 3
- Real-time report updates via subscriptions — Future
- Lesson-level analytics (completion rates per lesson) — Future
- Homework completion analytics — Future
- Chart rendering performance tuning for devices older than 3 years — Deferred

## Clarifications

### Session 2026-02-12

- Q: Should score trend charts display three separate lines (memorization, tajweed, recitation) or a single combined average? → A: Three separate lines — each score type tells a different story about the student's progress and enables targeted teacher intervention.
- Q: What data point granularity should each time period use? → A: Adaptive granularity — This Week = daily, This Month = daily, This Term = weekly, All Time = monthly.
- Q: Should the parent child progress report show class averages for comparison alongside the child's scores? → A: Yes — show the child's scores with the class average as a reference line on the same chart.
