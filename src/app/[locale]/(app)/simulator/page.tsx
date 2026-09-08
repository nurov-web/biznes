"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { money, useIntelligence } from "@/hooks/useIntelligence";
import { parseLocale } from "@/lib/locale-query";
import { suggestCrash } from "@/services/intelligence/advice";

type SimOut = {
  revenue: number;
  profit: number;
  cashFlow: number;
  note: string;
  survivalScore?: number;
  defense?: string[];
};

const PRESETS = [
  "sales_down",
  "costs_up",
  "supplier_up",
  "competitor_down",
  "demand_down",
  "fx",
  "supply",
] as const;

export default function SimulatorPage() {
  const t = useTranslations("intel");
  const ta = useTranslations("advice");
  const { data, loading, error, locale } = useIntelligence();
  const [price, setPrice] = useState(0);
  const [volume, setVolume] = useState(0);
  const [marketing, setMarketing] = useState(0);
  const [sim, setSim] = useState<SimOut | null>(null);
  const [crash, setCrash] = useState<SimOut | null>(null);
  const [busy, setBusy] = useState(false);

  async function runSim(save = false) {
    setBusy(true);
    try {
      const response = await fetch("/api/intelligence/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          save,
          priceDeltaPct: price,
          volumeDeltaPct: volume,
          marketingSpend: marketing,
        }),
      });
      const json = (await response.json()) as { sim: SimOut };
      setSim(json.sim);
    } finally {
      setBusy(false);
    }
  }

  async function runCrash(preset: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/intelligence/crash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, preset }),
      });
      const json = (await response.json()) as { result: SimOut };
      setCrash(json.result);
    } finally {
      setBusy(false);
    }
  }

  if (loading || error || !data) {
    return <p className="p-8 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  const advice = suggestCrash(
    {
      marginPct: data.marginPct,
      hasCompetitorPrices: data.competitorRows.some((c) => c.price > 0),
      deadStock: data.inventory.filter((i) => i.status === "dead").length,
      cashFlow: data.cashFlow,
    },
    parseLocale(locale),
  );

  return (
    <PageShell title={t("simTitle")} lead={t("simLead")}>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-raised space-y-4 p-6">
          <h2 className="display-3">{t("whatIf")}</h2>
          <label className="block text-sm font-medium">
            {t("priceDelta")}: <span className="num">{price}%</span>
            <input
              className="mt-2 w-full accent-[color:var(--primary)]"
              type="range"
              min={-30}
              max={30}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium">
            {t("volDelta")}: <span className="num">{volume}%</span>
            <input
              className="mt-2 w-full accent-[color:var(--primary)]"
              type="range"
              min={-40}
              max={40}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium">
            {t("marketing")}
            <input
              className="input-field mt-1.5"
              type="number"
              min={0}
              value={marketing}
              onChange={(e) => setMarketing(Number(e.target.value))}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void runSim(false)}>
              {t("runSim")}
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void runSim(true)}>
              {t("saveTwin")}
            </button>
          </div>
          {sim ? (
            <div className="rounded-xl bg-muted p-4 text-sm">
              <p>
                {t("rev")}: <span className="num">{money(sim.revenue)}</span>
              </p>
              <p>
                {t("profit")}: <span className="num">{money(sim.profit)}</span>
              </p>
              <p>
                {t("cash")}: <span className="num">{money(sim.cashFlow)}</span>
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{sim.note}</p>
            </div>
          ) : null}
        </article>

        <article className="card-raised space-y-4 p-6">
          <h2 className="display-3">{t("crashTitle")}</h2>

          <div className="rounded-2xl border border-primary/25 bg-primary-soft/60 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {ta("startWith")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{advice.reason}</p>
            <button
              type="button"
              className="btn btn-sm btn-primary mt-3"
              disabled={busy}
              onClick={() => void runCrash(advice.preset)}
            >
              {t(`crash_${advice.preset}` as "crash_sales_down")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.filter((p) => p !== advice.preset).map((p) => (
              <button
                key={p}
                type="button"
                className="btn btn-sm btn-ghost"
                disabled={busy}
                onClick={() => void runCrash(p)}
              >
                {t(`crash_${p}`)}
              </button>
            ))}
          </div>

          {crash ? (
            <div className="rounded-xl bg-muted p-4 text-sm">
              <p className="num text-lg font-semibold">Survival {crash.survivalScore ?? "—"}/100</p>
              <p className="mt-1">
                {t("profit")}: <span className="num">{money(crash.profit)}</span>
              </p>
              <p className="mt-3 font-medium">{t("defense")}</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 leading-relaxed">
                {(crash.defense || []).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </article>
      </section>
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
