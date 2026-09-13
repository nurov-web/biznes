"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Banknote, LayoutDashboard, LogOut, Package, Store, Users, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";

const BUTTONS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/inventory", key: "inventory", icon: Package },
  { href: "/pos", key: "pos", icon: Banknote },
  { href: "/finance", key: "finance", icon: Wallet },
  { href: "/crm", key: "clients", icon: Users },
  { href: "/store", key: "store", icon: Store },
] as const;

/** Қадами сайт ва тугмаҳои панел — бо забони оддӣ. */
export function PurposeMap({ salesCount }: { salesCount: number }) {
  const t = useTranslations("purpose");

  return (
    <section className="card-raised p-4 sm:p-6">
      <p className="eyebrow">{t("kicker")}</p>
      <h2 className="display-3 mt-1">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>

      <ol className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
        <li className="border border-border px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("step")} 1</p>
          <Package className="mt-2 h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("stock")}</p>
          <p className="mt-1 text-muted-foreground">{t("stockD")}</p>
        </li>
        <li className="border border-border px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("step")} 2</p>
          <Banknote className="mt-2 h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("sale")}</p>
          <p className="mt-1 text-muted-foreground">{t("saleD")}</p>
        </li>
        <li className="border border-border px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("step")} 3</p>
          <LayoutDashboard className="mt-2 h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("report")}</p>
          <p className="mt-1 text-muted-foreground">{t("reportD")}</p>
        </li>
      </ol>

      <p className="mt-4 text-sm leading-relaxed">
        {salesCount > 0 ? t("hasSales", { count: salesCount }) : t("noSales")}
      </p>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("buttonsTitle")}</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {BUTTONS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              title={t(`hint_${item.key}`)}
              className="flex min-h-12 items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm hover:bg-muted"
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <span>
                <span className="font-medium">{t(`btn_${item.key}`)}</span>
                <span className="mt-0.5 block text-muted-foreground">{t(`hint_${item.key}`)}</span>
              </span>
            </Link>
          </li>
        ))}
        <li className="flex min-h-12 items-start gap-3 rounded-xl border border-border px-3 py-3 text-sm">
          <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="font-medium">{t("btn_logout")}</span>
            <span className="mt-0.5 block text-muted-foreground">{t("hint_logout")}</span>
          </span>
        </li>
      </ul>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link href="/pos" className="btn btn-primary min-h-12">
          {t("toPos")}
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
        <Link href="/inventory" className="btn btn-ghost min-h-12">
          {t("toStock")}
        </Link>
        <Link href="/finance" className="btn btn-ghost min-h-12">
          {t("toCash")}
        </Link>
      </div>
    </section>
  );
}
