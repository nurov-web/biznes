"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CITIES_TJ } from "@/constants";
import { useRouter } from "@/i18n/navigation";
import { GsapStep } from "@/components/motion/GsapStep";
import { MarketScanCard } from "@/components/market/MarketScanCard";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
import { parseLocale } from "@/lib/locale-query";
import { suggestPlanOption } from "@/services/intelligence/advice";
import type { PlanRow } from "@/lib/store";

const GOAL_CHIP_KEYS = ["cars", "phones", "clothes", "food", "online", "construction"] as const;

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export function NewBusinessFlow({ onBack }: { onBack: () => void }) {
  const t = useTranslations("start");
  const locale = useLocale();
  const router = useRouter();
  const [budget, setBudget] = useState("10000");
  const [city, setCity] = useState<string>(CITIES_TJ[0]);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [hours, setHours] = useState("40");
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [adopting, setAdopting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const bestPlan = plan ? suggestPlanOption(plan.options, plan.budget, parseLocale(locale)) : null;

  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/startup/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          budget: Number(budget) || 0,
          city,
          goal,
          experience,
          hoursPerWeek: Number(hours) || 40,
        }),
      });
      if (!response.ok) {
        setError(t("planFail"));
        return;
      }
      const data = (await response.json()) as { plan: PlanRow };
      setPlan(data.plan);
    } catch {
      setError(t("planFail"));
    } finally {
      setBusy(false);
    }
  }

  async function adopt(index: number) {
    if (!plan) return;
    setAdopting(index);
    try {
      const response = await fetch("/api/startup/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, optionIndex: index }),
      });
      if (!response.ok) {
        setError(t("planFail"));
        return;
      }
      router.push("/dashboard");
    } finally {
      setAdopting(null);
    }
  }

  return (
    <GsapStep step={plan ? 2 : 1}>
      {!plan ? (
        <form onSubmit={generate} className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("newTitle")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("newLead")}</p>
          </div>
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              {t("budget")}
              <input
                className="input-field"
                type="number"
                min={0}
                step={500}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
              <span className="text-xs font-normal text-muted-foreground">{t("budgetHint")}</span>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("city")}
              <select className="input-field" value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES_TJ.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              {t("goal")}
              <textarea
                className="input-field min-h-24"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t("goalHint")}
                maxLength={500}
              />
            </label>
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("goalChips")}
              </p>
              <div className="flex flex-wrap gap-2">
                {GOAL_CHIP_KEYS.map((key) => {
                  const chip = t(`chips.${key}`);
                  return (
                    <button
                      key={key}
                      type="button"
                      className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm transition-colors duration-200 hover:border-primary hover:bg-card"
                      onClick={() => setGoal(chip)}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("experience")}
              <input
                className="input-field"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={t("experienceHint")}
                maxLength={300}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("hours")}
              <input
                className="input-field"
                type="number"
                min={1}
                max={120}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </label>
          </div>
          <MarketScanCard city={city} type="trade" goal={goal} />
          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              {t("back")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t("generating") : t("generate")}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("planTitle")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">{plan.usedAi ? t("aiOn") : t("aiOff")}</p>
          </div>
          <RecommendedNote suggestion={bestPlan} />
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="grid gap-4">
            {plan.options.map((option, i) => (
              <article key={option.name} className={`card p-5 ${bestPlan?.index === i ? "border-primary/40" : ""}`}>
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                      {option.name}
                      {bestPlan?.index === i ? <RecommendedBadge /> : null}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{option.why}</p>
                  </div>
                  <p className="font-mono text-lg font-semibold">{money(option.monthlyProfit)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                </header>
                <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                <button
                  type="button"
                  className="btn btn-primary mt-5"
                  disabled={adopting !== null}
                  onClick={() => void adopt(i)}
                >
                  {adopting === i ? t("choosing") : t("choose")}
                </button>
              </article>
            ))}
          </div>
          <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            {plan.warnings.map((w) => (
              <li key={w}>— {w}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost" onClick={() => setPlan(null)}>
            {t("again")}
          </button>
        </div>
      )}
    </GsapStep>
  );
}
