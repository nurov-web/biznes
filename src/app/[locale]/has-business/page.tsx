"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell, StepBar } from "@/components/pilot/PilotFormShell";
import { Select } from "@/components/ui/Select";
import { ShopPulsePanel, type ShopLinkForm } from "@/components/pilot/ShopPulsePanel";
import { ThinkingStages } from "@/components/workspace/ThinkingStages";
import {
  defaultUnitFor,
  PILOT_AGRI_SUB,
  PILOT_CATEGORIES,
  PILOT_CHANNELS,
  PILOT_UNITS,
} from "@/constants/pilot";
import type { ShopPulse } from "@/types/shop-pulse";

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
  shop: ShopLinkForm;
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
  shop: { url: "", sold: "", refused: "", complaints: "" },
};

const DRAFT_KEY = "bp_has_draft";

export default function HasBusinessPage() {
  const t = useTranslations("pilot");
  const tw = useTranslations("workspace");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pulse, setPulse] = useState<ShopPulse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { hasPilotProfile?: boolean } | null) => {
        if (cancelled) return;
        if (data?.hasPilotProfile) {
          router.replace("/dashboard");
          return;
        }
        try {
          const cachedRaw = localStorage.getItem("bp_me_cache") || sessionStorage.getItem("bp_me_cache");
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw) as { hasPilotProfile?: boolean };
            if (cached.hasPilotProfile) {
              router.replace("/dashboard");
              return;
            }
          }
        } catch {
          /* нопазир */
        }
        try {
          const raw = localStorage.getItem(DRAFT_KEY) || sessionStorage.getItem(DRAFT_KEY);
          if (!raw) {
            setReady(true);
            return;
          }
          const parsed: unknown = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            setReady(true);
            return;
          }
          const next = parsed as Partial<FormState> & { step?: number; form?: Partial<FormState> };
          const body = (next.form ?? next) as Partial<FormState>;
          setForm((prev) => ({
            ...prev,
            ...body,
            shop: { ...prev.shop, ...(body.shop ?? {}) },
          }));
          if (typeof next.step === "number" && next.step >= 1 && next.step <= 3) {
            setStep(next.step);
          }
        } catch {
          /* нопазир */
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
    } catch {
      /* нопазир */
    }
  }, [ready, step, form]);

  function goStep2() {
    if (!form.category || !form.product.trim() || !form.region.trim()) return;
    setForm((prev) => ({ ...prev, volumeUnit: defaultUnitFor(prev.category) }));
    setStep(2);
  }

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
          shopUrl: form.shop.url,
          shopSold: form.shop.sold.trim() ? Number(form.shop.sold.replace(/\s/g, "")) : null,
          shopRefused: form.shop.refused.trim()
            ? Number(form.shop.refused.replace(/\s/g, ""))
            : null,
          shopComplaints: form.shop.complaints.trim()
            ? Number(form.shop.complaints.replace(/\s/g, ""))
            : null,
        }),
      });
      if (response.status === 401) {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form }));
        } catch {
          /* нопазир */
        }
        router.push("/login?next=/has-business");
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
      try {
        sessionStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* нопазир */
      }
      router.push("/suggestions");
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <PilotFormShell>
        <p className="text-sm text-muted-foreground">{t("saving")}</p>
      </PilotFormShell>
    );
  }

  return (
    <PilotFormShell>
      <StepBar step={step} total={3} />
      {busy ? (
        <ThinkingStages
          running={busy}
          title={tw("thinkTitle")}
          stages={[tw("think1"), tw("think2"), tw("think3"), tw("think4")]}
        />
      ) : null}
      {error ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4">
          <h1 className="display-2">{t("stepOf", { current: 1, total: 3 })} — {t("bizTitle")}</h1>
          <p className="text-sm text-muted-foreground">{tw("startForm")}</p>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("category")}
            <Select
              value={form.category}
              placeholder={t("pick")}
              onChange={(next) =>
                setForm({
                  ...form,
                  category: next as FormState["category"],
                  subcategory: "",
                  volumeUnit: defaultUnitFor(next),
                })
              }
              options={PILOT_CATEGORIES.map((c) => ({ value: c, label: t(`cats.${c}`) }))}
            />
          </label>
          {form.category === "agriculture" ? (
            <label className="grid gap-1.5 text-sm font-medium">
              {t("sub")}
              <Select
                value={form.subcategory}
                placeholder={t("sub")}
                onChange={(next) => setForm({ ...form, subcategory: next })}
                options={PILOT_AGRI_SUB.map((s) => ({ value: s, label: t(`agri.${s}`) }))}
              />
            </label>
          ) : null}
          <label className="grid gap-1.5 text-sm font-medium">
            {t("product")}
            <input
              className="input-field min-h-12"
              value={form.product}
              placeholder={
                form.category ? t(`productPhCat.${form.category}`) : t("productPh")
              }
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
            onClick={() => goStep2()}
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
              <div className="w-32 shrink-0 sm:w-36">
                <Select
                  value={form.volumeUnit}
                  onChange={(next) =>
                    setForm({ ...form, volumeUnit: next as FormState["volumeUnit"] })
                  }
                  options={PILOT_UNITS.map((u) => ({ value: u, label: t(`units.${u}`) }))}
                />
              </div>
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
          <ShopPulsePanel
            value={form.shop}
            onChange={(shop) => setForm({ ...form, shop })}
            pulse={pulse}
            onPulse={setPulse}
          />
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
