"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, RefreshCw, Wallet } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export type StoreAuditView = {
  id: string;
  storeUrl: string;
  summary: string;
  products: {
    name: string;
    category: string;
    sellPrice: number;
    estimatedBuy: number;
    monthlyQty: number;
    hoursPerWeek: number;
    marginPct: number;
    note: string;
  }[];
  revenueMonthly: number;
  costMonthly: number;
  profitMonthly: number;
  hoursMonthly: number;
  risks: string[];
  actions: string[];
  disclaimer: string;
  usedAi: boolean;
  usedWeb: boolean;
  aiError: string | null;
  pagesRead: number;
  importedAt: string | null;
  createdAt: string;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export function StoreAuditPanel({ autoRun }: { autoRun: boolean }) {
  const t = useTranslations("store");
  const locale = useLocale();
  const [audit, setAudit] = useState<StoreAuditView | null>(null);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(0);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/store/audit");
    if (!response.ok) {
      setReady(true);
      return;
    }
    const json = (await response.json()) as { audit: StoreAuditView | null };
    setAudit(json.audit);
    setReady(true);
  }, []);

  const run = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/store/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const json = (await response.json()) as { audit?: StoreAuditView; error?: string };
      if (!response.ok || !json.audit) {
        setError(json.error === "no_store" ? t("auditNoStore") : t("auditFail"));
        return;
      }
      setAudit(json.audit);
    } catch {
      setError(t("auditFail"));
    } finally {
      setBusy(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!autoRun || !ready || audit || busy) return;
    void run();
  }, [autoRun, ready, audit, busy, run]);

  async function importNow() {
    setImporting(true);
    try {
      const response = await fetch("/api/store/audit", { method: "PATCH" });
      const json = (await response.json()) as { imported?: number };
      if (response.ok) {
        setImported(json.imported ?? 0);
        await load();
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display-3">{t("auditTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("auditLead")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void run()} disabled={busy}>
          <Icon icon={RefreshCw} className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? t("auditRunning") : t("auditRun")}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {busy && !audit ? <p className="text-sm text-muted-foreground">{t("auditRunning")}</p> : null}

      {audit ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="card-raised p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("auditRevenue")}</p>
              <p className="num mt-1 text-2xl font-semibold">{money(audit.revenueMonthly)}</p>
            </article>
            <article className="card-raised p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("auditCost")}</p>
              <p className="num mt-1 text-2xl font-semibold">{money(audit.costMonthly)}</p>
            </article>
            <article className="card-raised p-4">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={Wallet} className="h-3.5 w-3.5 text-primary" />
                {t("auditProfit")}
              </p>
              <p className="num mt-1 text-2xl font-semibold">{money(audit.profitMonthly)}</p>
            </article>
            <article className="card-raised p-4">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <Icon icon={Clock} className="h-3.5 w-3.5 text-primary" />
                {t("auditHours")}
              </p>
              <p className="num mt-1 text-2xl font-semibold">{audit.hoursMonthly}</p>
            </article>
          </section>

          <article className="card-raised p-4 sm:p-6">
            <p className="text-sm leading-relaxed">{audit.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {audit.usedAi
                ? t("auditAiOn")
                : audit.aiError === "bad_key"
                  ? t("auditAiBadKey")
                  : audit.aiError === "timeout"
                    ? t("auditAiTimeout")
                    : t("auditAiOff")}
              {audit.usedWeb ? ` · ${t("auditWeb")}` : ""}
              {` · ${t("auditPages")}: ${audit.pagesRead}`}
            </p>
          </article>

          <div className="card-raised table-scroll overflow-x-auto">
            <table className="table-intel">
              <thead>
                <tr>
                  <th>{t("auditSku")}</th>
                  <th>{t("auditSell")}</th>
                  <th>{t("auditBuy")}</th>
                  <th>{t("auditQty")}</th>
                  <th>{t("auditMargin")}</th>
                  <th>{t("auditTime")}</th>
                </tr>
              </thead>
              <tbody>
                {audit.products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-sm text-muted-foreground">
                      {t("auditEmpty")}
                    </td>
                  </tr>
                ) : (
                  audit.products.map((sku) => (
                    <tr key={sku.name}>
                      <td>
                        <p className="font-medium">{sku.name}</p>
                        <p className="text-xs text-muted-foreground">{sku.note || sku.category}</p>
                      </td>
                      <td className="num">{money(sku.sellPrice)}</td>
                      <td className="num">{money(sku.estimatedBuy)}</td>
                      <td className="num">{sku.monthlyQty}</td>
                      <td className="num">{sku.marginPct}%</td>
                      <td className="num">{sku.hoursPerWeek}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {audit.actions.length || audit.risks.length ? (
            <section className="grid gap-3 lg:grid-cols-2">
              <article className="card-raised p-4">
                <p className="text-sm font-medium">{t("auditActions")}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {audit.actions.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </article>
              <article className="card-raised p-4">
                <p className="text-sm font-medium">{t("auditRisks")}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {audit.risks.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </article>
            </section>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void importNow()}
              disabled={importing || !audit.products.length || Boolean(audit.importedAt)}
            >
              {audit.importedAt ? t("auditImported") : importing ? t("auditImporting") : t("auditImport")}
            </button>
            {imported ? (
              <p className="text-sm text-muted-foreground">
                {t("auditImportedN", { count: imported })}
              </p>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{audit.disclaimer || t("auditDisclaimer")}</p>
        </>
      ) : null}
    </section>
  );
}
