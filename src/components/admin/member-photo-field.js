"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

export function MemberPhotoField({ name = "photo_url", initialUrl }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">Photo</span>
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel-soft text-xs text-ink-faint">
          {url ? (
            <Image src={url} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
          ) : (
            "No photo"
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Choose photo
        </button>
      </div>

      <MediaPickerModal
        open={open}
        bucket="member-photos"
        onClose={() => setOpen(false)}
        onSelect={(newUrl) => {
          setUrl(newUrl);
          setOpen(false);
        }}
      />
    </div>
  );
}
