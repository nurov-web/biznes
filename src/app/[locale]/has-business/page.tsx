"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell, StepBar } from "@/components/pilot/PilotFormShell";
import {
  PILOT_AGRI_SUB,
  PILOT_CATEGORIES,
  PILOT_CHANNELS,
  PILOT_UNITS,
} from "@/constants/pilot";

type FormState = {
  category: (typeof PILOT_CATEGORIES)[number] | "";
  subcategory: string;
  product: string;
  region: string;
  volume: string;
  volumeUnit: (typeof PILOT_UNITS)[number];
  price: string;
  channels: string[];
  problem: string;
};

const EMPTY: FormState = {
  category: "",
  subcategory: "",
  product: "",
  region: "",
  volume: "",
  volumeUnit: "kg",
  price: "",
  channels: [],
  problem: "",
};

export default function HasBusinessPage() {
  const t = useTranslations("pilot");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggleChannel(ch: string) {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/analyze-business", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          category: form.category,
          subcategory: form.subcategory,
          product: form.product,
          region: form.region,
          volume: form.volume,
          volumeUnit: form.volumeUnit,
          price: form.price,
          channels: form.channels,
          problem: form.problem,
        }),
      });
      if (response.status === 401) {
        router.push("/register?next=/has-business");
        return;
      }
      if (response.status === 429) {
        setError(t("rateLimit"));
        return;
      }
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      router.push("/suggestions");
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PilotFormShell>
      <StepBar step={step} total={3} />
      {error ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4">
          <h1 className="display-2">{t("stepOf", { current: 1, total: 3 })} — {t("bizTitle")}</h1>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("category")}
            <select
              className="input-field min-h-12"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as FormState["category"],
                  subcategory: "",
                })
              }
            >
              <option value="">{t("pick")}</option>
              {PILOT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cats.${c}`)}
                </option>
              ))}
            </select>
          </label>
          {form.category === "agriculture" ? (
            <label className="grid gap-1.5 text-sm font-medium">
              {t("sub")}
              <select
                className="input-field min-h-12"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              >
                <option value="">{t("sub")}</option>
                {PILOT_AGRI_SUB.map((s) => (
                  <option key={s} value={s}>
                    {t(`agri.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="grid gap-1.5 text-sm font-medium">
            {t("product")}
            <input
              className="input-field min-h-12"
              value={form.product}
              placeholder={t("productPh")}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("region")}
            <input
              className="input-field min-h-12"
              value={form.region}
              placeholder={t("regionPh")}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="btn btn-primary min-h-12"
            disabled={!form.category || !form.product.trim() || !form.region.trim()}
            onClick={() => setStep(2)}
          >
            {t("next")}
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <h1 className="display-2">{t("stepOf", { current: 2, total: 3 })} — {t("bizNow")}</h1>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("volume")}
            <div className="flex gap-2">
              <input
                className="input-field min-h-12 flex-1"
                type="number"
                min={0}
                value={form.volume}
                placeholder={t("volumePh")}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
              />
              <select
                className="input-field min-h-12 w-28"
                value={form.volumeUnit}
                onChange={(e) =>
                  setForm({ ...form, volumeUnit: e.target.value as FormState["volumeUnit"] })
                }
              >
                {PILOT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t(`units.${u}`)}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("price")}
            <input
              className="input-field min-h-12"
              type="number"
              min={0}
              value={form.price}
              placeholder={t("pricePh")}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">{t("channels")}</legend>
            {PILOT_CHANNELS.map((ch) => (
              <label key={ch} className="flex min-h-12 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--primary)]"
                  checked={form.channels.includes(ch)}
                  onChange={() => toggleChannel(ch)}
                />
                {t(`ch.${ch}`)}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn btn-ghost min-h-12" onClick={() => setStep(1)}>
              {t("back")}
            </button>
            <button
              type="button"
              className="btn btn-primary min-h-12 flex-1"
              disabled={!form.volume || !form.price}
              onClick={() => setStep(3)}
            >
              {t("next")}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <h1 className="display-2">{t("stepOf", { current: 3, total: 3 })} — {t("bizProblem")}</h1>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("problem")}
            <textarea
              className="input-field min-h-28"
              value={form.problem}
              placeholder={t("problemPh")}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className="btn btn-ghost min-h-12" onClick={() => setStep(2)}>
              {t("back")}
            </button>
            <button
              type="button"
              className="btn btn-primary min-h-12 flex-1"
              disabled={busy}
              onClick={() => void submit()}
            >
              {busy ? t("saving") : t("analyze")}
            </button>
          </div>
        </div>
      ) : null}
    </PilotFormShell>
  );
}
