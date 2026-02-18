# Full Spec Review Checklist: Reports & Analytics

**Purpose**: Comprehensive requirements quality validation across all spec sections — data accuracy, charts, multi-role access, edge cases, and plan alignment
**Created**: 2026-02-12
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)
**Depth**: Standard | **Audience**: Author (pre-implementation)
**Resolved**: 2026-02-12 — All 48 items addressed via spec update

## Requirement Completeness

- [x] CHK001 - Are loading state requirements defined for each report screen (admin dashboard, class progress, child progress)? → **Resolved**: Added FR-017 (loading skeletons per screen)
- [x] CHK002 - Are error state requirements defined for when RPC functions or queries fail? → **Resolved**: Added FR-018 (error state with retry, per-section isolation)
- [x] CHK003 - Are pull-to-refresh or manual refresh requirements specified for report screens? → **Resolved**: Added FR-019 (pull-to-refresh invalidates cache)
- [x] CHK004 - Are requirements defined for what the admin reports dashboard shows before any time period is selected (default state)? → **Resolved**: Updated FR-002 (default = "This Month")
- [x] CHK005 - Are chart axis label requirements specified (date formatting, number formatting, i18n)? → **Resolved**: Added FR-020 (axis formatting rules per granularity and data type)
- [x] CHK006 - Are color/visual coding requirements defined for the score range labels (Needs Improvement, Developing, Proficient, Excellent)? → **Resolved**: Updated FR-004 (specific hex colors per range) and added FR-021 (color-coded legend)
- [x] CHK007 - Are requirements defined for the "students needing attention" list ordering and maximum count? → **Resolved**: Updated FR-011 (max 10, sorted by decline magnitude)
- [x] CHK008 - Is the teacher activity summary sort order specified (by sessions? by name? by last active?)? → **Resolved**: Updated FR-007 (sorted by sessions desc, inactive section sorted by name)

## Requirement Clarity

