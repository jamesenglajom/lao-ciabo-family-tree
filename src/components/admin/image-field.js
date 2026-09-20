"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

/**
 * A picture chosen through the media picker and submitted as a URL in a
 * hidden input. Used for member photos and the site's share image; `wide`
 * gives the preview a landscape shape for the latter.
 */
export function ImageField({
  name,
  initialUrl,
  bucket,
  label = "Photo",
  chooseLabel = "Choose photo",
  emptyText = "No photo",
  modalTitle,
  hint,
  wide = false,
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [open, setOpen] = useState(false);

  const previewSize = wide ? "h-20 w-36" : "h-20 w-20";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="hidden" name={name} value={url} readOnly />
      <div className="flex items-center gap-4">
        <div
          className={`flex ${previewSize} shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel-soft text-xs text-ink-faint`}
        >
          {url ? (
            <Image
              src={url}
              alt=""
              width={wide ? 144 : 80}
              height={80}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            emptyText
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {chooseLabel}
          </button>
          {url ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}

      <MediaPickerModal
        open={open}
        bucket={bucket}
        title={modalTitle}
        onClose={() => setOpen(false)}
        onSelect={(newUrl) => {
          setUrl(newUrl);
          setOpen(false);
        }}
      />
    </div>
  );
}
