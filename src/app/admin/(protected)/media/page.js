import Image from "next/image";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CopyUrlButton } from "@/components/admin/copy-url-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { Pagination } from "@/components/admin/pagination";
import { ADMIN_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { uploadMedia, deleteMedia } from "./actions";
import { MAX_UPLOAD_LABEL } from "@/lib/media";

const ALL_BUCKETS = [
  { id: "member-photos", label: "Member Photos", pageParam: "member-photos-page" },
  { id: "reminder-media", label: "Reminder Media", pageParam: "reminder-media-page" },
  { id: "site-assets", label: "Site Assets (share image)", pageParam: "site-assets-page", adminOnly: true },
];

// Storage listings don't return a total count, so fetch one extra item to
// know whether a next page exists, then trim back down to the page size.
async function listBucketPage(supabase, bucket, page) {
  const { data } = await supabase.storage.from(bucket).list("", {
    limit: ADMIN_PAGE_SIZE + 1,
    offset: (page - 1) * ADMIN_PAGE_SIZE,
    sortBy: { column: "updated_at", order: "desc" },
  });

  const items = (data ?? []).filter((item) => item.id); // skip Supabase's placeholder folder markers
  const hasNextPage = items.length > ADMIN_PAGE_SIZE;

  const files = items.slice(0, ADMIN_PAGE_SIZE).map((item) => ({
    name: item.name,
    url: supabase.storage.from(bucket).getPublicUrl(item.name).data.publicUrl,
  }));

  return { files, hasNextPage };
}

export default async function AdminMediaPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const BUCKETS = ALL_BUCKETS.filter((bucket) => !bucket.adminOnly || profile?.role === "admin");

  const bucketPages = await Promise.all(
    BUCKETS.map(async (bucket) => {
      const page = parsePage(params[bucket.pageParam]);
      const { files, hasNextPage } = await listBucketPage(supabase, bucket.id, page);
      return [bucket.id, { page, files, hasNextPage }];
    })
  );
  const byBucket = Object.fromEntries(bucketPages);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Media library</h1>

      {BUCKETS.map((bucket) => (
        <div key={bucket.id} id={bucket.id} className="flex scroll-mt-20 flex-col gap-4">
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
            {byBucket[bucket.id].files.length === 0 ? (
              <p className="text-sm text-ink-faint">No files uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {byBucket[bucket.id].files.map((file) => (
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

          <Pagination
            page={byBucket[bucket.id].page}
            basePath="/admin/media"
            pageParam={bucket.pageParam}
            searchParams={params}
            hash={bucket.id}
            hasNextPage={byBucket[bucket.id].hasNextPage}
          />
        </div>
      ))}
    </div>
  );
}
