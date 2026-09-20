export const ADMIN_PAGE_SIZE = 20;

/** Parses a `?page=` search param into a safe 1-indexed page number. */
export function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Postgres `.range(from, to)` bounds for a 1-indexed page. */
export function pageRange(page, pageSize = ADMIN_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}
