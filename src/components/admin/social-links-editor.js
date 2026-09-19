"use client";

import { useState } from "react";

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "messenger", label: "Messenger" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

export function SocialLinksEditor({ currentLinks = [] }) {
  const [rows, setRows] = useState(() =>
    currentLinks.map((link) => ({ id: crypto.randomUUID(), ...link }))
  );

  function addRow() {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), platform: "facebook", url: "" }]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">Social media</span>

      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <select
            name="social_platform"
            defaultValue={row.platform}
            className="rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
          <input
            name="social_url"
            type="url"
            placeholder="https://..."
            defaultValue={row.url}
            className="flex-1 rounded-2xl border border-line bg-panel px-4 py-2 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addRow} className="w-fit text-sm font-medium text-accent hover:underline">
        + Add social link
      </button>
    </div>
  );
}
