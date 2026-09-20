import { getSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/site-url";

// Depends on an admin-editable setting, so it can't be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const { allowIndexing } = await getSiteSettings();
  if (!allowIndexing) return [];

  const lastModified = new Date();
  const routes = ["", "/family-tree"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
