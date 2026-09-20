"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/media";

function readReminderFields(formData) {
  const get = (key) => formData.get(key)?.toString().trim() || null;

  return {
    type: get("type"),
    title: get("title"),
    description: get("description"),
    event_date: get("event_date"),
    location: get("location"),
    link: get("link"),
    related_member_id: get("related_member_id"),
    is_published: formData.get("is_published") === "on",
  };
}

async function uploadCoverIfProvided(supabase, reminderId, formData) {
  const file = formData.get("cover_image");
  if (!file || typeof file === "string" || file.size === 0) return undefined;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Cover image is too large — max ${MAX_UPLOAD_LABEL}.`);
  }

  const path = `${reminderId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("reminder-media").upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("reminder-media").getPublicUrl(path);
  return publicUrl;
}

export async function createAnnouncement(formData) {
  await requireRole("admin", "manager");
  const supabase = await createClient();
  const fields = readReminderFields(formData);

  const { data: reminder, error } = await supabase
    .from("reminders")
    .insert(fields)
    .select("id")
    .single();
  if (error) throw error;

  const coverUrl = await uploadCoverIfProvided(supabase, reminder.id, formData);
  if (coverUrl) {
    await supabase.from("reminders").update({ cover_image_url: coverUrl }).eq("id", reminder.id);
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(reminderId, formData) {
  await requireRole("admin", "manager");
  const supabase = await createClient();
  const fields = readReminderFields(formData);

  const coverUrl = await uploadCoverIfProvided(supabase, reminderId, formData);
  const update = coverUrl ? { ...fields, cover_image_url: coverUrl } : fields;

  const { error } = await supabase.from("reminders").update(update).eq("id", reminderId);
  if (error) throw error;

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(reminderId) {
  await requireRole("admin", "manager");
  const supabase = await createClient();

  const { error } = await supabase.from("reminders").delete().eq("id", reminderId);
  if (error) throw error;

  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
