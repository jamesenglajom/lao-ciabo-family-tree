"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { formatPingTime, pingAvailability } from "@/lib/keepalive";
import { getSiteSettings } from "@/lib/site-settings";
import { isValidTimeZone } from "@/lib/site-settings-resolve";
import { createClient } from "@/lib/supabase/server";

export async function pingSupabaseAction() {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  // Enforced here, not just by the disabled button, so a stale tab or a
  // hand-made request can't ping again inside the cooldown.
  const { data: latest, error: latestError } = await supabase
    .from("keepalive_pings")
    .select("triggered_at")
    .order("triggered_at", { ascending: false })
    .limit(1);
  if (latestError) return { error: latestError.message };

  const { canPing, availableAt } = pingAvailability(latest?.[0]?.triggered_at);
  if (!canPing) {
    const { timeZone } = await getSiteSettings();
    return { error: `Already pinged recently. Available again ${formatPingTime(availableAt, timeZone)}.` };
  }

  // A real write, so it counts as project activity (not just a read).
  const { error } = await supabase
    .from("keepalive_pings")
    .insert({ source: "manual", triggered_by: profile.email });

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { success: true };
}

function splitList(value, separator) {
  const items = (value ?? "")
    .toString()
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(items)];
}

export async function saveSiteSettingsAction(prevState, formData) {
  const profile = await requireRole("admin");

  const text = (key) => formData.get(key)?.toString().trim() || null;

  const fields = {
    family_name: text("family_name"),
    family_lines: splitList(formData.get("family_lines"), /\r?\n/),
    site_name: text("site_name"),
    hero_eyebrow: text("hero_eyebrow"),
    tagline: text("tagline"),
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    meta_keywords: splitList(formData.get("meta_keywords"), ","),
    og_image_url: text("og_image_url"),
    allow_indexing: formData.get("allow_indexing") === "on",
    tree_title: text("tree_title"),
    tree_description: text("tree_description"),
    announcements_title: text("announcements_title"),
    young_title: text("young_title"),
    young_max_age: text("young_max_age") === null ? null : Number(text("young_max_age")),
    timezone: text("timezone"),
  };

  if (fields.timezone && !isValidTimeZone(fields.timezone)) {
    return { error: `"${fields.timezone}" isn't a valid timezone. Use a name like Asia/Manila or America/New_York.` };
  }
  if (
    fields.young_max_age !== null &&
    !(Number.isInteger(fields.young_max_age) && fields.young_max_age >= 1 && fields.young_max_age <= 18)
  ) {
    return { error: "The age limit must be a whole number from 1 to 18." };
  }
  if (fields.og_image_url && !/^https?:\/\//i.test(fields.og_image_url)) {
    return { error: "The share image must be a web address (http or https)." };
  }
  if (fields.meta_title && fields.meta_title.length > 120) {
    return { error: "The page title is too long (120 characters max) — search engines cut it off at about 60." };
  }
  if (fields.meta_description && fields.meta_description.length > 320) {
    return { error: "The description is too long (320 characters max) — search engines show about 160." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: true, ...fields, updated_by: profile.email }, { onConflict: "id" });

  if (error) {
    if (error.code === "PGRST205") {
      return { error: "The site_settings table doesn't exist yet — run supabase/006_site_settings.sql in the Supabase SQL editor." };
    }
    if (error.code === "PGRST204") {
      return { error: "The database is missing a newer settings column — run supabase/007_young_members_settings.sql in the Supabase SQL editor, then save again." };
    }
    return { error: error.message };
  }

  // Titles, meta tags, header, and footer are all read from these settings.
  revalidatePath("/", "layout");
  return { success: true };
}
