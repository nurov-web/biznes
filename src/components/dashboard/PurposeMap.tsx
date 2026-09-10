"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Banknote, LayoutDashboard, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Харитаи оддӣ: фурӯш куҷо меравад. */
export function PurposeMap({ salesCount }: { salesCount: number }) {
  const t = useTranslations("purpose");
  return (
    <section className="card-raised border-primary/25 p-4 sm:p-6">
      <p className="eyebrow text-primary">{t("kicker")}</p>
      <h2 className="display-3 mt-1">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>
      <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <li className="rounded-xl border border-border bg-muted/40 px-3 py-3">
          <Package className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("stock")}</p>
        </li>
        <li className="rounded-xl border border-border bg-muted/40 px-3 py-3">
          <Banknote className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("sale")}</p>
        </li>
        <li className="rounded-xl border border-border bg-muted/40 px-3 py-3">
          <LayoutDashboard className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 font-medium">{t("report")}</p>
        </li>
      </ol>
      <p className="mt-4 text-sm leading-relaxed">
        {salesCount > 0 ? t("hasSales", { count: salesCount }) : t("noSales")}
      </p>
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
