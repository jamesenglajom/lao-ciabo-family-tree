import Image from "next/image";
import { initialsOf } from "@/lib/avatar";

/**
 * Small round photo for the admin members table. A member with no uploaded
 * photo gets a muted dashed placeholder (deliberately unlike the generated
 * initials avatar used on the public site) so missing photos stand out.
 */
export function MemberPhotoChip({ name, photoUrl }) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={36}
        height={36}
        unoptimized
        className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
      />
    );
  }

  return (
    <span
      title="No photo yet"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong bg-panel-soft text-[10px] font-semibold text-ink-faint"
    >
      {initialsOf(name)}
    </span>
  );
}
