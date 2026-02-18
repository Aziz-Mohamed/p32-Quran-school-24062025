import type { Tables } from '@/types/database.types';

export type ClassSchedule = Tables<'class_schedules'>;
export type ScheduledSession = Tables<'scheduled_sessions'>;

export type SessionType = 'class' | 'individual';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';

export interface ClassScheduleInput {
  classId: string;
  schoolId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleSessionInput {
  classId?: string;
  classScheduleId?: string;
  teacherId: string;
  studentId?: string;
  schoolId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
}

export interface ScheduledSessionWithDetails extends ScheduledSession {
  class?: Pick<Tables<'classes'>, 'name'> | null;
  teacher?: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null;
  student?: {
    profiles: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null;
  } | null;
}

export interface ScheduleFilters {
  schoolId: string;
  teacherId?: string;
  studentId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  status?: SessionStatus;
}
