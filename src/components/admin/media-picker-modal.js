"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadMedia } from "@/app/admin/(protected)/media/actions";

/**
 * A picker for choosing (or uploading) an image from a storage bucket.
 * Deliberately has no delete/copy-URL actions — full media management lives
 * on /admin/media; this is just "set the image" for one record.
 */
export function MediaPickerModal({ open, bucket, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadImages() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: listError } = await supabase.storage
        .from(bucket)
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

      if (cancelled) return;

      if (listError) {
        setError(listError.message);
        setImages([]);
      } else {
        setImages(
          (data ?? [])
            .filter((item) => item.id)
            .map((item) => ({
              name: item.name,
              url: supabase.storage.from(bucket).getPublicUrl(item.name).data.publicUrl,
            }))
        );
      }
      setLoading(false);
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [open, bucket]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    const result = await uploadMedia(bucket, formData);
    setUploading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    onSelect(result.url);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Choose a photo</h2>
          <button type="button" onClick={onClose} className="text-sm text-ink-faint hover:text-ink">
            Close
          </button>
        </div>

        <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
          {uploading ? "Uploading…" : "Upload new photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {error ? <p className="mb-4 text-sm font-medium text-red-500">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-ink-faint">Loading&hellip;</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-ink-faint">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.map((image) => (
              <button
                key={image.name}
                type="button"
                onClick={() => onSelect(image.url)}
                className="aspect-square overflow-hidden rounded-xl border border-line transition-transform hover:scale-105"
              >
                <Image
                  src={image.url}
                  alt=""
                  width={100}
                  height={100}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
