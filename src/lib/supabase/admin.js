import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Only ever import this
 * from files under src/app/admin/** /actions.js (Server Actions). It is used
 * solely for the "Users" RBAC page (auth.admin.* APIs aren't reachable with
 * the anon key). Never send this client or its key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
