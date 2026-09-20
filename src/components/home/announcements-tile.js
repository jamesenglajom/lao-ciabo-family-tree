import { GlassPanel } from "@/components/ui/glass-panel";
import { reminderTypeLabel } from "@/lib/reminder-types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function AnnouncementsTile({ announcements, title, className = "" }) {
  return (
    <GlassPanel className={`flex flex-col gap-4 p-6 ${className}`}>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Stay in the loop
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      </div>

      {announcements.length === 0 ? (
        <p className="text-sm text-ink-faint">Nothing posted yet — check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {announcements.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-panel-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  {reminderTypeLabel(item.type)}
                </span>
                {item.event_date ? (
                  <span className="text-xs text-ink-faint">
                    {DATE_FORMATTER.format(new Date(item.event_date))}
                  </span>
                ) : null}
                {item.location ? (
                  <span className="text-xs text-ink-faint">&middot; {item.location}</span>
                ) : null}
              </div>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              {item.description ? (
                <p className="line-clamp-2 text-sm text-ink-soft">{item.description}</p>
              ) : null}
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit text-xs font-medium text-accent hover:underline"
                >
                  View post &rarr;
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}
