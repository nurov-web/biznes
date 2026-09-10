"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ClipboardCheck, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";
import { RecommendedNote } from "@/components/ui/Recommended";
import { SalesChart } from "@/components/SalesChart";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { StoreGapBanner } from "@/components/dashboard/StoreGapBanner";
import { EphemeralStoreBanner } from "@/components/dashboard/EphemeralStoreBanner";
import { StoreConnectCard } from "@/components/store/StoreConnectCard";
import { LearnHero } from "@/components/learn/LearnHero";
import { healthTone, money, useIntelligence } from "@/hooks/useIntelligence";
import { parseLocale } from "@/lib/locale-query";
import { suggestNextMove } from "@/services/intelligence/advice";

type Week = { day: string; value: number }[];

export default function DashboardPage() {
  const t = useTranslations("intel");
  const { data, loading, error, reload, locale } = useIntelligence();
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState("");
  const [week, setWeek] = useState<Week>([]);
  const [ephemeral, setEphemeral] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { week?: Week; ephemeralStore?: boolean } | null) => {
        setWeek(d?.week ?? []);
        setEphemeral(Boolean(d?.ephemeralStore));
      })
      .catch(() => undefined);
  }, []);

  async function decide() {
    setBusy(true);
    try {
      const response = await fetch("/api/intelligence/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const json = (await response.json()) as { narrative?: string };
      setDecision(json.narrative || "");
      await reload();
    } finally {
      setBusy(false);
    }
  }

  if (loading || error || !data) {
    return (
      <p className="p-8 text-sm text-muted-foreground" role={error ? "alert" : undefined}>
        {error ? t("error") : t("loading")}
      </p>
    );
  }

  const questions = [
    { k: t("happened"), v: data.happened },
    { k: t("why"), v: data.why },
    { k: t("will"), v: data.willHappen },
    { k: t("should"), v: data.shouldDo },
  ];

  const cards = questions.map((q) => (
    <article key={q.k} className="card-raised min-h-[9.5rem] min-w-0 p-4 sm:p-6">
      <p className="eyebrow text-primary">{q.k}</p>
      <p className="mt-2.5 text-sm leading-relaxed">{q.v}</p>
    </article>
  ));

  const nextMove = suggestNextMove(
    {
      prices: data.prices,
      inventory: data.inventory,
      actions: data.actions,
      marginPct: data.marginPct,
      cashFlow: data.cashFlow,
      healthScore: data.healthScore,
      hasCompetitorPrices: data.competitorRows.some((c) => c.price > 0),
    },
    parseLocale(locale),
  );

  return (
    <PageShell
      title={t("dashTitle")}
      lead={`${data.businessName} · ${data.city}`}
      action={
        <button type="button" className="btn btn-primary" onClick={() => void decide()} disabled={busy}>
          <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {busy ? t("running") : t("decide")}
        </button>
      }
    >
      <StoreConnectCard />
      <EphemeralStoreBanner show={ephemeral} />
      <LearnHero />
      <StoreGapBanner salesCount={data.salesCount} />

      <SetupChecklist
        hasProducts={data.prices.length > 0}
        hasSales={data.salesCount > 0}
        hasCompetitors={data.competitorRows.some((c) => c.price > 0)}
      />

      <RecommendedNote suggestion={nextMove} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <article className="card-raised col-span-2 p-5 lg:col-span-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("health")}</p>
          <p className={`num mt-2 text-3xl font-semibold sm:text-4xl ${healthTone(data.healthScore)}`}>
            {data.healthScore}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700"
              style={{ width: `${data.healthScore}%` }}
            />
          </div>
        </article>
        {data.kpis
          .filter((k) => k.key !== "health")
          .slice(0, 4)
          .map((k) => (
            <article key={k.key} className="card-raised min-w-0 p-4 sm:p-5">
              <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className="num mt-2 text-xl font-semibold sm:text-2xl">
                {k.value.toLocaleString("ru-RU")}
                <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">{k.unit}</span>
              </p>
            </article>
          ))}
      </section>

      <Reveal>
        <div className="md:hidden">
          <Slider
            items={cards}
            label={t("dashTitle")}
            prevLabel={t("prev")}
            nextLabel={t("next")}
            autoPlayMs={7000}
          />
        </div>
        <div className="hidden gap-3 md:grid md:grid-cols-2">{cards}</div>
      </Reveal>

      {decision ? (
        <article className="card-raised border-primary/30 p-4 sm:p-6">
          <p className="eyebrow text-primary">{t("pipeline")}</p>
          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed">{decision}</p>
        </article>
      ) : null}

      {week.length ? <SalesChart points={week} label={t("week")} /> : null}

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="card-raised p-4 sm:p-6">
          <h2 className="display-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" strokeWidth={1.75} aria-hidden />
            {t("alerts")}
          </h2>
          <ul className="mt-4 space-y-3">
            {data.alerts.length === 0 ? (
              <li className="text-sm text-muted-foreground">{t("noAlerts")}</li>
            ) : (
              data.alerts.map((a) => (
                <li key={a.title} className="rounded-xl border border-border px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        <span className={a.kind === "problem" ? "text-destructive" : "text-success"}>
                          {a.kind === "problem" ? t("problem") : t("opportunity")}
                        </span>
                        {" · "}
                        {a.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
                    </div>
                    <p className="num shrink-0 text-sm">{money(a.impactMonthly)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </article>
        <article className="card-raised p-4 sm:p-6">
          <h2 className="display-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
            {t("memory")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {data.memory.length === 0 ? (
              <li className="text-muted-foreground">{t("noMemory")}</li>
            ) : (
              data.memory.slice(0, 8).map((m) => (
                <li key={m.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate">{m.title}</span>
                  <span className="num shrink-0 text-xs text-muted-foreground">
                    {m.createdAt.slice(0, 10)}
                  </span>
                </li>
              ))
            )}
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            {t("quality")}: <span className="num">{data.dataQuality}%</span> · CSV:{" "}
            <span className="num">{data.salesCount}</span>
          </p>
        </article>
      </section>
      <p className="text-xs leading-relaxed text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
