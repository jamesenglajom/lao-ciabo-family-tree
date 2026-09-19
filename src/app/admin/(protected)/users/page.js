import { GlassPanel } from "@/components/ui/glass-panel";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { updateUserRole } from "./actions";

export default async function AdminUsersPage() {
  const currentProfile = await requireRole("admin");
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at");

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
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile) => (
              <tr key={profile.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{profile.email}</td>
                <td className="px-5 py-3 text-ink-soft">{profile.role}</td>
                <td className="px-5 py-3">
                  <form
                    action={updateUserRole.bind(null, profile.id)}
                    className="flex items-center justify-end gap-2"
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
                    <button
                      type="submit"
                      disabled={profile.id === currentProfile.id}
                      className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                    >
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
