/**
 * Turns the (possibly missing, possibly half-filled) site_settings row into
 * the concrete strings the site displays. Every field is optional: a blank
 * one falls back to a default derived from the family name, so a fresh
 * deployment for a different family works before anyone configures it.
 *
 * Pure (no imports, no I/O) so it can be tested on its own.
 */

/** "A", "A & B", or "A, B & C" */
export function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

function cleanList(values) {
  return [...new Set((values ?? []).map(clean).filter(Boolean))];
}

export function isValidTimeZone(timeZone) {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function resolveSiteSettings(row) {
  const r = row ?? {};

  const familyName = clean(r.family_name);
  const familyLines = cleanList(r.family_lines);
  const linesText = joinNames(familyLines);
  const hasLines = Boolean(familyName) && familyLines.length > 0;

  const customSiteName = clean(r.site_name);
  const siteName = customSiteName || (familyName ? `The ${familyName} Family Tree` : "Our Family Tree");
  // Lets the home hero highlight the family name when using the default title.
  const siteNameParts =
    !customSiteName && familyName
      ? { before: "The ", accent: familyName, after: " Family Tree" }
      : { before: siteName, accent: "", after: "" };

  const whoTree = familyName ? `The ${familyName} family tree` : "Our family tree";
  const via = hasLines ? ` — descendants of ${familyName} through the ${linesText} lines` : "";

  const keywords = cleanList(r.meta_keywords);
  const customTreeDescription = clean(r.tree_description);

  return {
    familyName,
    familyLines,
    linesText,
    siteName,
    siteNameParts,
    brand: { first: familyName || "Family", second: familyName ? "Family" : "Tree" },
    ownerName: familyName ? `The ${familyName} Family` : "Our Family",

    homeTitle: clean(r.meta_title) || (familyLines.length ? `${siteName} — ${linesText}` : siteName),
    description:
      clean(r.meta_description) ||
      `${whoTree}${via}, with birthdays, new arrivals, and family announcements.`,
    keywords:
      keywords.length > 0
        ? keywords
        : [
            ...(familyName ? [`${familyName} family`, `${familyName} family tree`] : []),
            ...familyLines,
            "family tree",
            "genealogy",
          ],
    ogImageUrl: clean(r.og_image_url) || null,
    allowIndexing: r.allow_indexing !== false,

    heroEyebrow: clean(r.hero_eyebrow) || "Family heritage platform",
    tagline:
      clean(r.tagline) ||
      (hasLines
        ? `Descendants of ${familyName} through the ${linesText} lines, gathered in one tree. This is the home base for preserving who came from whom.`
        : "The home base for preserving who came from whom."),

    treeTitle: clean(r.tree_title) || siteName,
    treeDescription:
      customTreeDescription ||
      (hasLines
        ? `Descendants of ${familyName} through the ${linesText} lines.`
        : "Everyone in the family, in one interactive tree."),
    treeMetaDescription: customTreeDescription
      ? `${customTreeDescription} An interactive chart that recenters on any person.`
      : `${whoTree}${via}, as an interactive chart that recenters on any person.`,

    announcementsTitle: clean(r.announcements_title) || "Family Announcements",
    timeZone: isValidTimeZone(clean(r.timezone)) ? clean(r.timezone) : "UTC",
  };
}
