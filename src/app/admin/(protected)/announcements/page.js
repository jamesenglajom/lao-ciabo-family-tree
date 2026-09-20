import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/admin/pagination";
import { ADMIN_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { reminderTypeLabel } from "@/lib/reminder-types";
import { deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { from, to } = pageRange(page);

  const supabase = await createClient();
  const { data: announcements, count, error } = await supabase
    .from("reminders")
    .select("id, type, title, event_date, is_published", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Announcements</h1>
        <Link
          href="/admin/announcements/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02]"
        >
          Post announcement
        </Link>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(announcements ?? []).map((item) => (
              <tr key={item.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{item.title}</td>
                <td className="px-5 py-3 text-ink-soft">{reminderTypeLabel(item.type)}</td>
                <td className="px-5 py-3 text-ink-soft">{item.event_date ?? "—"}</td>
                <td className="px-5 py-3 text-ink-soft">
                  {item.is_published ? "Published" : "Draft"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/announcements/${item.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteAnnouncement.bind(null, item.id)}
                      confirmMessage={`Delete "${item.title}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(announcements ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-faint">
                  No announcements yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        basePath="/admin/announcements"
        pageSize={ADMIN_PAGE_SIZE}
        totalCount={count ?? 0}
      />
    </div>
  );
}
