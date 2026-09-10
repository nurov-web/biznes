"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, CircleCheck, Package, TrendingDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { money } from "@/hooks/useIntelligence";
import { buildRescue } from "@/services/coach/rescue";

type Props = {
  prices: { sku: string; trueCost: number; currentSell: number; marginPct: number }[];
  inventory: { sku: string; quantity: number; status: "ok" | "low" | "dead" | "over" }[];
  salesCount: number;
  profit: number;
  marginPct: number;
};

/** Ташхиси бизнес: гарон, арзон, хатар — ҳатто агар AI хомӯш бошад. */
export function RescueBoard({ prices, inventory, salesCount, profit, marginPct }: Props) {
  const t = useTranslations("rescue");
  const view = buildRescue({ prices, inventory, salesCount, profit, marginPct });
  const toneClass =
    view.tone === "danger"
      ? "border-destructive/30 bg-destructive/5"
      : view.tone === "quiet"
        ? "border-warning/40 bg-warning/10"
        : view.tone === "empty"
          ? "border-primary/25 bg-primary-soft/40"
          : "border-success/30 bg-[#e7f6ee]/50";

  return (
    <section className={`card-raised overflow-hidden ${toneClass}`}>
      <div className="p-4 sm:p-6">
        <p className="eyebrow text-primary">{t("kicker")}</p>
        <h2 className="display-3 mt-1 flex items-center gap-2">
          {view.tone === "danger" ? (
            <TrendingDown className="h-5 w-5 text-destructive" strokeWidth={1.75} aria-hidden />
          ) : view.tone === "ok" ? (
            <CircleCheck className="h-5 w-5 text-success" strokeWidth={1.75} aria-hidden />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" strokeWidth={1.75} aria-hidden />
          )}
          {t(`tone_${view.tone}`)}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed">{t(`lead_${view.tone}`)}</p>

        {view.hasProducts ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {view.expensive ? (
              <article className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("expensive")}</p>
                <p className="mt-1 font-medium">{view.expensive.sku}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("pair", {
                    buy: money(view.expensive.buy),
                    sell: money(view.expensive.sell),
                    margin: view.expensive.marginPct,
                  })}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{t("expensiveHint")}</p>
              </article>
            ) : null}
            {view.cheap ? (
              <article className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("cheap")}</p>
                <p className="mt-1 font-medium">{view.cheap.sku}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("pair", {
                    buy: money(view.cheap.buy),
                    sell: money(view.cheap.sell),
                    margin: view.cheap.marginPct,
                  })}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{t("cheapHint")}</p>
              </article>
            ) : null}
          </div>
        ) : null}

        {view.stuck.length ? (
          <p className="mt-4 text-sm leading-relaxed">
            {t("stuck")}: {view.stuck.map((row) => `${row.sku} (${row.quantity})`).join(", ")}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={view.tone === "empty" ? "/inventory" : "/pos"} className="btn btn-primary min-h-12">
            {view.tone === "empty" ? t("toStock") : t("toPos")}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
          <Link href="/inventory" className="btn btn-ghost min-h-12">
            <Package className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("toStock")}
          </Link>
        </div>
      </div>
    </section>
  );
}
