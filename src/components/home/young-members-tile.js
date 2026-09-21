import Image from "next/image";
import { GlassPanel } from "@/components/ui/glass-panel";

const MAX_SHOWN = 8;

/**
 * The family's youngest living members. Names and photos only — no dates or
 * ages per child; the age limit appears once, as the card's label.
 */
export function YoungMembersTile({ members, title, maxAge }) {
  const shown = members.slice(0, MAX_SHOWN);
  const hidden = members.length - shown.length;

  return (
    <GlassPanel className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent-2">
          Under {maxAge}
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-ink-faint">No children under {maxAge} right now.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Image
                src={member.avatar}
                alt={member.full_name}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 shrink-0 rounded-full border border-line object-cover object-center"
              />
              <span className="text-sm font-medium text-ink">{member.full_name}</span>
            </li>
          ))}
          {hidden > 0 ? <li className="text-xs text-ink-faint">and {hidden} more</li> : null}
        </ul>
      )}
    </GlassPanel>
  );
}
