import { GlassPanel } from "@/components/ui/glass-panel";
import { MemberForm } from "@/components/admin/member-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getManageableMemberIds } from "@/lib/scope";
import { createMember } from "../actions";

export default async function NewMemberPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const scopeIds = await getManageableMemberIds(supabase, profile);

  let query = supabase.from("members").select("id, full_name, gender").order("full_name");
  if (scopeIds) query = query.in("id", scopeIds);
  const { data: members } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Add member</h1>
      {scopeIds ? (
        <p className="text-xs text-ink-faint">
          Father/mother/spouse can only be chosen from your assigned branch.
        </p>
      ) : null}
      <GlassPanel hover={false} className="max-w-2xl p-8">
        <MemberForm action={createMember} member={null} members={members ?? []} />
      </GlassPanel>
    </div>
  );
}
