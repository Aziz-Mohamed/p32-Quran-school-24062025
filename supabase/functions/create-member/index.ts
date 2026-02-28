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
    // Verify caller is admin
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

    // Verify JWT by getting user from the auth service directly using admin client
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
      return errorResponse(
        `Profile lookup failed: ${profileError?.message ?? 'No profile found'} (user: ${caller.id})`,
        "UNAUTHORIZED",
        401
      );
    }

    if (callerProfile.role !== "admin") {
      return errorResponse("Only admins can create members", "UNAUTHORIZED", 403);
    }

    const schoolId = callerProfile.school_id;

    // Parse request body
    const { fullName, username, password, role, classId, parentId, dateOfBirth, nameLocalized } = await req.json();

    // Validate inputs
    if (!fullName || typeof fullName !== "string" || fullName.length < 2 || fullName.length > 100) {
      return errorResponse("Full name is required (2-100 characters)", "INVALID_NAME");
    }
    if (!username || typeof username !== "string" || username.length < 3 || username.length > 30) {
      return errorResponse("Username is required (3-30 characters)", "INVALID_USERNAME");
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return errorResponse("Username must be lowercase alphanumeric with underscores only", "INVALID_USERNAME");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return errorResponse("Password must be at least 6 characters", "WEAK_PASSWORD");
    }
    if (!role || !['student', 'teacher', 'parent'].includes(role)) {
      return errorResponse("Role must be student, teacher, or parent", "INVALID_ROLE");
    }

    // Check username uniqueness within school
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("school_id", schoolId)
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return errorResponse("Username is already taken in this school", "USERNAME_TAKEN");
    }

    // If student with classId, validate class exists and belongs to school
    if (role === "student" && classId) {
      const { data: classData, error: classError } = await supabaseAdmin
        .from("classes")
        .select("id, max_students")
        .eq("id", classId)
        .eq("school_id", schoolId)
        .single();

      if (classError || !classData) {
        return errorResponse("Class not found in this school", "CLASS_NOT_FOUND");
      }

      // Check class capacity
      const { count: studentCount } = await supabaseAdmin
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("class_id", classId)
        .eq("is_active", true);

      if (studentCount !== null && studentCount >= classData.max_students) {
        return errorResponse("Class is full", "CLASS_FULL");
      }
    }

    // Get school slug for synthetic email
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("slug")
      .eq("id", schoolId)
      .single();

    if (!school) {
      return errorResponse("School not found", "SCHOOL_NOT_FOUND", 500);
    }

    const email = `${username}@${school.slug}.app`;

    // Build name_localized: use provided value or fall back to { en: fullName }
    const resolvedNameLocalized = nameLocalized && typeof nameLocalized === "object"
      ? nameLocalized
      : { en: fullName };

    // Create auth user (triggers handle_new_profile)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        school_id: schoolId,
        role,
        full_name: fullName,
        username,
        name_localized: JSON.stringify(resolvedNameLocalized),
      },
    });

    if (authError) {
      return errorResponse(`Failed to create user: ${authError.message}`, "AUTH_CREATE_FAILED", 500);
    }

    // If student, create student record
    let studentRecord = null;
    if (role === "student") {
      const studentData: Record<string, unknown> = {
        id: authData.user.id,
        school_id: schoolId,
        class_id: classId || null,
        parent_id: parentId || null,
        current_level: 1,
      };

      if (dateOfBirth) {
        studentData.date_of_birth = dateOfBirth;
      }

      const { data: student, error: studentError } = await supabaseAdmin
        .from("students")
        .insert(studentData)
        .select()
        .single();

      if (studentError) {
        // Rollback: delete auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return errorResponse(`Failed to create student record: ${studentError.message}`, "STUDENT_CREATE_FAILED", 500);
      }

      studentRecord = {
        id: student.id,
        class_id: student.class_id,
        parent_id: student.parent_id,
        current_level: student.current_level,
      };
    }

    const response: Record<string, unknown> = {
      profile: {
        id: authData.user.id,
        username,
        role,
        full_name: fullName,
        school_id: schoolId,
        name_localized: resolvedNameLocalized,
      },
    };

    if (studentRecord) {
      response.student = studentRecord;
    }

    return jsonResponse(response);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Internal server error",
      "INTERNAL_ERROR",
      500
    );
  }
});
