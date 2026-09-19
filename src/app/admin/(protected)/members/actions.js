"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function readMemberFields(formData) {
  const get = (key) => formData.get(key)?.toString().trim() || null;

  return {
    full_name: get("full_name"),
    gender: get("gender"),
    photo_url: get("photo_url"),
    date_of_birth: get("date_of_birth"),
    date_of_death: get("date_of_death"),
    description: get("description"),
    father_id: get("father_id"),
    mother_id: get("mother_id"),
  };
}

function readSocialLinks(formData) {
  const platforms = formData.getAll("social_platform");
  const urls = formData.getAll("social_url");
  return platforms
    .map((platform, index) => ({ platform: platform.toString(), url: urls[index]?.toString().trim() }))
    .filter((link) => link.url);
}

/** Replaces every spouse pairing for `memberId` with `spouseIds`, keeping the member_id < spouse_id ordering the schema requires. */
async function syncSpouses(supabase, memberId, spouseIds) {
  await supabase
    .from("member_spouses")
    .delete()
    .or(`member_id.eq.${memberId},spouse_id.eq.${memberId}`);

  const rows = spouseIds
    .filter((id) => id && id !== memberId)
    .map((id) => ({
      member_id: memberId < id ? memberId : id,
      spouse_id: memberId < id ? id : memberId,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("member_spouses").upsert(rows, { onConflict: "member_id,spouse_id" });
    if (error) throw error;
  }
}

/** Replaces every social link row for `memberId` with the submitted set. */
async function syncSocialLinks(supabase, memberId, links) {
  await supabase.from("member_social_links").delete().eq("member_id", memberId);

  if (links.length > 0) {
    const rows = links.map((link) => ({ member_id: memberId, platform: link.platform, url: link.url }));
    const { error } = await supabase.from("member_social_links").insert(rows);
    if (error) throw error;
  }
}

export async function createMember(formData) {
  await requireRole("admin", "manager");
  const supabase = await createClient();
  const fields = readMemberFields(formData);
  const spouseIds = formData.getAll("spouse_ids");
  const socialLinks = readSocialLinks(formData);

  const { data: member, error } = await supabase.from("members").insert(fields).select("id").single();
  if (error) throw error;

  await syncSpouses(supabase, member.id, spouseIds);
  await syncSocialLinks(supabase, member.id, socialLinks);

  revalidatePath("/admin/members");
  revalidatePath("/");
  revalidatePath("/family-tree");
  redirect("/admin/members");
}

export async function updateMember(memberId, formData) {
  await requireRole("admin", "manager");
  const supabase = await createClient();
  const fields = readMemberFields(formData);
  const spouseIds = formData.getAll("spouse_ids");
  const socialLinks = readSocialLinks(formData);

  const { error } = await supabase.from("members").update(fields).eq("id", memberId);
  if (error) throw error;

  await syncSpouses(supabase, memberId, spouseIds);
  await syncSocialLinks(supabase, memberId, socialLinks);

  revalidatePath("/admin/members");
  revalidatePath("/");
  revalidatePath("/family-tree");
  redirect("/admin/members");
}

export async function deleteMember(memberId) {
  await requireRole("admin", "manager");
  const supabase = await createClient();

  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) throw error;

  revalidatePath("/admin/members");
  revalidatePath("/");
  revalidatePath("/family-tree");
}
