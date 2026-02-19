import type { Tables } from '@/types/database.types';

export interface GpsCoords {
  latitude: number;
  longitude: number;
}

export type VerificationMode = 'gps' | 'wifi' | 'both';
export type VerificationLogic = 'and' | 'or';
export type VerificationMethod = 'gps' | 'wifi' | 'both' | 'manual' | 'none';

export interface SchoolVerificationSettings {
  latitude: number | null;
  longitude: number | null;
  geofence_radius_meters: number;
  wifi_ssid: string | null;
  verification_mode: VerificationMode;
  verification_logic: VerificationLogic;
}

// Keep SchoolLocation as alias for backward compatibility in existing code
export type SchoolLocation = SchoolVerificationSettings;

export interface CheckinInput {
  teacherId: string;
  schoolId: string;
  coords: GpsCoords | null;
  distanceMeters: number | null;
  wifiSSID: string | null;
  verificationMethod: VerificationMethod;
  isVerified: boolean;
}

export interface CheckoutInput {
  checkinId: string;
  coords: GpsCoords | null;
  distanceMeters: number | null;
  wifiSSID: string | null;
}

export interface OverrideRequestInput {
  checkinId: string;
  reason: string;
}

export type TeacherCheckin = Tables<'teacher_checkins'>;

export interface TeacherCheckinWithProfile extends TeacherCheckin {
  teacher: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'>;
}

export type TeacherWorkSchedule = Tables<'teacher_work_schedules'>;

export interface TeacherAttendanceFilters {
  schoolId: string;
  date?: string;
  isVerified?: boolean;
  teacherId?: string;
}

export interface WorkScheduleInput {
  schoolId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
