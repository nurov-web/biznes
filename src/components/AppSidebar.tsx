"use client";

import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Boxes,
  CheckSquare,
  Compass,
  Contact,
  Database,
  FlaskConical,
  LayoutDashboard,
  Package,
  Percent,
  Plug,
  Rocket,
  Settings,
  Swords,
  UserRound,
  Users,
  Wallet,
  Workflow,
  Zap,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

type Item = { href: string; key: string; icon: LucideIcon };

const INTEL: Item[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/plan", key: "plan", icon: Rocket },
  { href: "/data", key: "data", icon: Database },
  { href: "/market", key: "market", icon: Boxes },
  { href: "/competitors", key: "competitors", icon: Swords },
  { href: "/pricing", key: "pricing", icon: Percent },
  { href: "/simulator", key: "simulator", icon: FlaskConical },
  { href: "/actions", key: "actions", icon: Zap },
  { href: "/agents", key: "agents", icon: Bot },
];

const CRM: Item[] = [
  { href: "/crm", key: "crmOverview", icon: Contact },
  { href: "/crm/clients", key: "clients", icon: Users },
  { href: "/crm/sales", key: "sales", icon: Workflow },
];

const OPS: Item[] = [
  { href: "/inventory", key: "inventory", icon: Package },
  { href: "/finance", key: "finance", icon: Wallet },
  { href: "/tasks", key: "tasks", icon: CheckSquare },
  { href: "/integrations", key: "integrations", icon: Plug },
  { href: "/settings", key: "settings", icon: Settings },
];

const MOBILE: Item[] = [INTEL[0], CRM[0], INTEL[5], INTEL[6], OPS[0]];

function isActive(pathname: string, href: string): boolean {
  if (href === "/crm") return pathname === "/crm";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ items, pathname }: { items: Item[]; pathname: string }) {
  const t = useTranslations("nav");
  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              active
                ? "bg-primary text-on-primary shadow-[var(--shadow-xs)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon
              className={`h-4 w-4 transition-transform duration-200 ${
                active ? "" : "group-hover:scale-110"
              }`}
              strokeWidth={1.75}
              aria-hidden
            />
            {t(item.key as "dashboard")}
          </Link>
        );
      })}
    </>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const groups: { label: string; items: Item[] }[] = [
    { label: t("intelGroup"), items: INTEL },
    { label: "CRM", items: CRM },
    { label: t("opsGroup"), items: OPS },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 py-4 text-sm font-semibold tracking-tight"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-on-primary">
          <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        {APP_NAME}
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
        {groups.map((group, i) => (
          <div key={group.label} className={i > 0 ? "mt-5" : ""}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              <NavList items={group.items} pathname={pathname} />
            </div>
          </div>
        ))}
      </nav>
      <Link
        href="/profile"
        className={`mx-3 mb-4 mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
          isActive(pathname, "/profile")
            ? "bg-primary text-on-primary shadow-[var(--shadow-xs)]"
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
          className="pointer-events-none absolute top-0 h-0.5 rounded-full bg-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                  className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] leading-tight transition-colors duration-200 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? "-translate-y-0.5 scale-110" : ""
                    }`}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="max-w-full truncate px-0.5 text-center">{t(item.key as "dashboard")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
