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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { schoolName, adminFullName, username, password, schoolNameLocalized, adminNameLocalized } = await req.json();

    // Validate inputs
    if (!schoolName || typeof schoolName !== "string" || schoolName.length < 2 || schoolName.length > 100) {
      return errorResponse("School name is required (2-100 characters)", "SCHOOL_NAME_REQUIRED");
    }
    if (!adminFullName || typeof adminFullName !== "string" || adminFullName.length < 2 || adminFullName.length > 100) {
      return errorResponse("Admin full name is required (2-100 characters)", "ADMIN_NAME_REQUIRED");
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

    // Create admin client with service_role key
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

    // Generate unique slug
    let slug = generateSlug(schoolName);
    if (!slug) {
      slug = "school";
    }

    // Check slug uniqueness, append number if collision
    const { data: existingSlugs } = await supabaseAdmin
      .from("schools")
      .select("slug")
      .like("slug", `${slug}%`);

    if (existingSlugs && existingSlugs.length > 0) {
      const slugSet = new Set(existingSlugs.map((s: { slug: string }) => s.slug));
      if (slugSet.has(slug)) {
        let counter = 2;
        while (slugSet.has(`${slug}-${counter}`)) {
          counter++;
        }
        slug = `${slug}-${counter}`;
      }
    }

    // Build synthetic email
    const email = `${username}@${slug}.app`;

    // Build name_localized objects
    const resolvedSchoolNameLocalized = schoolNameLocalized && typeof schoolNameLocalized === "object"
      ? schoolNameLocalized
      : { en: schoolName };

    const resolvedAdminNameLocalized = adminNameLocalized && typeof adminNameLocalized === "object"
      ? adminNameLocalized
      : { en: adminFullName };

    // Create school record first to get the school_id
    const { data: school, error: schoolError } = await supabaseAdmin
      .from("schools")
      .insert({
        name: schoolName,
        slug,
        name_localized: resolvedSchoolNameLocalized,
      })
      .select()
      .single();

    if (schoolError) {
      return errorResponse(`Failed to create school: ${schoolError.message}`, "SCHOOL_CREATE_FAILED", 500);
    }

    // Create auth user with metadata (triggers handle_new_profile)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        school_id: school.id,
        role: "admin",
        full_name: adminFullName,
        username,
        name_localized: JSON.stringify(resolvedAdminNameLocalized),
      },
    });

    if (authError) {
      // Rollback: delete the school
      await supabaseAdmin.from("schools").delete().eq("id", school.id);
      return errorResponse(`Failed to create admin user: ${authError.message}`, "AUTH_CREATE_FAILED", 500);
    }

    // Update school owner_id
    await supabaseAdmin
      .from("schools")
      .update({ owner_id: authData.user.id })
      .eq("id", school.id);

    // Use signInWithPassword to get a real session
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      // User and school created, but session failed — return what we have
      return jsonResponse({
        school: { id: school.id, name: school.name, slug: school.slug },
        session: null,
        profile: {
          id: authData.user.id,
          username,
          role: "admin",
          full_name: adminFullName,
        },
      });
    }

    return jsonResponse({
      school: { id: school.id, name: school.name, slug: school.slug },
      session: {
        access_token: sessionData.session?.access_token,
        refresh_token: sessionData.session?.refresh_token,
      },
      profile: {
        id: authData.user.id,
        username,
        role: "admin",
        full_name: adminFullName,
      },
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Internal server error",
      "INTERNAL_ERROR",
      500
    );
  }
});
