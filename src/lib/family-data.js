import { createClient } from "@/lib/supabase/server";
import { initialsAvatarDataUri } from "@/lib/avatar";

function yearOf(dateString) {
  return dateString ? new Date(dateString).getFullYear() : null;
}

/**
 * Fetches every member + spouse pairing from Supabase and shapes it into the
 * {id, data, rels} array family-chart expects.
 */
export async function getFamilyChartData() {
  const supabase = await createClient();

  const [{ data: members, error: membersError }, { data: spousePairs, error: spousesError }] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, gender, photo_url, date_of_birth, date_of_death, father_id, mother_id"),
      supabase.from("member_spouses").select("member_id, spouse_id"),
    ]);

  if (membersError) throw membersError;
  if (spousesError) throw spousesError;

  const spousesById = new Map();
  for (const { member_id, spouse_id } of spousePairs ?? []) {
    if (!spousesById.has(member_id)) spousesById.set(member_id, []);
    if (!spousesById.has(spouse_id)) spousesById.set(spouse_id, []);
    spousesById.get(member_id).push(spouse_id);
    spousesById.get(spouse_id).push(member_id);
  }

  return (members ?? []).map((member) => {
    const children = members
      .filter((other) => other.father_id === member.id || other.mother_id === member.id)
      .map((other) => other.id);
    const parents = [member.father_id, member.mother_id].filter(Boolean);
    const birthYear = yearOf(member.date_of_birth);
    const deathYear = yearOf(member.date_of_death);

    return {
      id: member.id,
      data: {
        gender: member.gender,
        name: member.full_name,
        birthday: deathYear ? `${birthYear} - ${deathYear}` : `${birthYear ?? ""}`,
        avatar: member.photo_url || initialsAvatarDataUri({ name: member.full_name, gender: member.gender }),
      },
      rels: {
        parents,
        spouses: spousesById.get(member.id) ?? [],
        children,
      },
    };
  });
}
