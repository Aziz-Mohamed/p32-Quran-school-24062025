// Services
export { classScheduleService } from './services/class-schedule.service';
export { scheduledSessionService } from './services/scheduled-session.service';

// Hooks
export {
  useClassSchedules,
  useSchoolSchedules,
  useUpsertClassSchedule,
  useDeleteClassSchedule,
} from './hooks/useClassSchedules';

export {
  useScheduledSessions,
  useTeacherUpcomingSessions,
  useStudentUpcomingSessions,
  useCreateScheduledSession,
  useUpdateSessionStatus,
  useLinkEvaluation,
} from './hooks/useScheduledSessions';

// Types
export type {
  ClassSchedule,
  ScheduledSession,
  SessionType,
  SessionStatus,
  ClassScheduleInput,
  ScheduleSessionInput,
  ScheduledSessionWithDetails,
  ScheduleFilters,
} from './types/scheduling.types';
