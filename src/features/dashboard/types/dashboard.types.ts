import type { Tables } from '@/types/database.types';

/** Base profile row from the database */
type Profile = Tables<'profiles'>;

/** Base student row from the database */
type Student = Tables<'students'>;

/** Base session row from the database */
type Session = Tables<'sessions'>;

/** Base class row from the database */
type Class = Tables<'classes'>;

/** Base attendance row from the database */
type Attendance = Tables<'attendance'>;

/** Summary statistics for a student's dashboard */
export interface StudentDashboardData {
  profile: Profile;
  student: Student;
  currentLevel: number;
  activeCertCount: number;
  currentStreak: number;
  longestStreak: number;
  recentSessions: Session[];
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
  };
  recentStickers: Array<Tables<'student_stickers'> & { sticker: Tables<'stickers'> }>;
}

/** Summary statistics for a teacher's dashboard */
export interface TeacherDashboardData {
  profile: Profile;
  classes: Class[];
  todayCheckin: Tables<'teacher_checkins'> | null;
  todaySessions: Session[];
  totalStudents: number;
  recentAttendance: Attendance[];
}

/** Aggregated stats across all children */
export interface ParentAggregateStats {
  totalChildren: number;
  presentToday: number;
  absentToday: number;
  notMarkedToday: number;
  averageAttendanceRate: number; // 0-100, -1 if N/A
  totalStickers: number;
  totalStreakDays: number;
}

/** Per-child quick status for the compact dashboard row */
export interface ChildQuickStatus {
  id: string;
  name: string;
  avatarUrl: string | null;
  className: string | null;
  currentLevel: number;
  todayStatus: 'present' | 'absent' | 'late' | 'excused' | null;
  attendanceRate: number; // 0-100, -1 if N/A
  currentStreak: number;
}

/** A recent session entry for the activity feed */
export interface RecentSessionEntry {
  id: string;
  studentId: string;
  childName: string;
  sessionDate: string;
  memorizationScore: number | null;
  tajweedScore: number | null;
  recitationQuality: number | null;
  notes: string | null;
}

/** Summary data for a parent viewing their children */
export interface ParentDashboardData {
  children: ChildQuickStatus[];
  aggregateStats: ParentAggregateStats;
  recentSessions: RecentSessionEntry[];
}

/** Summary statistics for an admin's dashboard */
export interface AdminDashboardData {
  profile: Profile;
  school: Tables<'schools'>;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeStudents: number;
  todayAttendanceRate: number;
  recentSessions: Session[];
  classSummaries: Array<{
    class: Class;
    studentCount: number;
    teacherName: string | null;
  }>;
}
