import Image from "next/image";
import { GlassPanel } from "@/components/ui/glass-panel";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function BirthdayTile({ members }) {
  return (
    <GlassPanel className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          This Month
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-ink">Birthday Celebrants</h3>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-ink-faint">No birthdays recorded this month.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Image
                src={member.avatar}
                alt={member.full_name}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 rounded-full border border-line"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink">{member.full_name}</span>
                <span className="text-xs text-ink-faint">
                  {DAY_FORMATTER.format(new Date(member.date_of_birth))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}
