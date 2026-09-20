import { getSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/site-url";

// Reads a setting an admin can change, so it can't be prerendered at build time.
export const dynamic = "force-dynamic";

export default async function robots() {
  const { allowIndexing } = await getSiteSettings();

  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
