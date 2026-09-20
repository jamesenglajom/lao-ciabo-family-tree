// Supabase's free tier pauses a project after ~7 days without activity.
const WARN_AFTER_DAYS = 5;
const PAUSE_AFTER_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

// The server renders in UTC, so times are formatted in the timezone chosen in
// the site settings (see /admin/config) and labelled with it, e.g. "GMT+8".
export function formatPingTime(iso, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short",
    timeZone,
  }).format(new Date(iso));
}

export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
}

// The button locks after a ping and re-enables when the page starts showing
// "Due soon". Deliberately not the full pause window: a 7-day lock would only
// reopen at the moment Supabase is allowed to pause the project.
export const PING_COOLDOWN_DAYS = WARN_AFTER_DAYS;

/** Whether a manual ping is allowed now, and if not, when it becomes available. */
export function pingAvailability(lastPingIso) {
  if (!lastPingIso) return { canPing: true, availableAt: null };

  const availableAt = new Date(new Date(lastPingIso).getTime() + PING_COOLDOWN_DAYS * DAY_MS);
  if (availableAt.getTime() <= Date.now()) return { canPing: true, availableAt: null };

  return { canPing: false, availableAt: availableAt.toISOString() };
}

/** How close the project is to being paused, given the newest ping (or null). */
export function keepAliveStatus(lastPingIso) {
  if (!lastPingIso) {
    return { level: "never", label: "Never pinged", detail: "No ping has been recorded yet." };
  }

  const days = (Date.now() - new Date(lastPingIso).getTime()) / DAY_MS;

  if (days >= PAUSE_AFTER_DAYS) {
    return {
      level: "overdue",
      label: "Overdue",
      detail: `It's been over ${PAUSE_AFTER_DAYS} days — Supabase may pause the project. Ping now.`,
    };
  }
  if (days >= WARN_AFTER_DAYS) {
    return {
      level: "soon",
      label: "Due soon",
      detail: `Supabase can pause the project after ${PAUSE_AFTER_DAYS} days of inactivity.`,
    };
  }
  return { level: "ok", label: "Up to date", detail: "The project was pinged recently." };
}
