import { supabase } from '@/lib/supabase';

class RevisionScheduleService {
  async getSchedule(studentId: string, date?: string) {
    return supabase.rpc('get_student_revision_schedule', {
      p_student_id: studentId,
      p_date: date ?? new Date().toISOString().split('T')[0],
    });
  }
}

export const revisionScheduleService = new RevisionScheduleService();
