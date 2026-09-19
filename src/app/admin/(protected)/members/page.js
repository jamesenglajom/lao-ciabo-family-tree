import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteMember } from "./actions";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("members")
    .select(
      "id, full_name, gender, date_of_birth, date_of_death, father:father_id(full_name), mother:mother_id(full_name)"
    )
    .order("full_name");

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

      <div className="glass overflow-hidden rounded-3xl">
        <table className="w-full text-left text-sm">
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
                  No members yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
