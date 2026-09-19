"use client";

import { useState } from "react";

export function CopyUrlButton({ url }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — no fallback needed here.
    }
  }

  return (
    <button type="button" onClick={handleCopy} className="text-xs font-medium text-accent hover:underline">
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}
