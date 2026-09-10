"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  { href: "/crm", key: "tabOverview" as const, exact: true },
  { href: "/crm/clients", key: "tabClients" as const, exact: false },
  { href: "/crm/sales", key: "tabSales" as const, exact: false },
];

/** Се ҷадвали оддӣ: шарҳ, мизоҷон, фурӯш. */
export function CrmTabs() {
  const t = useTranslations("crm");
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl border border-border bg-muted/60 p-1" aria-label={t("clients")}>
      {TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
              active ? "bg-background text-foreground shadow-[var(--shadow-xs)]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
