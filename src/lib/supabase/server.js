import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client (anon key + RLS applies) for Server Components,
 * Server Actions, and Route Handlers. `setAll` is wrapped in try/catch because
 * Server Components can't write cookies — the proxy handles session refresh
 * for those requests instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — the proxy refreshes the
            // session cookie on navigation instead.
          }
        },
      },
    }
  );
}
