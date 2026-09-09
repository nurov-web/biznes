"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, LoaderCircle, Plus, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import type { MarketBrief, MarketSkuHint } from "@/types";

type Props = {
  city: string;
  type: string;
  goal?: string;
  products?: Array<{ category: string; brand: string; model: string }>;
  onApply?: (sku: MarketSkuHint) => void;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export function MarketScanCard({ city, type, goal, products, onApply }: Props) {
  const t = useTranslations("scan");
  const locale = useLocale();
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);

  function load() {
    if (!city.trim()) return;
    setLoading(true);
    fetch("/api/market/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        city,
        type,
        goal,
        products: products?.slice(0, 8),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { brief?: MarketBrief } | null) => {
        if (data?.brief) setBrief(data.brief);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, type, locale, goal]);

  const climateLabel =
    brief?.climate === "good" ? t("climateGood") : brief?.climate === "hard" ? t("climateHard") : t("climateMixed");
  const climateClass =
    brief?.climate === "good"
      ? "text-success bg-[#e7f6ee]"
      : brief?.climate === "hard"
        ? "text-destructive bg-[#fdeceb]"
        : "text-warning bg-[#fef4e6]";

  return (
    <Reveal className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icon icon={Globe} className="h-4 w-4 text-primary" />
            {t("title")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("lead")}</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={load} disabled={loading}>
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          )}
          {loading ? t("loading") : t("refresh")}
        </button>
      </header>

      {!brief && loading ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground sm:px-5">
          <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
          {t("loading")}
        </p>
      ) : null}

      {brief ? (
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${climateClass}`}>{climateLabel}</span>
            <span className="text-xs text-muted-foreground">
              {brief.usedWeb ? t("webOn") : brief.usedAi ? t("aiOn") : t("local")}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{brief.summary}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{t("demand")}: </span>
            {brief.demand}
          </p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("products")}</p>
            <ul className="mt-2 space-y-2">
              {brief.prices.map((sku) => (
                <li key={sku.name} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{sku.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{sku.category}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        sku.verdict === "good"
                          ? "bg-[#e7f6ee] text-success"
                          : sku.verdict === "avoid"
                            ? "bg-[#fdeceb] text-destructive"
                            : "bg-[#fef4e6] text-warning"
                      }`}
                    >
                      {t(sku.verdict)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sku.why}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="num text-xs">
                      {t("cost")} {money(sku.typicalBuy)} · {t("sell")} {money(sku.typicalSell)}
                    </p>
                    {onApply && sku.verdict !== "avoid" ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          onApply(sku);
                          setApplied(sku.name);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {applied === sku.name ? t("applied") : t("apply")}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon icon={ShieldAlert} className="h-3.5 w-3.5" />
                {t("risks")}
              </p>
              <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted-foreground">
                {brief.risks.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon icon={TrendingUp} className="h-3.5 w-3.5" />
                {t("opportunities")}
              </p>
              <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted-foreground">
                {brief.opportunities.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{brief.disclaimer}</p>
        </div>
      ) : null}
    </Reveal>
  );
}
