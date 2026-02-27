export type TimePeriod = 'this_week' | 'this_month' | 'this_term' | 'all_time';
export type TimeGranularity = 'day' | 'week' | 'month';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  granularity: TimeGranularity;
}

export interface SchoolKPISummary {
  activeStudents: number;
  activeTeachers: number;
  totalClasses: number;
  attendanceRate: number; // 0-100
  averageScore: number; // 1-5 (two-level mean: mean of per-student averages)
  totalStickersAwarded: number;
}

export interface AttendanceTrendPoint {
  date: string; // ISO date of bucket start
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number; // (present + late) / (present + absent + late) * 100
}

export interface ScoreTrendPoint {
  date: string;
  memorization: number;
  tajweed: number;
  recitation: number;
}

export type ScoreRange = '1-2' | '2-3' | '3-4' | '4-5';

export interface ScoreDistributionBucket {
  range: ScoreRange;
  label: string; // "Needs Improvement", "Developing", "Proficient", "Excellent"
  count: number;
}

export interface LevelDistributionBucket {
  levelNumber: number;
  title: string;
  count: number;
}

export interface TeacherActivitySummary {
  teacherId: string;
  fullName: string;
  avatarUrl: string | null;
  sessionsLogged: number;
  uniqueStudentsEvaluated: number;
  stickersAwarded: number;
  lastActiveDate: string | null;
}

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

export interface StudentNeedingAttention {
  studentId: string;
  fullName: string;
  avatarUrl: string | null;
  currentAvg: number; // avg of last 3 sessions
  previousAvg: number; // avg of previous 3 sessions
  declineAmount: number;
  flagReason: 'declining' | 'low_scores';
}

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
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  activeCertifications: number;
}

export interface ChildProgressReport {
  scoreTrend: ChildScoreTrendPoint[];
  attendanceSummary: ChildAttendanceSummary;
  gamification: ChildGamificationSummary;
}

export interface TeacherAttendanceKPI {
  teacherId: string;
  fullName: string;
  avatarUrl: string | null;
  daysPresent: number;
  daysOnTime: number;
  daysLate: number;
  totalHoursWorked: number;
  avgHoursPerDay: number;
  punctualityRate: number; // 0-100
}

export interface SessionCompletionStat {
  teacherId: string;
  fullName: string;
  totalScheduled: number;
  completedCount: number;
  cancelledCount: number;
  missedCount: number;
  completionRate: number; // 0-100
}

// ─── Insight-First Report Types ─────────────────────────────────────────────

export type HealthStatus = 'green' | 'yellow' | 'red';
export type TrendDirection = 'up' | 'down' | 'steady';

export interface InsightData {
  id: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  icon: string; // Ionicons name
  title: string;
  description?: string;
  actionRoute?: string;
  actionParams?: Record<string, string>;
}

export interface HealthMetric {
  label: string;
  value: number;
  displayValue: string;
  status: HealthStatus;
  trend: TrendDirection;
  trendLabel: string; // e.g. "+3%", "-0.2", "--"
}

export interface ClassPulse {
  status: HealthStatus;
  message: string;
  attendance: HealthMetric;
  scores: HealthMetric;
  engagement: HealthMetric;
  insights: InsightData[];
  students: StudentQuickStatus[];
}

export interface StudentQuickStatus {
  studentId: string;
  fullName: string;
  status: HealthStatus;
  currentLevel: number;
  currentStreak: number;
  recentAvgScore: number;
}

export interface SchoolPulse {
  status: HealthStatus;
  message: string;
  studentHealth: {
    status: HealthStatus;
    activeStudents: number;
    attendanceRate: number;
    attendanceTrend: TrendDirection;
    attendanceTrendLabel: string;
    avgScore: number;
    scoreTrend: TrendDirection;
    scoreTrendLabel: string;
  };
  teacherEngagement: {
    status: HealthStatus;
    activeTeachers: number;
    inactiveTeachers: number;
    inactiveNames: string[];
    punctualityRate: number;
    sessionCompletionRate: number;
  };
  academicProgress: {
    status: HealthStatus;
    totalStudents: number;
    avgScore: number;
    scoreLabel: string;
    stickersAwarded: number;
  };
  alerts: InsightData[];
}
