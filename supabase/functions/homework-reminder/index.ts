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

function getTomorrowDate(timezone: string): string {
  const now = new Date();
  // Get today in the school timezone, then add 1 day
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  const tomorrow = new Date(dateStr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function isInReminderWindow(timezone: string): boolean {
  const { hours, minutes } = getLocalTime(timezone);
  // 6 PM window: 17:53 to 18:07 (±7 min around 18:00)
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes >= 17 * 60 + 53 && totalMinutes <= 18 * 60 + 7;
}

// ─── Preference Check ───────────────────────────────────────────────────────

async function shouldSendReminder(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  schoolTimezone: string,
): Promise<boolean> {
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!prefs) return true; // defaults = all enabled

  if (prefs.homework_reminder === false) return false;

  // Check quiet hours
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
      console.error("[homework-reminder] Expo Push error:", response.status);
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

    // Get all schools
    const { data: schools, error: schoolsError } = await supabase
      .from("schools")
      .select("id, timezone")
      .eq("is_active", true);

    if (schoolsError || !schools) {
      console.error("[homework-reminder] Failed to fetch schools:", schoolsError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch schools" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    let schoolsProcessed = 0;
    let remindersSent = 0;
    const messages: ExpoPushMessage[] = [];
    const tokensList: string[] = [];

    for (const school of schools) {
      const timezone = school.timezone ?? "UTC";

      // Only process schools in the 6 PM window
      if (!isInReminderWindow(timezone)) continue;

      schoolsProcessed++;
      const tomorrowDate = getTomorrowDate(timezone);

      // Get pending homework due tomorrow
      const { data: homeworkItems } = await supabase
        .from("homework")
        .select("id, student_id, description, due_date")
        .eq("school_id", school.id)
        .eq("due_date", tomorrowDate)
        .eq("is_completed", false);

      if (!homeworkItems || homeworkItems.length === 0) continue;

      // Group by student
      const byStudent = new Map<string, typeof homeworkItems>();
      for (const item of homeworkItems) {
        const existing = byStudent.get(item.student_id) ?? [];
        existing.push(item);
        byStudent.set(item.student_id, existing);
      }

      for (const [studentId, items] of byStudent) {
        // Get student profile and parent
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_language, full_name")
          .eq("id", studentId)
          .single();

        const { data: student } = await supabase
          .from("students")
          .select("parent_id")
          .eq("id", studentId)
          .single();

        const lang = profile?.preferred_language === "ar" ? "ar" : "en";
        const count = items.length;
        const descriptions = items
          .slice(0, 3)
          .map((h) => h.description)
          .join(", ");
        const suffix = count > 3 ? (lang === "ar" ? ` و${count - 3} أخرى` : ` and ${count - 3} more`) : "";

        // Student notification
        if (await shouldSendReminder(supabase, studentId, timezone)) {
          const { data: tokens } = await supabase
            .from("push_tokens")
            .select("token")
            .eq("user_id", studentId)
            .eq("is_active", true);

          if (tokens && tokens.length > 0) {
            const title = lang === "ar" ? "تذكير بالواجبات" : "Homework Reminder";
            const body = lang === "ar"
              ? `لديك ${count} واجب${count > 1 ? "ات" : ""} مستحقة غدًا: ${descriptions}${suffix}`
              : `You have ${count} homework item${count > 1 ? "s" : ""} due tomorrow: ${descriptions}${suffix}`;

            for (const { token } of tokens) {
              messages.push({
                to: token,
                title,
                body,
                data: { screen: "/(student)/(tabs)/index" },
                sound: "default",
                priority: "high",
                channelId: "default",
              });
              tokensList.push(token);
            }
          }
        }

        // Parent notification
        if (student?.parent_id) {
          if (await shouldSendReminder(supabase, student.parent_id, timezone)) {
            const { data: parentProfile } = await supabase
              .from("profiles")
              .select("preferred_language")
              .eq("id", student.parent_id)
              .single();

            const parentLang = parentProfile?.preferred_language === "ar" ? "ar" : "en";
            const childName = profile?.full_name ?? "";

            const { data: parentTokens } = await supabase
              .from("push_tokens")
              .select("token")
              .eq("user_id", student.parent_id)
              .eq("is_active", true);

            if (parentTokens && parentTokens.length > 0) {
              const title = parentLang === "ar" ? "تذكير بالواجبات" : "Homework Reminder";
              const body = parentLang === "ar"
                ? `${childName} لديه ${count} واجب${count > 1 ? "ات" : ""} مستحقة غدًا`
                : `${childName} has ${count} homework item${count > 1 ? "s" : ""} due tomorrow`;

              for (const { token } of parentTokens) {
                messages.push({
                  to: token,
                  title,
                  body,
                  data: { screen: "/(parent)/(tabs)/children" },
                  sound: "default",
                  priority: "high",
                  channelId: "default",
                });
                tokensList.push(token);
              }
            }
          }
        }
      }
    }

    // Send all messages
    const tickets = await sendExpoPush(messages);
    await handleInvalidTokens(supabase, tokensList, tickets);
    remindersSent = messages.length - tickets.filter((t) => t.status === "error").length;

    return new Response(
      JSON.stringify({
        success: true,
        schools_processed: schoolsProcessed,
        reminders_sent: remindersSent,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[homework-reminder] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
