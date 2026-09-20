"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/media";

const BUCKETS = ["member-photos", "reminder-media", "site-assets"];

// Site-wide assets (the share image) are admin-only; the other buckets are open to managers too.
function rolesFor(bucket) {
  return bucket === "site-assets" ? ["admin"] : ["admin", "manager"];
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/**
 * Uploads a file to the given bucket under a flat, unique path (no
 * per-record subfolders) so the media library and picker modal can list
 * every file with a single, one-level `.list()` call. Returns the public
 * URL so it can also be called directly from client code (the photo picker
 * modal), not just as a plain <form action>.
 */
export async function uploadMedia(bucket, formData) {
  if (!BUCKETS.includes(bucket)) return { error: "Unknown bucket." };
  await requireRole(...rolesFor(bucket));

  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: `File is too large — max ${MAX_UPLOAD_LABEL}.` };
  }

  const supabase = await createClient();
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  revalidatePath("/admin/media");
  return { url: publicUrl, path };
}

export async function deleteMedia(bucket, path) {
  if (!BUCKETS.includes(bucket)) return;
  await requireRole(...rolesFor(bucket));

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;

  revalidatePath("/admin/media");
}
