"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { MarketScanCard } from "@/components/market/MarketScanCard";
import { useIntelligence } from "@/hooks/useIntelligence";

export default function MarketPage() {
  const t = useTranslations("intel");
  const { data, loading, error } = useIntelligence();
  if (loading || error || !data) {
    return <p className="p-6 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }
  const cards = [
    { k: t("mSize"), v: data.market.sizeNote },
    { k: t("mDemand"), v: data.market.demand },
    { k: t("mSeason"), v: data.market.season },
    { k: t("mProduct"), v: data.market.productTrend },
    { k: t("mIndustry"), v: data.market.industry },
    { k: t("mCustomer"), v: data.market.customer },
  ];
  return (
    <PageShell title={t("marketTitle")} lead={t("marketLead")}>
      <MarketScanCard city={data.city} type={data.businessType || "trade"} goal={data.focus} />
      <section className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((c) => (
          <article key={c.k} className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{c.k}</p>
            <p className="mt-2 text-sm leading-relaxed">{c.v}</p>
          </article>
        ))}
      </section>
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
