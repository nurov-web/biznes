"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { money, useIntelligence } from "@/hooks/useIntelligence";

const SAMPLE = `date,sku,quantity,revenue,cost
2026-09-01,Lenovo IdeaPad 3,1,5200,4100
2026-09-02,Mouse Logitech,4,320,160`;

export default function DataPage() {
  const t = useTranslations("intel");
  const { data, loading, error, reload } = useIntelligence();
  const [kind, setKind] = useState<"sales" | "inventory" | "competitors">("sales");
  const [csv, setCsv] = useState(SAMPLE);
  const [msg, setMsg] = useState("");

  async function onImport(event: FormEvent) {
    event.preventDefault();
    setMsg("");
    const response = await fetch("/api/intelligence/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, csv }),
    });
    const json = (await response.json()) as { imported?: number; error?: string };
    setMsg(json.error ? t("importFail") : `${t("imported")}: ${json.imported ?? 0}`);
    await reload();
  }

  if (loading || error || !data) {
    return <p className="p-6 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  return (
    <PageShell title={t("dataTitle")} lead={t("dataLead")}>
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card p-4">
          <p className="text-sm text-muted-foreground">{t("quality")}</p>
          <p className="mt-2 font-mono text-3xl font-semibold">{data.dataQuality}%</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted-foreground">{t("salesLines")}</p>
          <p className="mt-2 font-mono text-3xl font-semibold">{data.salesCount}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-muted-foreground">{t("stockValue")}</p>
          <p className="mt-2 font-mono text-3xl font-semibold">{money(data.kpis.find((k) => k.key === "stock")?.value ?? 0)}</p>
        </article>
      </div>

      <form className="card space-y-3 p-5" onSubmit={(e) => void onImport(e)}>
        <label className="block text-sm font-medium">
          {t("csvKind")}
          <select
            className="input-field mt-1"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="sales">{t("kindSales")}</option>
            <option value="inventory">{t("kindStock")}</option>
            <option value="competitors">{t("kindComp")}</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          CSV
          <textarea
            className="input-field mt-1 min-h-40 font-mono text-sm"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
        </label>
        <p className="text-xs text-muted-foreground">{t("csvHint")}</p>
        <button type="submit" className="btn btn-primary">
          {t("importBtn")}
        </button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>

      <article className="card p-5">
        <h2 className="font-semibold">{t("connectors")}</h2>
        <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {["CSV / Excel", "Shopify", "WooCommerce", "Amazon", "Stripe", "PayPal", "POS", "1C / accounting", "Google Analytics"].map(
            (name) => (
              <li key={name} className="flex justify-between rounded-lg border border-border px-3 py-2">
                <span>{name}</span>
                <span className="text-muted-foreground">{name.startsWith("CSV") ? t("live") : t("queued")}</span>
              </li>
            ),
          )}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t("noScrape")}</p>
      </article>
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
