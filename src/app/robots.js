const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eng-ciabo-family.example";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
