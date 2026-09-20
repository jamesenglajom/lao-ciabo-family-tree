"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function pingSupabaseAction() {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  // A real write, so it counts as project activity (not just a read).
  const { error } = await supabase
    .from("keepalive_pings")
    .insert({ source: "manual", triggered_by: profile.email });

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { success: true };
}
