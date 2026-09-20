import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme/theme-script";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSiteSettings } from "@/lib/site-settings";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata() {
  const s = await getSiteSettings();
  const images = s.ogImageUrl ? [s.ogImageUrl] : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.homeTitle,
      template: `%s – ${s.siteName}`,
    },
    description: s.description,
    keywords: s.keywords,
    authors: [{ name: s.ownerName }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: s.siteName,
      title: s.homeTitle,
      description: s.description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: s.homeTitle,
      description: s.description,
      images,
    },
    robots: {
      index: s.allowIndexing,
      follow: s.allowIndexing,
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({ children }) {
  const s = await getSiteSettings();

  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <SiteHeader brand={s.brand} />
        <main className="flex-1">{children}</main>
        <SiteFooter ownerName={s.ownerName} />
      </body>
    </html>
  );
}
