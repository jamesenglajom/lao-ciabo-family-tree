import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: memberCount }, { count: announcementCount }] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("reminders").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Family members", value: memberCount ?? 0, href: "/admin/members" },
    { label: "Announcements", value: announcementCount ?? 0, href: "/admin/announcements" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <GlassPanel key={card.label} className="flex flex-col gap-3 p-6">
            <span className="text-4xl font-semibold tracking-tight text-ink">{card.value}</span>
            <span className="text-sm text-ink-faint">{card.label}</span>
            <Link href={card.href} className="text-sm font-medium text-accent hover:underline">
              Manage &rarr;
            </Link>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
