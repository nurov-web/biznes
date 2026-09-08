"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
import { money, useIntelligence } from "@/hooks/useIntelligence";
import { parseLocale } from "@/lib/locale-query";
import { suggestPrice } from "@/services/intelligence/advice";

export default function PricingPage() {
  const t = useTranslations("intel");
  const { data, loading, error, locale } = useIntelligence();
  const [open, setOpen] = useState<string | null>(null);

  if (loading || error || !data) {
    return <p className="p-8 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  const tip = suggestPrice(data.prices, parseLocale(locale));

  return (
    <PageShell title={t("priceTitle")} lead={t("priceLead")}>
      <RecommendedNote suggestion={tip} />
      <div className="card-raised overflow-x-auto">
        <table className="table-intel">
          <thead>
            <tr>
              <th>SKU</th>
              <th>{t("trueCost")}</th>
              <th>{t("current")}</th>
              <th>{t("compPrice")}</th>
              <th>{t("recommended")}</th>
              <th>{t("margin")}</th>
              <th>{t("impact")}</th>
            </tr>
          </thead>
          <tbody>
            {data.prices.map((p, i) => (
              <tr key={p.sku} className={tip?.index === i ? "bg-primary-soft/40" : undefined}>
                <td>
                  <button
                    type="button"
                    className="flex flex-wrap items-center gap-2 text-left font-medium"
                    onClick={() => setOpen(open === p.sku ? null : p.sku)}
                  >
                    {p.sku}
                    {tip?.index === i ? <RecommendedBadge /> : null}
                  </button>
                  {open === p.sku ? (
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">{p.why}</p>
                  ) : null}
                </td>
                <td className="num">{money(p.trueCost)}</td>
                <td className="num">{money(p.currentSell)}</td>
                <td className="num">{p.competitorPrice ? money(p.competitorPrice) : "—"}</td>
                <td className="num font-semibold">{money(p.recommended)}</td>
                <td className="num">{p.marginPct}%</td>
                <td className="num">{money(p.monthlyImpact)}</td>
              </tr>
            ))}
            {data.prices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-sm text-muted-foreground">
                  {t("noSku")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t("whyHint")}</p>
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
