"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { formatPingTime, pingAvailability } from "@/lib/keepalive";
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
    return { error: `Already pinged recently. Available again ${formatPingTime(availableAt)}.` };
  }

  // A real write, so it counts as project activity (not just a read).
  const { error } = await supabase
    .from("keepalive_pings")
    .insert({ source: "manual", triggered_by: profile.email });

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { success: true };
}
