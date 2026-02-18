// Services
export { locationService } from './services/location.service';
export { workAttendanceService } from './services/work-attendance.service';

// Hooks
export {
  useTodayCheckin,
  useSchoolLocation,
  useGpsCheckIn,
  useGpsCheckOut,
  useRequestOverride,
} from './hooks/useGpsCheckin';

export {
  useSchoolAttendanceToday,
  useSchoolTeachers,
  usePendingOverrides,
  useApproveOverride,
  useRejectOverride,
  useTeacherHistory,
} from './hooks/useTeacherAttendance';

export {
  useWorkSchedules,
  useUpsertWorkSchedule,
  useDeleteWorkSchedule,
} from './hooks/useWorkSchedule';

// Types
export type {
  GpsCoords,
  GpsCheckinInput,
  GpsCheckoutInput,
  SchoolLocation,
  TeacherCheckin,
  TeacherCheckinWithProfile,
  TeacherWorkSchedule,
  VerificationMethod,
  TeacherAttendanceFilters,
  WorkScheduleInput,
} from './types/work-attendance.types';
