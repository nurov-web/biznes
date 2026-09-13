"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Bot,
  Boxes,
  CheckSquare,
  ChevronDown,
  Database,
  Ellipsis,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Package,
  Percent,
  Plug,
  Rocket,
  Settings,
  Store,
  Swords,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { APP_NAME } from "@/constants";

type Item = { href: string; key: string; icon: LucideIcon };

const dashItem: Item = { href: "/dashboard", key: "dashboard", icon: LayoutDashboard };
const posItem: Item = { href: "/pos", key: "pos", icon: Banknote };
const inventoryItem: Item = { href: "/inventory", key: "inventory", icon: Package };
const financeItem: Item = { href: "/finance", key: "finance", icon: Wallet };
const clientsItem: Item = { href: "/crm", key: "clients", icon: Users };
const storeItem: Item = { href: "/store", key: "store", icon: Store };
const settingsItem: Item = { href: "/settings", key: "settings", icon: Settings };

/** 7 кори рӯз — бе гурӯҳҳои зиёд. */
const MAIN: Item[] = [dashItem, posItem, inventoryItem, financeItem, clientsItem, storeItem];

const MORE: Item[] = [
  { href: "/learn", key: "learn", icon: GraduationCap },
  { href: "/plan", key: "plan", icon: Rocket },
  { href: "/data", key: "data", icon: Database },
  { href: "/market", key: "market", icon: Boxes },
  { href: "/competitors", key: "competitors", icon: Swords },
  { href: "/pricing", key: "pricing", icon: Percent },
  { href: "/simulator", key: "simulator", icon: FlaskConical },
  { href: "/actions", key: "actions", icon: Zap },
  { href: "/agents", key: "agents", icon: Bot },
  { href: "/tasks", key: "tasks", icon: CheckSquare },
  { href: "/integrations", key: "integrations", icon: Plug },
];

const MOBILE: Item[] = [dashItem, posItem, inventoryItem, financeItem, clientsItem];

function isActive(pathname: string, href: string): boolean {
  if (href === "/crm") return pathname === "/crm" || pathname.startsWith("/crm/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function moreContains(pathname: string): boolean {
  return MORE.some((item) => isActive(pathname, item.href));
}

function NavLink({ item, pathname, nested }: { item: Item; pathname: string; nested?: boolean }) {
  const t = useTranslations("nav");
  const th = useTranslations("navHints");
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      title={th(item.key as "dashboard")}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm ${
        nested ? "pl-3" : ""
      } ${
        active
          ? "bg-primary-soft font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      {t(item.key as "dashboard")}
    </Link>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const th = useTranslations("navHints");
  const pathname = usePathname();
  const onMore = moreContains(pathname);
  const [open, setOpen] = useState(onMore);

  useEffect(() => {
    if (onMore) setOpen(true);
  }, [onMore]);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 py-4 text-sm font-semibold tracking-tight"
      >
        <BrandMark size={32} />
        {APP_NAME}
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
        {MAIN.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex items-center gap-2.5">
              <Ellipsis className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {t("moreGroup")}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
          {open ? (
            <div className="mt-0.5 flex flex-col gap-0.5">
              {MORE.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} nested />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <NavLink item={settingsItem} pathname={pathname} />
        </div>
      </nav>
      <Link
        href="/profile"
        title={th("profile")}
        className={`mx-3 mb-4 flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm ${
          isActive(pathname, "/profile")
            ? "bg-primary-soft font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        {t("profile")}
      </Link>
    </aside>
  );
}

export function MobileNav() {
  const t = useTranslations("nav");
  const th = useTranslations("navHints");
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
                  title={th(item.key as "dashboard")}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[10px] leading-tight ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
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
