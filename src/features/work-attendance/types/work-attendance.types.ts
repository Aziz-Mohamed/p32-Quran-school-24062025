import type { Tables } from '@/types/database.types';

export interface GpsCoords {
  latitude: number;
  longitude: number;
}

export interface GpsCheckinInput {
  teacherId: string;
  schoolId: string;
  coords: GpsCoords;
  distanceMeters: number;
  isWithinGeofence: boolean;
}

export interface GpsCheckoutInput {
  checkinId: string;
  coords: GpsCoords;
  distanceMeters: number;
}

export interface OverrideRequestInput {
  checkinId: string;
  reason: string;
}

export interface SchoolLocation {
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
}

export type TeacherCheckin = Tables<'teacher_checkins'>;

export interface TeacherCheckinWithProfile extends TeacherCheckin {
  teacher: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'>;
}

export type TeacherWorkSchedule = Tables<'teacher_work_schedules'>;

export type VerificationMethod = 'gps' | 'manual' | 'none';

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
