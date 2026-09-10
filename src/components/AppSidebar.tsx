"use client";

import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Compass,
  Contact,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

type Item = { href: string; key: string; icon: LucideIcon };

const MAIN: Item[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/pos", key: "pos", icon: Banknote },
  { href: "/inventory", key: "inventory", icon: Package },
  { href: "/finance", key: "finance", icon: Wallet },
  { href: "/crm", key: "crm", icon: Contact },
  { href: "/store", key: "store", icon: Store },
  { href: "/settings", key: "settings", icon: Settings },
];

const MOBILE: Item[] = MAIN.slice(0, 5);

function isActive(pathname: string, href: string): boolean {
  if (href === "/crm") return pathname === "/crm" || pathname.startsWith("/crm/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 py-4 text-sm font-semibold tracking-tight"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-on-primary">
          <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        {APP_NAME}
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
        {MAIN.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {t(item.key as "dashboard")}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/profile"
        className={`mx-3 mb-4 mt-auto flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
          isActive(pathname, "/profile")
            ? "bg-primary text-on-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        {t("profile")}
      </Link>
    </aside>
  );
}

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const index = MOBILE.findIndex((item) => isActive(pathname, item.href));
  const width = 100 / MOBILE.length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="relative">
        <span
          className="pointer-events-none absolute top-0 h-0.5 rounded-full bg-primary"
          style={{
            width: `${width}%`,
            transform: `translateX(${Math.max(index, 0) * 100}%)`,
            opacity: index < 0 ? 0 : 1,
          }}
          aria-hidden
        />
        <ul className="grid grid-cols-5">
          {MOBILE.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] leading-tight ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  <span className="max-w-full truncate px-0.5 text-center">
                    {t(item.key as "dashboard")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
