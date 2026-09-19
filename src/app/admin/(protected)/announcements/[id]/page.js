import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ReminderForm } from "@/components/admin/reminder-form";
import { createClient } from "@/lib/supabase/server";
import { updateAnnouncement } from "../actions";

export default async function EditAnnouncementPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: reminder }, { data: members }] = await Promise.all([
    supabase.from("reminders").select("*").eq("id", id).single(),
    supabase.from("members").select("id, full_name").order("full_name"),
  ]);

  if (!reminder) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Edit {reminder.title}</h1>
      <GlassPanel hover={false} className="max-w-2xl p-8">
        <ReminderForm
          action={updateAnnouncement.bind(null, id)}
          reminder={reminder}
          members={members ?? []}
        />
      </GlassPanel>
    </div>
  );
}
