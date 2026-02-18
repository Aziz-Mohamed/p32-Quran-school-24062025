import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
  priority?: "default" | "normal" | "high";
  channelId?: string;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

// ─── Supabase Client ────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ─── Timezone Helpers ───────────────────────────────────────────────────────

function getLocalTime(timezone: string): { hours: number; minutes: number } {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

function isInMorningWindow(timezone: string): boolean {
  const { hours, minutes } = getLocalTime(timezone);
  const totalMinutes = hours * 60 + minutes;
  // 7 AM window: 06:53 to 07:07 (±7 min around 07:00)
  return totalMinutes >= 6 * 60 + 53 && totalMinutes <= 7 * 60 + 7;
}

// ─── Preference Check ───────────────────────────────────────────────────────

async function shouldSendSummary(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  category: "daily_summary" | "student_alert",
  schoolTimezone: string,
): Promise<boolean> {
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!prefs) return true;

  if (prefs[category] === false) return false;

  if (prefs.quiet_hours_enabled && prefs.quiet_hours_start && prefs.quiet_hours_end) {
    const now = new Date();
    const schoolTime = now.toLocaleTimeString("en-GB", {
      timeZone: schoolTimezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const start = prefs.quiet_hours_start.substring(0, 5);
    const end = prefs.quiet_hours_end.substring(0, 5);
    if (start > end) {
      if (schoolTime >= start || schoolTime < end) return false;
    } else {
      if (schoolTime >= start && schoolTime < end) return false;
    }
  }

  return true;
}

// ─── Expo Push ──────────────────────────────────────────────────────────────

async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];
  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (expoAccessToken) {
    headers["Authorization"] = `Bearer ${expoAccessToken}`;
  }
  const allTickets: ExpoPushTicket[] = [];
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers,
      body: JSON.stringify(batch),
    });
    if (response.ok) {
      const result = await response.json();
      allTickets.push(...(result.data as ExpoPushTicket[]));
    } else {
      console.error("[teacher-daily-summary] Expo Push error:", response.status);
    }
  }
  return allTickets;
}

async function handleInvalidTokens(
  supabase: ReturnType<typeof createClient>,
  tokens: string[],
  tickets: ExpoPushTicket[],
) {
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
      const token = tokens[i];
      if (token) {
        await supabase.from("push_tokens").update({ is_active: false }).eq("token", token);
      }
    }
  }
}

// ─── Main Handler ───────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data: schools, error: schoolsError } = await supabase
      .from("schools")
      .select("id, timezone")
      .eq("is_active", true);

    if (schoolsError || !schools) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch schools" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let schoolsProcessed = 0;
    let summariesSent = 0;
    let alertsSent = 0;
    const messages: ExpoPushMessage[] = [];
    const tokensList: string[] = [];

    for (const school of schools) {
      const timezone = school.timezone ?? "UTC";
      if (!isInMorningWindow(timezone)) continue;
      schoolsProcessed++;

      // Get teachers in this school via profiles (role = teacher)
      const { data: teachers } = await supabase
        .from("profiles")
        .select("id, full_name, preferred_language")
        .eq("school_id", school.id)
        .eq("role", "teacher");

      if (!teachers || teachers.length === 0) continue;

      for (const teacher of teachers) {
        const lang = teacher.preferred_language === "ar" ? "ar" : "en";

        // Get classes assigned to this teacher
        const { data: classes } = await supabase
          .from("classes")
          .select("id")
          .eq("teacher_id", teacher.id)
          .eq("is_active", true);

        if (!classes || classes.length === 0) continue;

        const classIds = classes.map((c) => c.id);

        // Count students in teacher's classes
        const { count: studentCount } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .in("class_id", classIds)
          .eq("is_active", true);

        const totalStudents = studentCount ?? 0;
        if (totalStudents === 0) continue;

        // Find students needing attention:
        // 1. Missing homework (>=3 incomplete)
        const { data: homeworkCounts } = await supabase
          .from("homework")
          .select("student_id")
          .in("school_id", [school.id])
          .eq("is_completed", false);

        const missedByStudent = new Map<string, number>();
        if (homeworkCounts) {
          for (const hw of homeworkCounts) {
            missedByStudent.set(hw.student_id, (missedByStudent.get(hw.student_id) ?? 0) + 1);
          }
        }

        // Get students in teacher's classes
        const { data: classStudents } = await supabase
          .from("students")
          .select("id")
          .in("class_id", classIds)
          .eq("is_active", true);

        let alertCount = 0;
        if (classStudents) {
          for (const student of classStudents) {
            const missedCount = missedByStudent.get(student.id) ?? 0;
            if (missedCount >= 3) alertCount++;
          }
        }

        // Send daily summary if enabled
        if (await shouldSendSummary(supabase, teacher.id, "daily_summary", timezone)) {
          const { data: tokens } = await supabase
            .from("push_tokens")
            .select("token")
            .eq("user_id", teacher.id)
            .eq("is_active", true);

          if (tokens && tokens.length > 0) {
            const title = lang === "ar" ? "ملخّص الصباح" : "Morning Summary";
            const alertPart = alertCount > 0
              ? lang === "ar"
                ? ` ${alertCount} يحتاجون اهتمامًا.`
                : ` ${alertCount} need${alertCount > 1 ? "" : "s"} attention.`
              : "";
            const body = lang === "ar"
              ? `${totalStudents} طالب اليوم.${alertPart}`
              : `${totalStudents} student${totalStudents > 1 ? "s" : ""} today.${alertPart}`;

            for (const { token } of tokens) {
              messages.push({
                to: token,
                title,
                body,
                data: { screen: "/(teacher)/(tabs)/index" },
                sound: "default",
                priority: "high",
                channelId: "default",
              });
              tokensList.push(token);
            }
            summariesSent++;
          }
        }

        // Send alert if there are students needing attention
        if (alertCount > 0 && await shouldSendSummary(supabase, teacher.id, "student_alert", timezone)) {
          // Alert is included in the summary body above, not sent separately
          alertsSent += alertCount;
        }
      }
    }

    const tickets = await sendExpoPush(messages);
    await handleInvalidTokens(supabase, tokensList, tickets);

    return new Response(
      JSON.stringify({
        success: true,
        schools_processed: schoolsProcessed,
        summaries_sent: summariesSent,
        alerts_sent: alertsSent,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[teacher-daily-summary] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
