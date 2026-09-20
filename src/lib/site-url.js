/**
 * The site's public origin, for canonical links, the sitemap, and share
 * images. Set NEXT_PUBLIC_SITE_URL for a custom domain; otherwise on Vercel
 * it falls back to the project's production domain, so a redeployed copy
 * works with no extra configuration.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
