import Link from "next/link";

function buildHref(basePath, searchParams, pageParam, page, hash) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") params.set(key, value);
  }
  params.set(pageParam, String(page));
  const hashSuffix = hash ? `#${hash}` : "";
  return `${basePath}?${params.toString()}${hashSuffix}`;
}

function PageLink({ href, enabled, children }) {
  const className = `rounded-full border border-line px-3 py-1.5 text-sm transition-colors ${
    enabled ? "text-ink-soft hover:border-accent hover:text-accent" : "text-ink-faint opacity-40"
  }`;

  if (!enabled) return <span className={className}>{children}</span>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Server-rendered Prev/Next pagination — no client JS needed, each click is
 * a normal navigation. Pass `totalCount` for a counted table (members/
 * reminders/users); pass `hasNextPage` instead for a storage listing where
 * a total count isn't available (the media library).
 *
 * `pageParam` lets more than one independent paginated list share a page —
 * pass the current `searchParams` so the *other* list's page isn't lost,
 * and pass `hash` to keep the browser scrolled to that section.
 */
export function Pagination({
  page,
  basePath,
  pageSize,
  totalCount,
  hasNextPage,
  pageParam = "page",
  searchParams,
  hash,
}) {
  const totalPages = totalCount != null ? Math.max(1, Math.ceil(totalCount / pageSize)) : null;
  const hasPrev = page > 1;
  const hasNext = totalPages != null ? page < totalPages : Boolean(hasNextPage);

  if (!hasPrev && !hasNext) return null;

  return (
    <div className="flex items-center justify-between pt-2 text-sm text-ink-faint">
      <span>
        {totalPages != null ? `Page ${page} of ${totalPages} · ${totalCount} total` : `Page ${page}`}
      </span>
      <div className="flex gap-2">
        <PageLink
          href={buildHref(basePath, searchParams, pageParam, page - 1, hash)}
          enabled={hasPrev}
        >
          Previous
        </PageLink>
        <PageLink
          href={buildHref(basePath, searchParams, pageParam, page + 1, hash)}
          enabled={hasNext}
        >
          Next
        </PageLink>
      </div>
    </div>
  );
}
