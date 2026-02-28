import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(error: string, code: string, status = 400) {
  return jsonResponse({ error, code }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", "UNAUTHORIZED", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    // Create service-role admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Verify JWT using admin client (supports ES256 tokens)
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      return errorResponse(
        `Token verification failed: ${callerError?.message ?? 'No user returned'}`,
        "UNAUTHORIZED",
        401
      );
    }

    // Get caller's profile to check role and school_id
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, school_id")
      .eq("id", caller.id)
      .single();

    if (profileError || !callerProfile) {
      return errorResponse("Caller profile not found", "UNAUTHORIZED", 401);
    }

    if (callerProfile.role !== "admin") {
      return errorResponse("Only admins can reset passwords", "UNAUTHORIZED", 403);
    }

    // Parse request body
    const { userId, newPassword } = await req.json();

    if (!userId || typeof userId !== "string") {
      return errorResponse("User ID is required", "USER_NOT_FOUND");
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return errorResponse("New password must be at least 6 characters", "WEAK_PASSWORD");
    }

    // Verify target user belongs to same school
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("school_id")
      .eq("id", userId)
      .single();

    if (targetError || !targetProfile) {
      return errorResponse("User not found", "USER_NOT_FOUND", 404);
    }

    if (targetProfile.school_id !== callerProfile.school_id) {
      return errorResponse("Cannot reset password for user in another school", "CROSS_SCHOOL_ACCESS", 403);
    }

    // Reset the password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      return errorResponse(`Failed to reset password: ${updateError.message}`, "PASSWORD_RESET_FAILED", 500);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Internal server error",
      "INTERNAL_ERROR",
      500
    );
  }
});
