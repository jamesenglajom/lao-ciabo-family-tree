import { GlassPanel } from "@/components/ui/glass-panel";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { SubmitButton } from "@/components/admin/submit-button";
import { Pagination } from "@/components/admin/pagination";
import { ADMIN_PAGE_SIZE, pageRange, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { updateUserRole, updateUserScope } from "./actions";

export default async function AdminUsersPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { from, to } = pageRange(page);

  const currentProfile = await requireRole("admin");
  const supabase = await createClient();

  const [{ data: profiles, count, error }, { data: members }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, role, scope_member_id, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("members").select("id, full_name").order("full_name"),
  ]);

  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Users &amp; roles</h1>

      <GlassPanel hover={false} className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Add a user
        </h2>
        <CreateUserForm />
      </GlassPanel>

      <div className="glass overflow-hidden rounded-3xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Branch (managers only)</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile) => (
              <tr key={profile.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{profile.email}</td>
                <td className="px-5 py-3">
                  <form
                    action={updateUserRole.bind(null, profile.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="role"
                      defaultValue={profile.role}
                      disabled={profile.id === currentProfile.id}
                      className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink outline-none focus:border-accent disabled:opacity-50"
                    >
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <SubmitButton
                      disabled={profile.id === currentProfile.id}
                      pendingText={"Updating…"}
                      className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                    >
                      Update
                    </SubmitButton>
                  </form>
                </td>
                <td className="px-5 py-3">
                  <form
                    action={updateUserScope.bind(null, profile.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="scope_member_id"
                      defaultValue={profile.scope_member_id ?? ""}
                      className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
                    >
                      <option value="">Full access (no restriction)</option>
                      {(members ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>
                    <SubmitButton
                      pendingText={"Updating…"}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Update
                    </SubmitButton>
                  </form>
                </td>
                <td className="px-5 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} basePath="/admin/users" pageSize={ADMIN_PAGE_SIZE} totalCount={count ?? 0} />

      <p className="text-xs text-ink-faint">
        Setting a branch restricts a manager to creating/editing that person, their descendants, and
        spouses who married into that line. Admins are always unrestricted regardless of this
        setting.
      </p>
    </div>
  );
}
