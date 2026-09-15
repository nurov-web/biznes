"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell, StepBar } from "@/components/pilot/PilotFormShell";
import { Select } from "@/components/ui/Select";
import { ShopPulsePanel, type ShopLinkForm } from "@/components/pilot/ShopPulsePanel";
import { BusinessReadout } from "@/components/pilot/BusinessReadout";
import {
  defaultUnitFor,
  PILOT_AGRI_SUB,
  PILOT_CATEGORIES,
  PILOT_CHANNELS,
  PILOT_UNITS,
} from "@/constants/pilot";
import { namedGoods } from "@/lib/owner-goods";
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

export default function HasBusinessPage() {
  const t = useTranslations("pilot");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pulse, setPulse] = useState<ShopPulse | null>(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [read, setRead] = useState<{
    understood: string;
    usedAi: boolean;
    note: string;
    volumeHint: string;
    priceHint: string;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bp_has_draft");
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const next = parsed as Partial<FormState>;
      setForm((prev) => ({
        ...prev,
        ...next,
        shop: { ...prev.shop, ...(next.shop ?? {}) },
      }));
    } catch {
      /* нопазир */
    }
  }, []);

  async function goStep2() {
    if (!form.category || !form.product.trim() || !form.region.trim()) return;
    setReading(true);
    setError("");
    const goods = namedGoods(form.product);
    const region = form.region.trim();
    const local = {
      understood: goods
        ? t("readFallback", { product: goods, region })
        : t("readCityOnly", { region }),
      usedAi: false,
      note: goods ? t("readNeed") : t("readAskProduct"),
      volumeHint: "",
      priceHint: "",
    };
    try {
      const response = await fetch("/api/pilot/read-business", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          category: form.category,
          subcategory: form.subcategory,
          product: form.product.trim(),
          region: form.region.trim(),
        }),
      });
      if (response.status === 401) {
        setRead(local);
        setForm((prev) => ({ ...prev, volumeUnit: defaultUnitFor(prev.category) }));
        setStep(2);
        return;
      }
      if (response.status === 429) {
        setRead(local);
        setForm((prev) => ({ ...prev, volumeUnit: defaultUnitFor(prev.category) }));
        setStep(2);
        return;
      }
      if (response.ok) {
        const data = (await response.json()) as {
          understood?: string;
          usedAi?: boolean;
          note?: string;
          volumeHint?: string;
          priceHint?: string;
          unit?: (typeof PILOT_UNITS)[number];
        };
        setRead({
          understood: goods
            ? data.understood?.trim() || local.understood
            : local.understood,
          usedAi: Boolean(data.usedAi),
          note: goods ? data.note?.trim() || local.note : local.note,
          volumeHint: data.volumeHint?.trim() || "",
          priceHint: data.priceHint?.trim() || "",
        });
        if (data.unit && (PILOT_UNITS as readonly string[]).includes(data.unit)) {
          setForm((prev) => ({ ...prev, volumeUnit: data.unit as FormState["volumeUnit"] }));
        }
      } else {
        setRead(local);
        setForm((prev) => ({ ...prev, volumeUnit: defaultUnitFor(prev.category) }));
      }
      setStep(2);
    } catch {
      setRead(local);
      setForm((prev) => ({ ...prev, volumeUnit: defaultUnitFor(prev.category) }));
      setStep(2);
    } finally {
      setReading(false);
    }
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
          sessionStorage.setItem("bp_has_draft", JSON.stringify(form));
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
        sessionStorage.removeItem("bp_has_draft");
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
            disabled={reading || !form.category || !form.product.trim() || !form.region.trim()}
            onClick={() => void goStep2()}
          >
            {reading ? t("reading") : t("next")}
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <h1 className="display-2">{t("stepOf", { current: 2, total: 3 })} — {t("bizNow")}</h1>
          {read ? <BusinessReadout read={read} /> : null}
          <label className="grid gap-1.5 text-sm font-medium">
            {t("volume")}
            <div className="flex gap-2">
              <input
                className="input-field min-h-12 flex-1"
                type="number"
                min={0}
                value={form.volume}
                placeholder={read?.volumeHint || t("volumePh")}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
              />
              <div className="w-28 shrink-0">
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
              placeholder={read?.priceHint || t("pricePh")}
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
          {read ? <BusinessReadout read={read} /> : null}
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