- [x] CHK009 - Is "meaningful empty states" quantified with specific content/messaging per chart type, or only illustrated by example? → **Resolved**: Updated FR-013 with specific messages for each chart type (6 messages)
- [x] CHK010 - Is "visually distinguished" for inactive teachers defined with specific visual treatment? → **Resolved**: Updated US-5 scenario 3 (separate "Inactive This Period" section, muted/greyed-out style, "0 sessions" label)
- [x] CHK011 - Is the boundary between "This Week" periods clearly defined — does it start on Monday or Sunday? → **Resolved**: Added A-010 (Monday start, ISO 8601)
- [x] CHK012 - Is "All Time" start date defined — does it go back to school creation, first data record, or a fixed date? → **Resolved**: Added A-011 (school's created_at date)
- [x] CHK013 - Are the score range boundaries inclusive or exclusive (e.g., does a 2.0 score fall in "1-2" or "2-3")? → **Resolved**: Updated FR-004 ([1,2) [2,3) [3,4) [4,5] notation with inclusive/exclusive bounds)
- [x] CHK014 - Is "recent scores have declined compared to their previous period" quantified with the same A-003 logic in FR-011 as in A-003? → **Resolved**: Updated FR-011 to explicitly reference "A-003 decline algorithm" and updated A-003 with scoping details
- [x] CHK015 - Is the KPI "average scores" defined — average across all students, all sessions, or both? → **Resolved**: Updated FR-001 and A-004 with two-level mean definition (per-student avg, then mean of student avgs)

## Requirement Consistency

- [x] CHK016 - Does the attendance rate formula in FR-014 consistently match the edge case definition and A-005? → **Resolved**: FR-014, Edge Case 6, and A-005 all use the same formula. FR-014 now also addresses zero denominator (display "N/A")
- [x] CHK017 - Are the three score types consistently named across spec, plan, and data-model (memorization/tajweed/recitation vs recitation_quality column name)? → **Resolved**: Added explicit note in Key Entities / Class Analytics that DB column is `recitation_quality` not `recitation_score`
- [x] CHK018 - Does US-4 acceptance scenario 1 ("average session scores (memorization, tajweed, recitation)") align with A-004's clarification that trend charts show separate lines while summaries use a mean? → **Resolved**: US-4 scenario 1 shows summary metrics (3 named scores), scenario 3 shows trend chart (3 separate lines), A-004 clarifies both patterns — now consistent
- [x] CHK019 - Is the parent child progress screen location consistent between A-009 ("child detail screen as additional section or tab") and the plan ("new route at progress/[childId]")? → **Resolved**: Updated A-009 to explicitly state "separate screen via View Progress button, routed to progress/[childId]"
- [x] CHK020 - Are time period names consistent across FR-002 ("This Week / This Month / This Term / All Time") and the data-model's TimePeriod enum ("this_week / this_month / this_term / all_time")? → **Resolved**: Added snake_case equivalents in Key Entities / Report Period definition

## Acceptance Criteria Quality

- [x] CHK021 - Can SC-002 ("within 3 seconds for 500 students and 12 months") be objectively measured without defining the test environment or network conditions? → **Resolved**: Updated SC-002 with device tier (mid-range, Samsung Galaxy A54 equivalent) and network (4G mobile)
- [x] CHK022 - Can SC-003 ("identify underperforming classes...without visiting each class individually") be objectively verified — what constitutes "underperforming"? → **Resolved**: Updated SC-003 to define "underperforming" as attendance rate OR avg score below school-wide average
- [x] CHK023 - Can SC-004 ("within 10 seconds of opening") be measured without defining what "identify" means — seeing the list? understanding the data? → **Resolved**: Updated SC-004 to define "identify" as seeing the rendered list with student names and decline indicators
- [x] CHK024 - Is SC-001 ("within 2 taps from admin dashboard") testable given the plan adds reports as a nav card (1 tap)? → **Resolved**: Updated SC-001 to "1 tap via Reports navigation card"
- [x] CHK025 - Does SC-006 ("no discrepancy between dashboard totals and report aggregations") define acceptable tolerance for floating-point rounding differences? → **Resolved**: Updated SC-006 with tolerances (±0.1 for scores, ±1% for attendance, zero tolerance for integer counts)

## Scenario Coverage

- [x] CHK026 - Are requirements defined for what happens when a teacher has zero assigned classes and opens the Class Progress screen? → **Resolved**: Added Edge Case 7 (empty state: "No classes assigned — contact your school admin")
- [x] CHK027 - Are requirements defined for a parent whose child has no class_id (unassigned) — can they see a progress report without class average reference? → **Resolved**: Added Edge Case 8 and updated FR-012 (omit class avg reference line, show note)
- [x] CHK028 - Are requirements defined for how the admin attendance trend chart handles days with zero expected students (e.g., weekends, holidays)? → **Resolved**: Added Edge Case 9 (skip days with no records, connect adjacent points)
- [x] CHK029 - Are requirements defined for the admin reports when the school has zero teachers? → **Resolved**: Added Edge Case 10 (empty state: "No teachers registered yet")
- [x] CHK030 - Are navigation requirements defined for how a teacher accesses the Class Progress screen — from dashboard, from a new tab, or both? → **Resolved**: Updated A-008 to resolve: "accessible from teacher tab navigation as a new Class Progress tab"

## Edge Case Coverage

- [x] CHK031 - Is the single-data-point chart behavior defined beyond "a note that more data is needed" — what does the chart render? → **Resolved**: Updated Edge Case 4 (render as single dot/marker, text note below, do not render a line)
- [x] CHK032 - Are requirements defined for students with sessions but all scores NULL (teacher logged session without scoring)? → **Resolved**: Added Edge Case 11 (exclude from score calcs/distribution, still check for attention list via non-NULL sessions)
- [x] CHK033 - Are requirements defined for how the attendance rate handles a period with zero qualifying days (denominator = 0)? → **Resolved**: Updated FR-014 and added Edge Case 12 (display "N/A")
- [x] CHK034 - Are requirements defined for the teacher activity summary when a teacher's profile exists but they have been deactivated (is_active=false)? → **Resolved**: Added Edge Case 13 (exclude from teacher activity list, session data still counts in class metrics)
- [x] CHK035 - Are requirements defined for class filter behavior when a class has students but zero sessions or attendance in the selected period? → **Resolved**: Covered by Edge Case 1 (expanded to "class with zero data in period" — empty state per chart with guidance)
- [x] CHK036 - Are requirements defined for the score distribution chart when all students fall in the same range? → **Resolved**: Added Edge Cases 14 and 16 (render normally with one bar, show "0" on empty bars)

## Non-Functional Requirements

- [x] CHK037 - Are accessibility requirements specified for chart components (screen reader descriptions, color-blind safe palette)? → **Resolved**: Added NFR-001 (accessibilityLabel per chart) and NFR-002 (color-blind-safe palette with dash patterns)
- [x] CHK038 - Are requirements defined for chart rendering performance on lower-end devices? → **Resolved**: Updated SC-002 with device tier (mid-range smartphone) and added Out of Scope item for devices older than 3 years
- [x] CHK039 - Are caching/staleness requirements defined for report data — how fresh must the data be? → **Resolved**: Added NFR-003 (5-minute staleTime, pull-to-refresh bypass) and A-012 (freshness expectation)
- [x] CHK040 - Are offline/connectivity-loss requirements defined for report screens? → **Resolved**: Added NFR-004 (show cached data with offline banner, or error state if no cache)
- [x] CHK041 - Are RTL requirements for chart components explicitly specified or only assumed via constitution? → **Resolved**: Added A-013 (Skia canvas direction-agnostic, surrounding UI follows RTL via I18nManager)

## Dependencies & Assumptions

- [x] CHK042 - Is the assumption that "on-demand computation suffices for 500 students" (A-001) validated with estimated query execution times? → **Resolved**: Updated A-001 with estimated execution time (under 2 seconds for most complex RPC, based on indexed columns)
- [x] CHK043 - Is the assumption that "This Term = last 3 calendar months" (A-002) documented as a product decision vs. a placeholder — will schools expect configurable academic terms? → **Resolved**: Updated A-002 to explicitly state "product decision — configurable terms out of scope, may revisit in future phase"
- [x] CHK044 - Is the dependency on existing RLS policies for RPC function security explicitly validated — do current policies cover the new query patterns? → **Resolved**: Added A-014 (SECURITY INVOKER + existing RLS = sufficient, no new policies needed)
- [x] CHK045 - Is the dependency on victory-native v41 API stability documented — are the CartesianChart/Line/Bar APIs stable or beta? → **Resolved**: Added A-015 (considered stable, already in project dependencies)

## Ambiguities & Conflicts

- [x] CHK046 - Does FR-012 ("score trends with class average as reference line") specify what happens when the class average has no data for a time bucket but the child does? → **Resolved**: Added Edge Case 15 (reference line gaps independently of child lines, and vice versa)
- [x] CHK047 - Does the spec distinguish between "average score" as mean-of-three-types vs. mean-of-all-sessions — both interpretations are used? → **Resolved**: Updated FR-001 and A-004 with precise two-level mean definition (per-student avg of 3 types across sessions, then mean of student avgs)
- [x] CHK048 - Is the "students needing attention" logic in FR-011 scoped to the selected time period or always based on the student's most recent sessions regardless of filter? → **Resolved**: Updated FR-011 ("within the selected time period") and A-003 ("applies within the selected time period's date range" with fallback for <3 sessions)

## Notes

- `[Gap]` = missing requirement, needs spec update or explicit "deferred" decision
- `[Ambiguity]` = vague language requiring quantification or clarification
- `[Consistency]` = spec sections or spec-vs-plan contradict each other
- `[Conflict]` = confirmed contradiction requiring resolution
- `[Assumption]` = stated assumption needing validation
- `[Dependency]` = external dependency needing verification
- ~~Items marked as failing require spec updates before implementation begins~~
- **All 48 items resolved** — spec updated with new FRs (FR-017 through FR-021), NFRs (NFR-001 through NFR-004), new assumptions (A-010 through A-015), 10 new edge cases (7-16), and clarifications to existing requirements
