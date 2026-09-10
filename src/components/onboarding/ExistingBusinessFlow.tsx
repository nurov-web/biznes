"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BUSINESS_TYPES, CITIES_TJ, CHANNELS } from "@/constants";
import { emptyProduct } from "@/constants/catalog";
import { GsapStep } from "@/components/motion/GsapStep";
import { ProductCatalogForm } from "@/components/onboarding/ProductCatalogForm";
import { AiHints } from "@/components/onboarding/AiHints";
import type { ProductDraft } from "@/types";

const STEP_KEYS = ["type", "details", "catalog", "market", "numbers"] as const;
const TOTAL = STEP_KEYS.length;

export function ExistingBusinessFlow({ onBack }: { onBack: () => void }) {
  const t = useTranslations("onboarding");
  const ts = useTranslations("start");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<(typeof BUSINESS_TYPES)[number]>("trade");
  const [typeNote, setTypeNote] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState<string>(CITIES_TJ[0]);
  const [region, setRegion] = useState("");
  const [yearsOpen, setYearsOpen] = useState("1");
  const [employees, setEmployees] = useState("1");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("offline");
  const [competitors, setCompetitors] = useState("");
  const [audience, setAudience] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [products, setProducts] = useState<ProductDraft[]>([emptyProduct()]);

  function canNext(): boolean {
    if (step === 2 && !name.trim()) {
      setError(t("nameRequired"));
      return false;
    }
    setError("");
    return true;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError(t("nameRequired"));
      setStep(2);
      return;
    }
    setBusy(true);
    setError("");
    const controller = new AbortController();
    const watchdog = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          type,
          typeNote,
          city,
          region,
          yearsOpen: Number(yearsOpen),
          employees: Number(employees),
          channel,
          competitors,
          audience,
          monthlyRevenue: Number(monthlyRevenue) || 0,
          monthlyCost: Number(monthlyCost) || 0,
          products: products.filter((p) => p.model.trim() || p.category.trim() || p.brand.trim()),
        }),
      });
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      window.location.assign(`/${locale}/dashboard`);
    } catch {
      setError(t("saveError"));
    } finally {
      window.clearTimeout(watchdog);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="text-sm font-medium text-primary">{t("step", { current: step, total: TOTAL })}</p>
      <h1 className="display-2 mt-1">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("subtitle")}</p>
      <ol className="mt-6 flex gap-2" aria-label={t("step", { current: step, total: TOTAL })}>
        {STEP_KEYS.map((key, i) => (
          <li
            key={key}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              i + 1 <= step ? "bg-primary" : "bg-muted"
            }`}
          >
            <span className="sr-only">{t(`steps.${key}`)}</span>
          </li>
        ))}
      </ol>
      <div className="card mt-6 p-4 shadow-sm sm:p-6">
        {error ? (
          <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <GsapStep step={step}>
          {step === 1 && (
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                {t("type")}
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                  {BUSINESS_TYPES.map((id) => (
                    <option key={id} value={id}>
                      {t(`types.${id}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {ts("goal")}
                <input
                  className="input-field"
                  value={typeNote}
                  onChange={(e) => setTypeNote(e.target.value)}
                  placeholder={ts("goalHint")}
                  maxLength={500}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                {t("name")}
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
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
              <label className="grid gap-1.5 text-sm font-medium">
                {t("region")}
                <input className="input-field" value={region} onChange={(e) => setRegion(e.target.value)} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {t("years")}
                <input className="input-field" type="number" min={0} value={yearsOpen} onChange={(e) => setYearsOpen(e.target.value)} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {t("employees")}
                <input className="input-field" type="number" min={1} value={employees} onChange={(e) => setEmployees(e.target.value)} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                {t("channel")}
                <select className="input-field" value={channel} onChange={(e) => setChannel(e.target.value as typeof channel)}>
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {t(c)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {step === 3 && (
            <ProductCatalogForm
              type={type}
              typeNote={typeNote}
              products={products}
              onChange={setProducts}
              labels={{
                products: t("products"),
                hint: t("productsHint"),
                suggestions: t("suggestions"),
                add: t("add"),
                remove: t("remove"),
                category: t("category"),
                brand: t("brand"),
                model: t("model"),
                buyFrom: t("buyFrom"),
                buyTo: t("buyTo"),
                sellFrom: t("sellFrom"),
                sellTo: t("sellTo"),
                qty: t("qty"),
                condition: t("condition"),
                new: t("new"),
                used: t("used"),
                skip: t("skipCatalog"),
              }}
            />
          )}
          {step === 4 && (
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                {t("competitors")}
                <textarea className="input-field min-h-24" value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder={t("competitorsHint")} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {t("audience")}
                <input className="input-field" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t("audienceHint")} />
              </label>
            </div>
          )}
          {step === 5 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold">{ts("numbersTitle")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ts("numbersHint")}</p>
              </div>
              <label className="grid gap-1.5 text-sm font-medium">
                {ts("monthlyRevenueIn")}
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                {ts("monthlyCostIn")}
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={monthlyCost}
                  onChange={(e) => setMonthlyCost(e.target.value)}
                />
              </label>
            </div>
          )}
        </GsapStep>
        <AiHints type={type} city={city} name={name} products={products} step={step} typeNote={typeNote} />
        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => (step === 1 ? onBack() : setStep((s) => s - 1))}
          >
            {t("back")}
          </button>
          <div className="flex gap-2">
            {step === 3 ? (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(4)}>
                {t("skipCatalog")}
              </button>
            ) : null}
            {step < TOTAL ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (canNext()) setStep((s) => s + 1);
                }}
              >
                {t("next")}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? t("saving") : t("finish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
