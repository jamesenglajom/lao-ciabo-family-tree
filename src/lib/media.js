/**
 * Matches the fileSizeLimit set on the member-photos and reminder-media
 * Supabase Storage buckets (the real, unbypassable enforcement) — this
 * constant just lets the app fail fast with a friendly message instead of
 * uploading the whole file only to have Storage reject it.
 */
export const MAX_UPLOAD_BYTES = 2_000_000; // 2MB
export const MAX_UPLOAD_LABEL = "2MB";
