import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client (anon key) for reading public data with no
 * user session — site settings, robots.txt, sitemap. No cookies means these
 * reads don't force per-user rendering and work in metadata route handlers.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
