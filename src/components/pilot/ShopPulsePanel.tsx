"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { ShopPulse } from "@/types/shop-pulse";

export type ShopLinkForm = {
  url: string;
  sold: string;
  refused: string;
  complaints: string;
};

type Props = {
  value: ShopLinkForm;
  onChange: (next: ShopLinkForm) => void;
  persist?: boolean;
  pulse: ShopPulse | null;
  onPulse: (pulse: ShopPulse | null) => void;
};

function dash(n: number | null, format: ReturnType<typeof useFormatter>): string {
  return n === null ? "—" : format.number(n);
}

function metricHint(
  pulse: ShopPulse,
  key: "sold" | "refused" | "complaints",
  source: ShopPulse["soldSource"],
  t: ReturnType<typeof useTranslations>,
): string {
  if (source) return t(`shopSrc.${source}`);
  if (pulse.locked.includes(key)) return t("shopLocked");
  return t("shopMissing");
}

function optNum(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(/\s/g, ""));
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function ShopPulsePanel({ value, onChange, persist = false, pulse, onPulse }: Props) {
  const t = useTranslations("pilot");
  const format = useFormatter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function readPage() {
    if (!value.url.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/pilot/shop", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: value.url,
          sold: optNum(value.sold),
          refused: optNum(value.refused),
          complaints: optNum(value.complaints),
          save: persist,
        }),
      });
      if (response.status === 401) {
        setError(t("shopNeedLogin"));
        return;
      }
      if (response.status === 429) {
        setError(t("rateLimit"));
        return;
      }
      if (!response.ok) {
        setError(t("shopReadError"));
        return;
      }
      const json = (await response.json()) as { pulse?: ShopPulse };
      onPulse(json.pulse ?? null);
    } catch {
      setError(t("shopReadError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-medium">{t("shopUrl")}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("shopUrlHint")}</p>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        {t("shopUrl")}
        <input
          className="input-field min-h-12"
          value={value.url}
          inputMode="url"
          autoComplete="url"
          placeholder={t("shopUrlPh")}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
      </label>
      <button
        type="button"
        className="btn btn-ghost min-h-12"
        disabled={busy || !value.url.trim()}
        onClick={() => void readPage()}
      >
        {busy ? t("shopReading") : t("shopRead")}
      </button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {pulse ? (
        <div className="grid gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t(`shopStatus.${pulse.status}`)}
            {pulse.title ? ` · ${pulse.title}` : ""}
          </p>
          {pulse.catalogProducts !== null || pulse.catalogShops !== null || pulse.catalogReviews !== null ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("shopCatalog", {
                products: pulse.catalogProducts ?? 0,
                reviews: pulse.catalogReviews ?? 0,
                shops: pulse.catalogShops ?? 0,
              })}
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted px-2 py-3">
              <p className="text-[11px] text-muted-foreground">{t("shopSold")}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{dash(pulse.sold, format)}</p>
              <p className="text-[11px] text-muted-foreground">
                {metricHint(pulse, "sold", pulse.soldSource, t)}
              </p>
            </div>
            <div className="rounded-lg bg-muted px-2 py-3">
              <p className="text-[11px] text-muted-foreground">{t("shopRefused")}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{dash(pulse.refused, format)}</p>
              <p className="text-[11px] text-muted-foreground">
                {pulse.returnPct !== null && pulse.refused === null
                  ? t("shopReturnPct", { n: pulse.returnPct })
                  : metricHint(pulse, "refused", pulse.refusedSource, t)}
              </p>
            </div>
            <div className="rounded-lg bg-muted px-2 py-3">
              <p className="text-[11px] text-muted-foreground">{t("shopComplaints")}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{dash(pulse.complaints, format)}</p>
              <p className="text-[11px] text-muted-foreground">
                {metricHint(pulse, "complaints", pulse.complaintsSource, t)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <p className="text-sm leading-relaxed text-muted-foreground">{t("shopOwnerHint")}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">
          {t("shopSold")}
          <input
            className="input-field min-h-12"
            inputMode="numeric"
            value={value.sold}
            placeholder="—"
            onChange={(e) => onChange({ ...value, sold: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("shopRefused")}
          <input
            className="input-field min-h-12"
            inputMode="numeric"
            value={value.refused}
            placeholder="—"
            onChange={(e) => onChange({ ...value, refused: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("shopComplaints")}
          <input
            className="input-field min-h-12"
            inputMode="numeric"
            value={value.complaints}
            placeholder="—"
            onChange={(e) => onChange({ ...value, complaints: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
