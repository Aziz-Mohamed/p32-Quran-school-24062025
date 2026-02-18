# Research: Reports & Analytics

**Feature**: 002-reports-analytics | **Date**: 2026-02-12

## Decision 1: Client-Side vs RPC Aggregation

**Decision**: Hybrid — Supabase RPC functions for time-series aggregations, client-side for simple counts and distributions.

**Rationale**: A school with 500 students over 12 months produces ~120K attendance rows and ~60K session rows. Transferring all rows to the client for every report view is wasteful and risks exceeding the 3-second load target (SC-002). PostgreSQL's `date_trunc()` and `GROUP BY` handle time-series aggregation natively and efficiently.

**RPC functions (server-side) for:**
- Attendance trends — `date_trunc`-based grouping with adaptive granularity, rate formula `(present + late) / (present + absent + late)`
- Score trends — grouping session scores by time bucket, three separate averages per bucket
- Teacher activity — joining sessions + student_stickers + profiles with COUNT DISTINCT
- Students needing attention — window functions comparing last 3 vs previous 3 session averages
- Child score trend with class average — individual + class aggregate in a single query

**Client-side for:**
- KPI card counts — simple COUNT queries (lightweight, already done by admin dashboard)
- Score distribution bucketing — one average per student, then bucket into 4 ranges client-side (max 500 values)
- Level distribution — fetch current_level values and count by level (max 500 values)

**Alternatives considered:**
- Full client-side: Rejected — transferring 120K+ rows per report view is too slow
- Full RPC: Rejected — overkill for simple counts; adds unnecessary migration complexity
- Materialized views: Rejected — unnecessary at Phase 2 scale (500 students), adds refresh complexity

**Note**: This is the first use of `supabase.rpc()` in the codebase. Each RPC function uses `SECURITY INVOKER` (default) so existing RLS policies apply, and includes `SET search_path = public` per project convention.

## Decision 2: Victory Native v41 Chart Patterns

**Decision**: Use victory-native v41's `CartesianChart` API with `Line` and `Bar` components. Create a `ChartContainer` wrapper for consistent loading/empty/error states and sizing.

**Rationale**: Victory-native v41 uses a declarative Skia-based rendering pipeline via `CartesianChart`. The key API:
- `CartesianChart` takes `data`, `xKey`, `yKeys` props
- Children receive `{ points, chartBounds }` via render function
- `Line` component for time-series, `Bar` for distributions
- Multi-line support is native — pass multiple yKeys and render separate `Line` components

**Chart color assignments:**
- Memorization: `colors.primary[500]` (teal #0D9488)
- Tajweed: `colors.secondary[500]` (gold #F5A623)
- Recitation: `colors.semantic.info` (blue #3B82F6)
- Attendance rate: `colors.semantic.success` (green #10B981)
- Class average reference: `colors.neutral[400]` with dashed stroke

**RTL considerations**: Victory-native renders on Skia canvas independent of RN layout direction. Time-series charts universally read left-to-right (mathematical convention). Wrapping UI (titles, legends, filters) uses logical CSS properties. No chart-level RTL flipping needed.

**Alternatives considered:**
- react-native-chart-kit: Rejected — less flexible, no multi-line support, wrapper around react-native-svg
- Custom SVG charts: Rejected — too much effort for the same result
- Recharts (web-only): N/A — not compatible with React Native

## Decision 3: Time-Series Aggregation in PostgreSQL

**Decision**: RPC functions accept `granularity TEXT` parameter ('day', 'week', 'month') and use `date_trunc(granularity, date_column)` for grouping. Service layer computes date boundaries and granularity from the `TimePeriod` enum.

**Granularity mapping (FR-016):**
- `this_week` → granularity='day', start=Monday of current week, end=today
- `this_month` → granularity='day', start=1st of current month, end=today
- `this_term` → granularity='week', start=3 months ago, end=today
- `all_time` → granularity='month', start=earliest possible, end=today

**Rationale**: `date_trunc` is a built-in PostgreSQL function that efficiently truncates timestamps to specified precision. Combined with `GROUP BY`, this produces exactly the right number of data points per period (7-30 for daily, ~13 for weekly, ~12+ for monthly).

**Column name note**: The sessions table column is `recitation_quality` (not `recitation_score`). The reports feature uses the correct column name. Some existing services incorrectly reference `recitation_score` — this is a pre-existing issue outside this feature's scope.
