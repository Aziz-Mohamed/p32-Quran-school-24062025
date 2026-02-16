import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface ClassScheduleRow {
  id: string;
  class_id: string;
  school_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // ─── Step 1: Mark past scheduled sessions as missed ───────────────
    // Any session that was 'scheduled' and the date has passed
    const { data: missedSessions, error: missedError } = await supabase
      .from("scheduled_sessions")
      .update({ status: "missed" })
      .eq("status", "scheduled")
      .lt("session_date", today)
      .select("id");

    if (missedError) {
      console.error("Error marking missed sessions:", missedError);
    }

    const missedCount = missedSessions?.length ?? 0;

    // ─── Step 2: Get all active class schedules ───────────────────────
    const { data: schedules, error: schedulesError } = await supabase
      .from("class_schedules")
      .select("id, class_id, school_id, day_of_week, start_time, end_time")
      .eq("is_active", true);

    if (schedulesError) {
      throw schedulesError;
    }

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active class schedules found.",
          missed_marked: missedCount,
          sessions_generated: 0,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // ─── Step 3: Get teacher assignment for each class ────────────────
    const classIds = [...new Set(schedules.map((s: ClassScheduleRow) => s.class_id))];
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id, teacher_id")
      .in("id", classIds);

    if (classesError) {
      throw classesError;
    }

    const teacherByClass = new Map(
      (classes ?? []).map((c: { id: string; teacher_id: string | null }) => [c.id, c.teacher_id]),
    );

    // ─── Step 4: Generate sessions for next 28 days ───────────────────
    const sessionsToInsert: Array<{
      class_id: string;
      class_schedule_id: string;
      teacher_id: string;
      school_id: string;
      session_date: string;
      start_time: string;
      end_time: string;
      session_type: string;
      status: string;
    }> = [];

    for (const schedule of schedules as ClassScheduleRow[]) {
      const teacherId = teacherByClass.get(schedule.class_id);
      if (!teacherId) continue; // Skip classes without a teacher

      // Generate dates for the next 28 days that match this day_of_week
      for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);

        if (date.getDay() === schedule.day_of_week) {
          const sessionDate = date.toISOString().split("T")[0];

          sessionsToInsert.push({
            class_id: schedule.class_id,
            class_schedule_id: schedule.id,
            teacher_id: teacherId,
            school_id: schedule.school_id,
            session_date: sessionDate,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            session_type: "class",
            status: "scheduled",
          });
        }
      }
    }

    if (sessionsToInsert.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No new sessions to generate.",
          missed_marked: missedCount,
          sessions_generated: 0,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // ─── Step 5: Bulk insert with ON CONFLICT DO NOTHING ──────────────
    // The unique index on (class_schedule_id, session_date) prevents duplicates
    const { data: inserted, error: insertError } = await supabase
      .from("scheduled_sessions")
      .upsert(sessionsToInsert, {
        onConflict: "class_schedule_id,session_date",
        ignoreDuplicates: true,
      })
      .select("id");

    if (insertError) {
      throw insertError;
    }

    const insertedCount = inserted?.length ?? 0;

    return new Response(
      JSON.stringify({
        success: true,
        missed_marked: missedCount,
        sessions_generated: insertedCount,
        total_attempted: sessionsToInsert.length,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-sessions error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
