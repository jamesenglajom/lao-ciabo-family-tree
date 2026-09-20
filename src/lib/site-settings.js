import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { resolveSiteSettings } from "@/lib/site-settings-resolve";

/**
 * The site's display settings, resolved with defaults. Wrapped in cache() so
 * the layout, page, and metadata that all need it share one query per request.
 *
 * A failed read (e.g. the migration hasn't been run yet) falls back to the
 * defaults rather than throwing — a settings problem must never take down the
 * whole site. `raw` is the stored row (or null) for the admin form, and
 * `tableMissing` lets the admin page say the migration is needed.
 */
export const getSiteSettings = cache(async () => {
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  if (error) console.warn(`[site-settings] using defaults: ${error.message}`);

  return {
    ...resolveSiteSettings(data ?? null),
    raw: data ?? null,
    tableMissing: error?.code === "PGRST205",
  };
});
