import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { getManageableMemberIds } from "@/lib/scope";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/admin/pagination";
import { ADMIN_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { deleteMember } from "./actions";

export default async function AdminMembersPage({ searchParams }) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const search = typeof params.q === "string" ? params.q.trim() : "";

  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const scopeIds = await getManageableMemberIds(supabase, profile);

  let query = supabase
    .from("members")
    .select(
      "id, full_name, gender, date_of_birth, date_of_death, father:father_id(full_name), mother:mother_id(full_name)",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (scopeIds) query = query.in("id", scopeIds);
  // Escape LIKE wildcards so the search is a literal, case-insensitive substring match.
  if (search) query = query.ilike("full_name", `%${search.replace(/[\\%_]/g, "\\$&")}%`);

  const { data: members, count, error } = await query;
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Members</h1>
        <Link
          href="/admin/members/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02]"
        >
          Add member
        </Link>
      </div>

      <form action="/admin/members" method="get" role="search" className="flex items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search members by name"
          aria-label="Search members by name"
          className="w-full max-w-sm rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
        >
          Search
        </button>
        {search ? (
          <Link href="/admin/members" className="text-sm font-medium text-accent hover:underline">
            Clear
          </Link>
        ) : null}
      </form>

      {scopeIds ? (
        <p className="text-xs text-ink-faint">
          Showing only the branch you&apos;ve been assigned ({scopeIds.length}{" "}
          {scopeIds.length === 1 ? "person" : "people"}).
        </p>
      ) : null}

      {search ? (
        <p className="text-xs text-ink-faint">
          {count ?? 0} {count === 1 ? "result" : "results"} for &ldquo;{search}&rdquo;.
        </p>
      ) : null}

      <div className="glass overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Gender</th>
              <th className="px-5 py-3">Born</th>
              <th className="px-5 py-3">Died</th>
              <th className="px-5 py-3">Father</th>
              <th className="px-5 py-3">Mother</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((member) => (
              <tr key={member.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{member.full_name}</td>
                <td className="px-5 py-3 text-ink-soft">{member.gender}</td>
                <td className="px-5 py-3 text-ink-soft">{member.date_of_birth ?? "—"}</td>
                <td className="px-5 py-3 text-ink-soft">{member.date_of_death ?? "—"}</td>
                <td className="px-5 py-3 text-ink-soft">{member.father?.full_name ?? "—"}</td>
                <td className="px-5 py-3 text-ink-soft">{member.mother?.full_name ?? "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteMember.bind(null, member.id)}
                      confirmMessage={`Delete ${member.full_name}? This cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(members ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink-faint">
                  {search ? "No members match your search." : "No members yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination
        page={page}
        basePath="/admin/members"
        pageSize={ADMIN_PAGE_SIZE}
        totalCount={count ?? 0}
        searchParams={params}
      />
    </div>
  );
}
