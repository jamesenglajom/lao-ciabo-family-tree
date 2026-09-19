"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateUserRole(userId, formData) {
  await requireRole("admin");
  const role = formData.get("role")?.toString();
  if (!["admin", "manager"].includes(role)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin/users");
}

export async function createUserAction(prevState, formData) {
  await requireRole("admin");
  const email = formData.get("email")?.toString().trim();
  const role = formData.get("role")?.toString();

  if (!email || !["admin", "manager"].includes(role)) {
    return { error: "Enter a valid email and choose a role." };
  }

  const admin = createAdminClient();
  const password = crypto.randomBytes(12).toString("base64url");

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, email, role });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin/users");
  return { success: true, email, password };
}
