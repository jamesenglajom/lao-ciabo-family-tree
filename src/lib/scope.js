import "server-only";

/**
 * Returns the ids a profile may manage — null means unrestricted (admins,
 * and managers with no scope_member_id set). Otherwise resolves the root's
 * descendants + spouses via the member_scope_ids() Postgres function.
 */
export async function getManageableMemberIds(supabase, profile) {
  if (profile.role === "admin" || !profile.scope_member_id) return null;

  const { data, error } = await supabase.rpc("member_scope_ids", {
    root_id: profile.scope_member_id,
  });
  if (error) throw error;

  return (data ?? []).map((row) => row.id);
}
