# Contract: TeacherReportsService

**File**: `src/features/reports/services/teacher-reports.service.ts`

## Class: TeacherReportsService

### RP-006: getClassAnalytics

```typescript
async getClassAnalytics(classId: string, dateRange: DateRange): Promise<ClassAnalytics>
```

Fetches class-level analytics using parallel queries:
1. Class name and student count from classes + students
2. Attendance rate for the class within date range
3. Average scores (memorization, tajweed, recitation) from sessions within date range
4. Level distribution (students grouped by current_level)

**Maps to**: FR-008

### RP-007: getClassScoreTrend

```typescript
async getClassScoreTrend(schoolId: string, classId: string, dateRange: DateRange): Promise<ScoreTrendPoint[]>
```

Calls `supabase.rpc('get_score_trend', { p_school_id, p_start_date, p_end_date, p_granularity, p_class_id })`. Maps response to `ScoreTrendPoint[]` (three separate lines: memorization, tajweed, recitation).

**Maps to**: FR-010

### RP-008: getClassAttendanceTrend

```typescript
async getClassAttendanceTrend(schoolId: string, classId: string, dateRange: DateRange): Promise<AttendanceTrendPoint[]>
```

Calls `supabase.rpc('get_attendance_trend', { p_school_id, p_start_date, p_end_date, p_granularity, p_class_id: classId })`. Reuses the same RPC as admin with class filter.

**Maps to**: FR-008

### RP-009: getStudentsNeedingAttention

```typescript
async getStudentsNeedingAttention(classId: string, dateRange: DateRange): Promise<StudentNeedingAttention[]>
```

Calls `supabase.rpc('get_students_needing_attention', { p_class_id, p_start_date, p_end_date })`. Scopes to the selected time period per FR-011. Implements A-003 logic within the date range: avg last 3 sessions < avg previous 3, OR any score < 3 in last 2 sessions. If fewer than 3 sessions in range, only the low-scores criterion applies.

**Maps to**: FR-011

### RP-010: getTeacherClasses

```typescript
async getTeacherClasses(teacherId: string): Promise<Array<{ id: string; name: string }>>
```

Fetches classes where teacher_id matches and is_active=true. Used for the class selector dropdown on the class progress screen.

**Maps to**: FR-009

## Export

```typescript
export const teacherReportsService = new TeacherReportsService();
```
