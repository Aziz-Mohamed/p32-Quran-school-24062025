# Data Model: Reports & Analytics

**Feature**: 002-reports-analytics | **Date**: 2026-02-12

## Type Definitions

All types in `src/features/reports/types/reports.types.ts`.

### Time Period

```typescript
export type TimePeriod = 'this_week' | 'this_month' | 'this_term' | 'all_time';
export type TimeGranularity = 'day' | 'week' | 'month';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  granularity: TimeGranularity;
}
```

### Admin KPI Dashboard

```typescript
export interface SchoolKPISummary {
  activeStudents: number;
  activeTeachers: number;
  totalClasses: number;
  attendanceRate: number;         // 0-100
  averageScore: number;           // 1-5 (two-level mean per A-004: mean of per-student averages)
  totalStickersAwarded: number;
}
```

### Attendance Trend

```typescript
export interface AttendanceTrendPoint {
  date: string;     // ISO date of bucket start
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;     // (present + late) / (present + absent + late) * 100
}
```

### Score Trend

```typescript
export interface ScoreTrendPoint {
  date: string;
  memorization: number;
  tajweed: number;
  recitation: number;
}
```

### Score Distribution

```typescript
export type ScoreRange = '1-2' | '2-3' | '3-4' | '4-5';

export interface ScoreDistributionBucket {
  range: ScoreRange;
  label: string;  // "Needs Improvement", "Developing", "Proficient", "Excellent"
  count: number;
}
```

### Level Distribution

```typescript
export interface LevelDistributionBucket {
  levelNumber: number;
  title: string;
  count: number;
}
```

### Teacher Activity

```typescript
export interface TeacherActivitySummary {
  teacherId: string;
  fullName: string;
  avatarUrl: string | null;
  sessionsLogged: number;
  uniqueStudentsEvaluated: number;
  stickersAwarded: number;
  lastActiveDate: string | null;
}
```

### Class Analytics (Teacher)

```typescript
export interface ClassAnalytics {
  classId: string;
  className: string;
  studentCount: number;
  attendanceRate: number;
  averageMemorization: number;
  averageTajweed: number;
  averageRecitation: number;
  levelDistribution: LevelDistributionBucket[];
}
```

### Students Needing Attention

```typescript
export interface StudentNeedingAttention {
  studentId: string;
  fullName: string;
  avatarUrl: string | null;
  currentAvg: number;    // avg of last 3 sessions
  previousAvg: number;   // avg of previous 3 sessions
  declineAmount: number;
  flagReason: 'declining' | 'low_scores';
}
```

### Parent Child Progress

```typescript
export interface ChildScoreTrendPoint {
  date: string;
  memorization: number;
  tajweed: number;
  recitation: number;
  classAvgMemorization: number;
  classAvgTajweed: number;
  classAvgRecitation: number;
}

export interface ChildAttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  rate: number; // 0-100
}

export interface ChildGamificationSummary {
  totalStickers: number;
  achievementsUnlocked: number;
  currentLevel: number;
  currentLevelTitle: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

export interface ChildProgressReport {
  scoreTrend: ChildScoreTrendPoint[];
  attendanceSummary: ChildAttendanceSummary;
  gamification: ChildGamificationSummary;
}
```

## RPC Function Signatures

Migration file: `supabase/migrations/00002_report_rpc_functions.sql`

### get_attendance_trend

```sql
CREATE OR REPLACE FUNCTION get_attendance_trend(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT,        -- 'day', 'week', 'month'
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  bucket_date DATE,
  present_count BIGINT,
  absent_count BIGINT,
  late_count BIGINT,
  excused_count BIGINT,
  attendance_rate NUMERIC
)
```

Groups attendance records by `date_trunc(p_granularity, date)`, computes status counts, and calculates rate as `(present + late) / NULLIF(present + absent + late, 0) * 100`. Optional class filter.

### get_score_trend

```sql
CREATE OR REPLACE FUNCTION get_score_trend(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT,
  p_class_id UUID DEFAULT NULL
)
RETURNS TABLE (
  bucket_date DATE,
  avg_memorization NUMERIC,
  avg_tajweed NUMERIC,
  avg_recitation NUMERIC
)
```

Groups sessions by `date_trunc(p_granularity, session_date)`, computes AVG of each score type. Excludes NULLs. Optional class filter.

### get_teacher_activity

```sql
CREATE OR REPLACE FUNCTION get_teacher_activity(
  p_school_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  teacher_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  sessions_logged BIGINT,
  unique_students BIGINT,
  stickers_awarded BIGINT,
  last_active_date DATE
)
```

Joins profiles (role='teacher') with LEFT JOINs to sessions and student_stickers for the given period. Returns per-teacher aggregates.

### get_students_needing_attention

```sql
CREATE OR REPLACE FUNCTION get_students_needing_attention(
  p_class_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  student_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  current_avg NUMERIC,
  previous_avg NUMERIC,
  decline_amount NUMERIC,
  flag_reason TEXT
)
```

Filters sessions to the date range (p_start_date..p_end_date) when provided, otherwise uses all sessions. Uses window functions (ROW_NUMBER OVER PARTITION BY student_id ORDER BY session_date DESC) to get each student's last 6 sessions within the range. Computes avg of rows 1-3 (current) and 4-6 (previous). If fewer than 3 sessions exist in the range, only the "any score < 3 in last 2 sessions" criterion applies per A-003. Flags students where current_avg < previous_avg OR any score < 3 in last 2 sessions. Returns at most 10 rows ordered by decline_amount DESC.

### get_child_score_trend

```sql
CREATE OR REPLACE FUNCTION get_child_score_trend(
  p_student_id UUID,
  p_class_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_granularity TEXT
)
RETURNS TABLE (
  bucket_date DATE,
  avg_memorization NUMERIC,
  avg_tajweed NUMERIC,
  avg_recitation NUMERIC,
  class_avg_memorization NUMERIC,
  class_avg_tajweed NUMERIC,
  class_avg_recitation NUMERIC
)
```

Uses two CTEs: one for the individual student's scores, one for all class students' scores. Joins on bucket_date using FULL OUTER JOIN so both student and class data appear even when only one exists for a given bucket.

## Query Key Strategy (TanStack Query)

```text
['admin-reports', 'kpis', schoolId, startDate, endDate]
['admin-reports', 'attendance-trend', schoolId, startDate, endDate, classId]
['admin-reports', 'score-distribution', schoolId, startDate, endDate, classId]
['admin-reports', 'level-distribution', schoolId, classId]
['admin-reports', 'teacher-activity', schoolId, startDate, endDate]
['teacher-reports', 'class-analytics', classId, startDate, endDate]
['teacher-reports', 'score-trend', schoolId, classId, startDate, endDate]
['teacher-reports', 'attendance-trend', schoolId, classId, startDate, endDate]
['teacher-reports', 'needs-attention', classId, startDate, endDate]
['parent-reports', 'child-progress', studentId, startDate, endDate]
['parent-reports', 'child-score-trend', studentId, classId, startDate, endDate]
['parent-reports', 'child-attendance', studentId, startDate, endDate]
['parent-reports', 'child-gamification', studentId]
```
