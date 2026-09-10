"use client";

import { useTranslations } from "next-intl";
import { BarChart3, MessageCircle, PackagePlus, ShoppingBag, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { money } from "@/hooks/useIntelligence";
import { parseLocale } from "@/lib/locale-query";
import { buildSellCoach } from "@/services/coach/sell-coach";

type Props = {
  locale: string;
  storedNiche?: string;
  focus?: string;
  prices: { sku: string }[];
  inventory: { sku: string; status: "ok" | "low" | "dead" | "over" }[];
  salesCount: number;
  revenue: number;
  profit: number;
};

/** Пас аз интихоби мол: чӣ гӯем, чӣ кунем, ҳисоботи оддӣ. */
export function SellCoachCard({
  locale,
  storedNiche,
  focus,
  prices,
  inventory,
  salesCount,
  revenue,
  profit,
}: Props) {
  const t = useTranslations("coach");
  const view = buildSellCoach({
    locale: parseLocale(locale),
    storedNiche,
    focus,
    prices,
    inventory,
  });

  return (
    <section className="card-raised overflow-hidden border-primary/25">
      <div className="border-b border-border bg-primary-soft/50 px-4 py-5 sm:px-6">
        <p className="eyebrow text-primary">{t("kicker")}</p>
        <h2 className="display-3 mt-1">{t("title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>
        {view.hasProducts ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="chip text-xs">
              {t("niche")}: {view.nicheName}
            </span>
            {view.productNames.map((name, i) => (
              <span key={`${name}-${i}`} className="chip bg-background text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {view.hasProducts ? (
        <>
          <div className="grid lg:grid-cols-3">
            <CoachColumn
              icon={MessageCircle}
              title={t("talkTitle")}
              items={view.talk}
              border
            />
            <CoachColumn icon={ShoppingBag} title={t("sellTitle")} items={view.sell} border />
            <article className="p-4 sm:p-6">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                {t("reportTitle")}
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                {salesCount > 0
                  ? t("reportSales", {
                      count: salesCount,
                      revenue: money(revenue),
                      profit: money(profit),
                    })
                  : t("reportNoSales")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("reportStock", { count: prices.length })}
                {view.lowSkus.length
                  ? ` ${t("reportLow", { items: view.lowSkus.join(", ") })}`
                  : ` ${t("reportLowNone")}`}
              </p>
            </article>
          </div>
          <div className="flex flex-col gap-2 border-t border-border p-4 sm:flex-row sm:p-5">
            <Link href="/pos" className="btn btn-primary min-h-12 flex-1">
              {t("toPos")}
            </Link>
            <Link href="/crm/clients" className="btn btn-ghost min-h-12 flex-1">
              <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {t("toClients")}
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <p className="flex-1 text-sm leading-relaxed">{t("noProducts")}</p>
          <Link href="/inventory" className="btn btn-primary min-h-12 shrink-0">
            <PackagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("toInventory")}
          </Link>
        </div>
      )}
    </section>
  );
}

function CoachColumn({
  icon: Glyph,
  title,
  items,
  border,
}: {
  icon: typeof MessageCircle;
  title: string;
  items: readonly string[];
  border?: boolean;
}) {
  return (
    <article
      className={`p-4 sm:p-6 ${border ? "border-b border-border lg:border-b-0 lg:border-r" : ""}`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Glyph className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
        {title}
      </p>
      <ol className="mt-3 space-y-3">
        {items.map((line, i) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed">
            <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
