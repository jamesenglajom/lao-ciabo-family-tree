import Image from "next/image";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CopyUrlButton } from "@/components/admin/copy-url-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { createClient } from "@/lib/supabase/server";
import { uploadMedia, deleteMedia } from "./actions";
import { MAX_UPLOAD_LABEL } from "@/lib/media";

const BUCKETS = [
  { id: "member-photos", label: "Member Photos" },
  { id: "reminder-media", label: "Reminder Media" },
];

async function listBucket(supabase, bucket) {
  const { data } = await supabase.storage
    .from(bucket)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  return (data ?? [])
    .filter((item) => item.id) // skip Supabase's placeholder folder markers
    .map((item) => ({
      name: item.name,
      url: supabase.storage.from(bucket).getPublicUrl(item.name).data.publicUrl,
    }));
}

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const filesByBucket = Object.fromEntries(
    await Promise.all(BUCKETS.map(async (b) => [b.id, await listBucket(supabase, b.id)]))
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Media library</h1>

      {BUCKETS.map((bucket) => (
        <div key={bucket.id} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">{bucket.label}</h2>
            <div className="flex flex-col items-end gap-1">
              <form
                action={uploadMedia.bind(null, bucket.id)}
                encType="multipart/form-data"
                className="flex items-center gap-2"
              >
                <input type="file" name="file" accept="image/*" required className="text-sm text-ink-soft" />
                <SubmitButton
                  pendingText={"Uploading…"}
                  className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-ink disabled:opacity-60"
                >
                  Upload
                </SubmitButton>
              </form>
              <span className="text-xs text-ink-faint">Max file size: {MAX_UPLOAD_LABEL}.</span>
            </div>
          </div>

          <GlassPanel hover={false} className="p-6">
            {filesByBucket[bucket.id].length === 0 ? (
              <p className="text-sm text-ink-faint">No files uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {filesByBucket[bucket.id].map((file) => (
                  <div key={file.name} className="flex flex-col gap-2">
                    <div className="aspect-square overflow-hidden rounded-xl border border-line">
                      <Image
                        src={file.url}
                        alt=""
                        width={200}
                        height={200}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <CopyUrlButton url={file.url} />
                      <DeleteButton
                        action={deleteMedia.bind(null, bucket.id, file.name)}
                        confirmMessage={`Delete ${file.name}?`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      ))}
    </div>
  );
}
