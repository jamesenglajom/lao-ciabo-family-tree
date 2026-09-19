import { GlassPanel } from "@/components/ui/glass-panel";
import { MemberForm } from "@/components/admin/member-form";
import { createClient } from "@/lib/supabase/server";
import { createMember } from "../actions";

export default async function NewMemberPage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("members").select("id, full_name, gender").order("full_name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Add member</h1>
      <GlassPanel hover={false} className="max-w-2xl p-8">
        <MemberForm action={createMember} member={null} members={members ?? []} />
      </GlassPanel>
    </div>
  );
}
