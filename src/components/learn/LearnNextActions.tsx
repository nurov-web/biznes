"use client";

import { Package, Users, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";

/** Пас аз ташхис — се амали воқеӣ дар CRM, анбор, молия. */
export function LearnNextActions() {
  const t = useTranslations("learn");
  const items = [
    { href: "/crm/clients", icon: Users, label: t("actCrm"), lead: t("actCrmLead") },
    { href: "/inventory", icon: Package, label: t("actStock"), lead: t("actStockLead") },
    { href: "/finance", icon: Wallet, label: t("actCash"), lead: t("actCashLead") },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="card-raised flex min-h-12 flex-col gap-2 p-4 transition-colors duration-200 hover:bg-muted/40"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Icon icon={item.icon} className="h-4 w-4 text-primary" />
            {item.label}
          </span>
          <span className="text-sm leading-relaxed text-muted-foreground">{item.lead}</span>
        </Link>
      ))}
    </section>
  );
}
