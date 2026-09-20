import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }) {
  const profile = await requireRole("admin", "manager");
  const { brand } = await getSiteSettings();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row">
      <aside className="glass flex h-fit flex-col gap-6 rounded-3xl p-5 lg:w-64 lg:shrink-0">
        <div className="flex flex-col gap-1 px-2">
          <Link href="/" className="text-sm font-semibold text-ink">
            {brand.first} &#10022; {brand.second}
          </Link>
          <span className="text-xs text-ink-faint">{profile.email}</span>
          <span className="w-fit rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            {profile.role}
          </span>
        </div>
        <AdminNav role={profile.role} />
        <SignOutButton />
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
