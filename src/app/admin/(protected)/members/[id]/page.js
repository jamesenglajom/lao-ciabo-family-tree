import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MemberForm } from "@/components/admin/member-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getManageableMemberIds } from "@/lib/scope";
import { updateMember } from "../actions";

export default async function EditMemberPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const scopeIds = await getManageableMemberIds(supabase, profile);

  if (scopeIds && !scopeIds.includes(id)) notFound();

  let membersQuery = supabase.from("members").select("id, full_name, gender").order("full_name");
  if (scopeIds) membersQuery = membersQuery.in("id", scopeIds);

  const [{ data: member }, { data: members }, { data: spousePairs }, { data: socialLinks }] = await Promise.all([
    supabase.from("members").select("*").eq("id", id).single(),
    membersQuery,
    supabase.from("member_spouses").select("member_id, spouse_id").or(`member_id.eq.${id},spouse_id.eq.${id}`),
    supabase.from("member_social_links").select("platform, url").eq("member_id", id),
  ]);

  if (!member) notFound();

  // Parents outside a scoped manager's branch (e.g. the branch root's own
  // parents) can't be edited by them — show them read-only, not as a blank.
  const outsideParentIds = scopeIds
    ? [member.father_id, member.mother_id].filter((pid) => pid && !scopeIds.includes(pid))
    : [];
  const { data: outsideParents } = outsideParentIds.length
    ? await supabase.from("members").select("id, full_name").in("id", outsideParentIds)
    : { data: [] };
  const lockedFather = outsideParents?.find((p) => p.id === member.father_id) ?? null;
  const lockedMother = outsideParents?.find((p) => p.id === member.mother_id) ?? null;

  const currentSpouseIds = (spousePairs ?? []).map((pair) =>
    pair.member_id === id ? pair.spouse_id : pair.member_id
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Edit {member.full_name}</h1>
      <GlassPanel hover={false} className="max-w-2xl p-8">
        <MemberForm
          action={updateMember.bind(null, id)}
          member={member}
          members={members ?? []}
          currentSpouseIds={currentSpouseIds}
          currentSocialLinks={socialLinks ?? []}
          lockedFather={lockedFather}
          lockedMother={lockedMother}
        />
      </GlassPanel>
    </div>
  );
}
