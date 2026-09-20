import { createClient } from "@/lib/supabase/server";
import { initialsAvatarDataUri } from "@/lib/avatar";
import { ageInYears } from "@/lib/age";
import { getSiteSettings } from "@/lib/site-settings";

/** Longest chain of father/mother links back to a root ancestor, as a generation count. */
function computeGenerationCount(members) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const depthCache = new Map();

  function depthOf(id, seen) {
    if (depthCache.has(id)) return depthCache.get(id);
    if (seen.has(id)) return 0; // guards against bad/cyclic data
    const member = byId.get(id);
    if (!member || (!member.father_id && !member.mother_id)) {
      depthCache.set(id, 0);
      return 0;
    }
    const nextSeen = new Set(seen).add(id);
    const parentDepths = [member.father_id, member.mother_id]
      .filter(Boolean)
      .map((parentId) => depthOf(parentId, nextSeen));
    const depth = 1 + Math.max(0, ...parentDepths);
    depthCache.set(id, depth);
    return depth;
  }

  let max = 0;
  for (const member of members) max = Math.max(max, depthOf(member.id, new Set()));
  return members.length ? max + 1 : 0;
}

function withAvatar(member) {
  return {
    ...member,
    avatar: member.photo_url || initialsAvatarDataUri({ name: member.full_name, gender: member.gender }),
  };
}

/**
 * Everything the homepage bento grid needs, fetched in two queries. Kept
 * simple because a family tree's member/announcement counts are small
 * enough to filter and derive stats in JS rather than with SQL aggregates.
 */
export async function getHomeData() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const [
    { data: members, error: membersError },
    { data: announcements, error: announcementsError },
    { youngMaxAge },
  ] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, gender, photo_url, date_of_birth, date_of_death, father_id, mother_id")
        .order("full_name"),
      supabase
        .from("reminders")
        .select("id, type, title, description, event_date, location, link, related_member_id")
        .eq("is_published", true)
        .order("event_date", { ascending: false })
        .limit(6),
      getSiteSettings(),
    ]);

  if (membersError) throw membersError;
  if (announcementsError) throw announcementsError;

  const allMembers = members ?? [];

  const birthdayCelebrants = allMembers
    .filter(
      (m) =>
        !m.date_of_death &&
        m.date_of_birth &&
        new Date(m.date_of_birth).getMonth() + 1 === currentMonth
    )
    .map(withAvatar);

  // The youngest living members (younger than the configured age), newest arrivals first.
  const youngMembers = allMembers
    .filter((m) => !m.date_of_death && m.date_of_birth && ageInYears(m.date_of_birth, now) < youngMaxAge)
    .sort((a, b) => b.date_of_birth.localeCompare(a.date_of_birth))
    .map(withAvatar);

  const stats = {
    totalMembers: allMembers.length,
    livingMembers: allMembers.filter((m) => !m.date_of_death).length,
    foundingMembers: allMembers.filter((m) => !m.father_id && !m.mother_id).length,
    generations: computeGenerationCount(allMembers),
  };

  // Hero chips only show members with a real uploaded photo, not the generated initials fallback.
  const spotlightMembers = allMembers
    .filter((m) => m.photo_url)
    .slice(0, 7)
    .map(withAvatar);

  return {
    stats,
    birthdayCelebrants,
    youngMembers,
    announcements: announcements ?? [],
    spotlightMembers,
  };
}
