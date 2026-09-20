"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", roles: ["admin", "manager"] },
  { href: "/admin/members", label: "Members", roles: ["admin", "manager"] },
  { href: "/admin/announcements", label: "Announcements", roles: ["admin", "manager"] },
  { href: "/admin/media", label: "Media", roles: ["admin", "manager"] },
  { href: "/admin/users", label: "Users & Roles", roles: ["admin"] },
  { href: "/admin/config", label: "Config", roles: ["admin"] },
];

export function AdminNav({ role }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.filter((link) => link.roles.includes(role)).map((link) => {
        const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-panel text-accent" : "text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
