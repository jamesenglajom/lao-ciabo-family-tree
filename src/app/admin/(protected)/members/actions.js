"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getManageableMemberIds } from "@/lib/scope";
import { createClient } from "@/lib/supabase/server";

/**
 * Decides a parent link's value on save. A branch-scoped manager's form can
 * only offer people inside their branch, so a parent *above* it (e.g. the
 * branch root's own father/mother) can't be shown in the dropdown — the
 * browser would fall back to the blank option and submit "no parent",
 * silently disconnecting the person from the tree. So:
 *  - unrestricted (admin / manager with no branch): use what was submitted
 *  - existing parent is outside the branch: locked, keep it as-is
 *  - submitted parent is outside the branch: not allowed, keep existing
 */
function resolveParentId(existingId, submittedId, scopeIds) {
  if (!scopeIds) return submittedId;
  if (existingId && !scopeIds.includes(existingId)) return existingId;
  if (submittedId && !scopeIds.includes(submittedId)) return existingId ?? null;
  return submittedId;
}

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

/**
 * Replaces `memberId`'s spouse pairings with `spouseIds`, keeping the
 * member_id < spouse_id ordering the schema requires. For a branch-scoped
 * manager (`scopeIds` set) only pairings with people inside the branch are
 * replaced; existing pairings with someone outside it (which the form can't
 * display) are left untouched rather than deleted.
 */
async function syncSpouses(supabase, memberId, spouseIds, scopeIds) {
  const canManage = (id) => !scopeIds || scopeIds.includes(id);

  const { data: existing, error: fetchError } = await supabase
    .from("member_spouses")
    .select("member_id, spouse_id")
    .or(`member_id.eq.${memberId},spouse_id.eq.${memberId}`);
  if (fetchError) throw fetchError;

  const otherSide = (pair) => (pair.member_id === memberId ? pair.spouse_id : pair.member_id);
  const removable = (existing ?? []).filter((pair) => canManage(otherSide(pair)));

  if (removable.length > 0) {
    const filter = removable
      .map((pair) => `and(member_id.eq.${pair.member_id},spouse_id.eq.${pair.spouse_id})`)
      .join(",");
    const { error } = await supabase.from("member_spouses").delete().or(filter);
    if (error) throw error;
  }

  const rows = spouseIds
    .filter((id) => id && id !== memberId && canManage(id))
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
  const profile = await requireRole("admin", "manager");
  const supabase = await createClient();
  const scopeIds = await getManageableMemberIds(supabase, profile);
  const fields = readMemberFields(formData);
  fields.father_id = resolveParentId(null, fields.father_id, scopeIds);
  fields.mother_id = resolveParentId(null, fields.mother_id, scopeIds);
  const spouseIds = formData.getAll("spouse_ids");
  const socialLinks = readSocialLinks(formData);

  const { data: member, error } = await supabase
    .from("members")
    .insert({ ...fields, created_by: profile.id })
    .select("id")
    .single();
  if (error) throw error;

  await syncSpouses(supabase, member.id, spouseIds, scopeIds);
  await syncSocialLinks(supabase, member.id, socialLinks);

  revalidatePath("/admin/members");
  revalidatePath("/");
  revalidatePath("/family-tree");
  redirect("/admin/members");
}

export async function updateMember(memberId, formData) {
  const profile = await requireRole("admin", "manager");
  const supabase = await createClient();
  const scopeIds = await getManageableMemberIds(supabase, profile);
  const fields = readMemberFields(formData);
  const spouseIds = formData.getAll("spouse_ids");
  const socialLinks = readSocialLinks(formData);

  if (scopeIds) {
    const { data: existing, error: existingError } = await supabase
      .from("members")
      .select("father_id, mother_id")
      .eq("id", memberId)
      .single();
    if (existingError) throw existingError;

    fields.father_id = resolveParentId(existing.father_id, fields.father_id, scopeIds);
    fields.mother_id = resolveParentId(existing.mother_id, fields.mother_id, scopeIds);
  }

  const { error } = await supabase.from("members").update(fields).eq("id", memberId);
  if (error) throw error;

  await syncSpouses(supabase, memberId, spouseIds, scopeIds);
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
