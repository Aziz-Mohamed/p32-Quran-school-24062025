// Services
export { locationService } from './services/location.service';
export { wifiService } from './services/wifi.service';
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

// Utils
export { determineVerification } from './utils/verification';

// Types
export type {
  GpsCoords,
  CheckinInput,
  CheckoutInput,
  SchoolLocation,
  SchoolVerificationSettings,
  TeacherCheckin,
  TeacherCheckinWithProfile,
  TeacherWorkSchedule,
  VerificationMethod,
  VerificationMode,
  VerificationLogic,
  TeacherAttendanceFilters,
  WorkScheduleInput,
} from './types/work-attendance.types';
