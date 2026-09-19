const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lao-ciabo-family.example";

export default function sitemap() {
  const lastModified = new Date();
  const routes = ["", "/family-tree"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
