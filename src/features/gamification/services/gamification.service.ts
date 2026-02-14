import { supabase } from '@/lib/supabase';

class GamificationService {
  /**
   * GS-001: Get the global heritage sticker catalog.
   * Returns all active stickers ordered by tier then name.
   */
  async getStickers() {
    return supabase
      .from('stickers')
      .select('*')
      .eq('is_active', true)
      .order('tier')
      .order('name_en');
  }

  /**
   * GS-002: Get all stickers awarded to a specific student.
   * Includes sticker details and the name of the person who awarded it.
   */
  async getStudentStickers(studentId: string) {
    return supabase
      .from('student_stickers')
      .select(
        '*, stickers(id, name_ar, name_en, tier, image_path, points_value), profiles!student_stickers_awarded_by_fkey(full_name)',
      )
      .eq('student_id', studentId)
      .order('awarded_at', { ascending: false });
  }

  /**
   * GS-003: Award a sticker to a student.
   * The DB trigger handle_sticker_points will auto-add points.
   */
  async awardSticker(input: {
    studentId: string;
    stickerId: string;
    awardedBy: string;
    reason?: string;
  }) {
    return supabase
      .from('student_stickers')
      .insert({
        student_id: input.studentId,
        sticker_id: input.stickerId,
        awarded_by: input.awardedBy,
        reason: input.reason ?? null,
      })
      .select()
      .single();
  }

  /**
   * GS-003b: Mark stickers as seen (clear is_new flag).
   */
  async markStickersAsSeen(studentStickerId: string) {
    return supabase
      .from('student_stickers')
      .update({ is_new: false })
      .eq('id', studentStickerId);
  }

  /**
   * GS-003c: Mark all new stickers as seen for a student.
   */
  async markAllStickersAsSeen(studentId: string) {
    return supabase
      .from('student_stickers')
      .update({ is_new: false })
      .eq('student_id', studentId)
      .eq('is_new', true);
  }

  /**
   * GS-004: Get class leaderboard ranked by total_points.
   * Supports 'all-time' period. Weekly period requires a dedicated RPC
   * function to filter by date range -- falls back to all-time for now.
   */
  async getLeaderboard(classId: string, period: 'weekly' | 'all-time') {
    // TODO: 'weekly' period requires an RPC that sums points earned within
    // the last 7 days. Until that RPC exists, both periods return all-time.
    if (period === 'weekly') {
      // Placeholder: weekly leaderboard needs a server-side RPC like
      // get_weekly_leaderboard(class_id UUID, since TIMESTAMPTZ)
      // that aggregates student_stickers.points + achievement points
      // earned after `since`. For now, fall through to all-time.
    }

    return supabase
      .from('students')
      .select(
        '*, profiles!students_id_fkey!inner(full_name, avatar_url), levels!students_current_level_fkey(level_number, title)',
      )
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(10);
  }

  /**
   * GS-005: Get all trophies alongside which ones this student has earned.
   * Returns both lists so the UI can render earned vs locked states.
   */
  async getStudentTrophies(studentId: string) {
    const [allTrophiesResult, earnedResult] = await Promise.all([
      supabase.from('trophies').select('*').order('name'),
      supabase
        .from('student_trophies')
        .select('trophy_id, earned_at')
        .eq('student_id', studentId),
    ]);

    return {
      allTrophies: allTrophiesResult.data,
      trophiesError: allTrophiesResult.error,
      earnedTrophies: earnedResult.data,
      earnedError: earnedResult.error,
    };
  }

  /**
   * GS-006: Get all achievements earned by a student.
   * Includes the full achievement details via join.
   */
  async getStudentAchievements(studentId: string) {
    return supabase
      .from('student_achievements')
      .select('*, achievements(*)')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });
  }

  /**
   * GS-007: Get all level definitions, ordered by level_number.
   * Used to display progression tiers in the UI.
   */
  async getLevels() {
    return supabase.from('levels').select('*').order('level_number');
  }

  /**
   * Get a single sticker by ID.
   */
  async getStickerById(id: string) {
    return supabase.from('stickers').select('*').eq('id', id).single();
  }
}

export const gamificationService = new GamificationService();
