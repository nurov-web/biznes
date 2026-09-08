"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
import { parseLocale } from "@/lib/locale-query";
import { suggestPlanOption } from "@/services/intelligence/advice";
import type { PlanRow } from "@/lib/store";

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function PlanPage() {
  const t = useTranslations("start");
  const locale = useLocale();
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup/plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { plan: PlanRow | null } | null) => setPlan(data?.plan ?? null))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">…</p>;
  }

  if (!plan) {
    return (
      <PageShell title={t("planPageTitle")} lead={t("planPageLead")}>
        <p className="text-sm text-muted-foreground">{t("noPlan")}</p>
      </PageShell>
    );
  }

  const best = suggestPlanOption(plan.options, plan.budget, parseLocale(locale));

  return (
    <PageShell title={t("planPageTitle")} lead={plan.summary}>
      <p className="text-xs text-muted-foreground">{plan.usedAi ? t("aiOn") : t("aiOff")}</p>
      <RecommendedNote suggestion={best} />
      <div className="grid gap-4">
        {plan.options.map((option, i) => (
          <article key={option.name} className={`card-raised p-5 ${best?.index === i ? "border-primary/40" : ""}`}>
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                  {option.name}
                  {best?.index === i ? <RecommendedBadge /> : null}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{option.why}</p>
              </div>
              <p className="font-mono text-lg font-semibold">
                {money(option.monthlyProfit)}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
            </header>
            <dl className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                { k: t("startupCost"), v: money(option.startupCost) },
                { k: t("monthlyRevenue"), v: money(option.monthlyRevenue) },
                { k: t("monthlyProfit"), v: money(option.monthlyProfit) },
                {
                  k: t("breakEven"),
                  v: option.breakEvenMonths > 0 ? `${option.breakEvenMonths} ${t("months")}` : "—",
                },
              ].map((cell) => (
                <div key={cell.k} className="rounded-xl bg-muted/60 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{cell.k}</dt>
                  <dd className="mt-0.5 font-mono text-sm font-semibold">{cell.v}</dd>
                </div>
              ))}
            </dl>
            {option.products.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="table-intel">
                  <thead>
                    <tr>
                      <th>{t("product")}</th>
                      <th>{t("supplier")}</th>
                      <th>{t("buy")}</th>
                      <th>{t("sell")}</th>
                      <th>{t("qty")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {option.products.map((p) => (
                      <tr key={p.name}>
                        <td>{p.name}</td>
                        <td className="text-muted-foreground">{p.supplier}</td>
                        <td className="font-mono">{money(p.buyPrice)}</td>
                        <td className="font-mono">{money(p.sellPrice)}</td>
                        <td className="font-mono">{p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("risk")}</p>
                <p className="mt-1 text-sm leading-relaxed">{option.risk}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("steps")}</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
                  {option.firstSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </article>
        ))}
      </div>
      <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        {plan.warnings.map((w) => (
          <li key={w}>— {w}</li>
        ))}
      </ul>
    </PageShell>
  );
}
