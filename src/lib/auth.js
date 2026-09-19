import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in user's profile (id, email, full_name, role,
 * scope_member_id), or null if there is no session. Server-only — call from
 * Server Components/Actions.
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, scope_member_id")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

/**
 * Guards an admin Server Component/Action. Redirects to /admin/login when
 * signed out, and to /admin (with an error) when signed in but lacking one
 * of the allowed roles. This is a UX convenience — RLS is the real security
 * boundary, enforced independently in Postgres.
 */
export async function requireRole(...allowedRoles) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect("/admin?error=forbidden");
  }

  return profile;
}
