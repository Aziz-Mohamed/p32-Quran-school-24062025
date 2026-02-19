import { supabase } from '@/lib/supabase';
import type {
  CheckinInput,
  CheckoutInput,
  TeacherAttendanceFilters,
  VerificationMode,
  VerificationLogic,
  WorkScheduleInput,
} from '../types/work-attendance.types';

class WorkAttendanceService {
  /**
   * Teacher check-in with GPS and/or WiFi verification.
   */
  async checkIn(input: CheckinInput) {
    return supabase
      .from('teacher_checkins')
      .insert({
        teacher_id: input.teacherId,
        school_id: input.schoolId,
        checkin_latitude: input.coords?.latitude ?? null,
        checkin_longitude: input.coords?.longitude ?? null,
        checkin_distance_meters: input.distanceMeters ?? null,
        checkin_wifi_ssid: input.wifiSSID ?? null,
        verification_method: input.verificationMethod,
        is_verified: input.isVerified,
      })
      .select()
      .single();
  }

  /**
   * Teacher check-out with GPS and/or WiFi data.
   */
  async checkOut(input: CheckoutInput) {
    return supabase
      .from('teacher_checkins')
      .update({
        checked_out_at: new Date().toISOString(),
        checkout_latitude: input.coords?.latitude ?? null,
        checkout_longitude: input.coords?.longitude ?? null,
        checkout_distance_meters: input.distanceMeters ?? null,
        checkout_wifi_ssid: input.wifiSSID ?? null,
      })
      .eq('id', input.checkinId)
      .select()
      .single();
  }

  /**
   * Request manual override (teacher failed verification).
   */
  async requestOverride(checkinId: string, reason: string) {
    return supabase
      .from('teacher_checkins')
      .update({
        override_reason: reason,
      })
      .eq('id', checkinId)
      .select()
      .single();
  }

  /**
   * Admin approves a manual override.
   */
  async approveOverride(checkinId: string, adminId: string) {
    return supabase
      .from('teacher_checkins')
      .update({
        is_verified: true,
        verification_method: 'manual',
        verified_by: adminId,
      })
      .eq('id', checkinId)
      .select()
      .single();
  }

  /**
   * Admin rejects a manual override.
   */
  async rejectOverride(checkinId: string) {
    return supabase
      .from('teacher_checkins')
      .delete()
      .eq('id', checkinId);
  }

  /**
   * Get today's check-in for a teacher.
   */
  async getTodayCheckin(teacherId: string) {
    const today = new Date().toISOString().split('T')[0];
    return supabase
      .from('teacher_checkins')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('date', today)
      .maybeSingle();
  }

  /**
   * Get all teacher check-ins for a specific day (admin view).
   */
  async getSchoolAttendance(filters: TeacherAttendanceFilters) {
    const date = filters.date ?? new Date().toISOString().split('T')[0];
    let query = supabase
      .from('teacher_checkins')
      .select('*, teacher:profiles!teacher_checkins_teacher_id_fkey(full_name, avatar_url)')
      .eq('school_id', filters.schoolId)
      .eq('date', date);

    if (filters.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    if (filters.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    return query.order('checked_in_at', { ascending: true });
  }

  /**
   * Get pending override requests (unverified check-ins with an override reason).
   */
  async getPendingOverrides(schoolId: string) {
    return supabase
      .from('teacher_checkins')
      .select('*, teacher:profiles!teacher_checkins_teacher_id_fkey(full_name, avatar_url)')
      .eq('school_id', schoolId)
      .eq('is_verified', false)
      .not('override_reason', 'is', null)
      .order('checked_in_at', { ascending: false });
  }

  /**
   * Get teacher attendance history for a date range.
   */
  async getTeacherHistory(teacherId: string, startDate: string, endDate: string) {
    return supabase
      .from('teacher_checkins')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
  }

  /**
   * Get school verification settings (location + WiFi + mode).
   */
  async getSchoolLocation(schoolId: string) {
    return supabase
      .from('schools')
      .select('latitude, longitude, geofence_radius_meters, wifi_ssid, verification_mode, verification_logic')
      .eq('id', schoolId)
      .single();
  }

  /**
   * Update school verification settings (admin only).
   */
  async updateVerificationSettings(
    schoolId: string,
    data: {
      latitude: number | null;
      longitude: number | null;
      geofence_radius_meters: number;
      wifi_ssid: string | null;
      verification_mode: VerificationMode;
      verification_logic: VerificationLogic;
    },
  ) {
    return supabase
      .from('schools')
      .update(data)
      .eq('id', schoolId)
      .select()
      .single();
  }

  // ─── Teacher Work Schedules ──────────────────────────────────────────────

  /**
   * Get work schedules for a teacher.
   */
  async getWorkSchedules(teacherId: string) {
    return supabase
      .from('teacher_work_schedules')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });
  }

  /**
   * Upsert a work schedule entry.
   */
  async upsertWorkSchedule(input: WorkScheduleInput) {
    return supabase
      .from('teacher_work_schedules')
      .upsert(
        {
          school_id: input.schoolId,
          teacher_id: input.teacherId,
          day_of_week: input.dayOfWeek,
          start_time: input.startTime,
          end_time: input.endTime,
        },
        { onConflict: 'teacher_id,day_of_week' },
      )
      .select()
      .single();
  }

  /**
   * Delete a work schedule entry.
   */
  async deleteWorkSchedule(id: string) {
    return supabase
      .from('teacher_work_schedules')
      .delete()
      .eq('id', id);
  }

  /**
   * Get all teachers in a school (for attendance monitoring).
   */
  async getSchoolTeachers(schoolId: string) {
    return supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('school_id', schoolId)
      .eq('role', 'teacher')
      .order('full_name');
  }
}

export const workAttendanceService = new WorkAttendanceService();
