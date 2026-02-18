# Contract: ParentReportsService

**File**: `src/features/reports/services/parent-reports.service.ts`

## Class: ParentReportsService

### RP-011: getChildProgressReport

```typescript
async getChildProgressReport(studentId: string, classId: string, dateRange: DateRange): Promise<ChildProgressReport>
```

Orchestrates parallel fetches via Promise.all:
1. `getChildScoreTrend(studentId, classId, dateRange)`
2. `getChildAttendanceSummary(studentId, dateRange)`
3. `getChildGamificationSummary(studentId)`

Returns combined `ChildProgressReport` object.

**Maps to**: FR-012

### RP-012: getChildScoreTrend

```typescript
async getChildScoreTrend(studentId: string, classId: string, dateRange: DateRange): Promise<ChildScoreTrendPoint[]>
```

Calls `supabase.rpc('get_child_score_trend', { p_student_id, p_class_id, p_start_date, p_end_date, p_granularity })`. Returns child's 3 score lines plus class average reference lines per time bucket.

**Maps to**: FR-012 (score trends with class average reference)

### RP-013: getChildAttendanceSummary

```typescript
async getChildAttendanceSummary(studentId: string, dateRange: DateRange): Promise<ChildAttendanceSummary>
```

Direct query on attendance table: counts by status for the student within date range. Computes rate = (present + late) / (present + absent + late) * 100.

**Maps to**: FR-012 (attendance summary), FR-014

### RP-014: getChildGamificationSummary

```typescript
async getChildGamificationSummary(studentId: string): Promise<ChildGamificationSummary>
```

Parallel queries:
1. Student record (total_points, current_level, current_streak, longest_streak) with levels join
2. COUNT student_stickers for student
3. COUNT student_achievements for student

**Maps to**: FR-012 (sticker/achievement history)

## Export

```typescript
export const parentReportsService = new ParentReportsService();
```
