const MALE_GRADIENT = ["#63b3ff", "#0a84ff"];
const FEMALE_GRADIENT = ["#e69bff", "#bf5af2"];

function initialsOf(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Renders a small gradient "initials" avatar as an inline SVG data URI. Used
 * as a fallback whenever a member has no uploaded photo — no network
 * request, no binary asset, theme-independent.
 */
export function initialsAvatarDataUri({ name, gender }) {
  const [from, to] = gender === "F" ? FEMALE_GRADIENT : MALE_GRADIENT;
  const initials = initialsOf(name);
  const gradientId = `g-${gender === "F" ? "f" : "m"}`;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">` +
    `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="160" height="160" rx="80" fill="url(#${gradientId})"/>` +
    `<text x="80" y="98" font-family="Arial, Helvetica, sans-serif" font-size="58" ` +
    `font-weight="700" fill="#04121a" text-anchor="middle">${initials}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
