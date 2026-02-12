# Contract: AdminReportsService

**File**: `src/features/reports/services/admin-reports.service.ts`

## Class: AdminReportsService

### RP-001: getSchoolKPIs

```typescript
async getSchoolKPIs(schoolId: string, dateRange: DateRange): Promise<SchoolKPISummary>
```

Fetches school-wide KPI summary using parallel queries (Promise.all):
1. COUNT students WHERE is_active=true AND school_id
2. COUNT profiles WHERE role='teacher' AND school_id
3. COUNT classes WHERE is_active=true AND school_id
4. Attendance rate: COUNT by status within date range, apply formula
5. Average scores: AVG of memorization_score, tajweed_score, recitation_quality within date range
6. COUNT student_stickers within date range (via awarded_at)

**Maps to**: FR-001, FR-002

### RP-002: getAttendanceTrend

```typescript
async getAttendanceTrend(schoolId: string, dateRange: DateRange, classId?: string): Promise<AttendanceTrendPoint[]>
```

Calls `supabase.rpc('get_attendance_trend', { p_school_id, p_start_date, p_end_date, p_granularity, p_class_id })`. Maps snake_case response to camelCase `AttendanceTrendPoint[]`.

**Maps to**: FR-003, FR-016

### RP-003: getScoreDistribution

```typescript
async getScoreDistribution(schoolId: string, dateRange: DateRange, classId?: string): Promise<ScoreDistributionBucket[]>
```

Fetches per-student average scores (mean of memorization, tajweed, recitation) for sessions within date range. Optionally filtered by class. Buckets client-side into 4 ranges:
- 1-2: "Needs Improvement"
- 2-3: "Developing"
- 3-4: "Proficient"
- 4-5: "Excellent"

**Maps to**: FR-004, FR-006

### RP-004: getLevelDistribution

```typescript
async getLevelDistribution(schoolId: string, classId?: string): Promise<LevelDistributionBucket[]>
```

Fetches students grouped by current_level. Joins levels table for title. Optionally filtered by class. Client-side grouping (max 10 levels x 500 students).

**Maps to**: FR-005, FR-006

### RP-005: getTeacherActivity

```typescript
async getTeacherActivity(schoolId: string, dateRange: DateRange): Promise<TeacherActivitySummary[]>
```

Calls `supabase.rpc('get_teacher_activity', { p_school_id, p_start_date, p_end_date })`. Maps snake_case response to camelCase `TeacherActivitySummary[]`.

**Maps to**: FR-007

## Export

```typescript
export const adminReportsService = new AdminReportsService();
```
