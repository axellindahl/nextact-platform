"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/content", label: "Innehåll" },
  { href: "/admin/users", label: "Användare" },
  { href: "/admin/analytics", label: "Analys" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="border-b border-light-gray/30 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Link
            href="/admin"
            className="mr-4 font-heading text-lg font-bold text-navy"
          >
            Next Act Admin
          </Link>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-charcoal/60 hover:bg-off-white-alt hover:text-charcoal"
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-charcoal/50 transition-colors hover:text-primary"
        >
          Tillbaka till appen
        </Link>
      </div>
    </nav>
  );
}
