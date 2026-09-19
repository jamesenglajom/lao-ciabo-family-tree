import { GlassPanel } from "@/components/ui/glass-panel";
import { ReminderForm } from "@/components/admin/reminder-form";
import { createClient } from "@/lib/supabase/server";
import { createAnnouncement } from "../actions";

export default async function NewAnnouncementPage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("members").select("id, full_name").order("full_name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Post announcement</h1>
      <GlassPanel hover={false} className="max-w-2xl p-8">
        <ReminderForm action={createAnnouncement} reminder={null} members={members ?? []} />
      </GlassPanel>
    </div>
  );
}
