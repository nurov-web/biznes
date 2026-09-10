"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Kind = "buy" | "sell";

type Item = {
  id: string;
  kind: Kind;
  name: string;
  quantity: number;
  amount: number;
  createdAt: string;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export function StoreLedgerPanel() {
  const t = useTranslations("store");
  const [kind, setKind] = useState<Kind>("buy");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/store/ledger");
    if (!response.ok) return;
    const json = (await response.json()) as { items?: Item[] };
    setItems(json.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch("/api/store/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          quantity: Number(quantity) || 1,
          unitPrice: Number(unitPrice) || 0,
          sellPrice: kind === "buy" ? Number(sellPrice) || undefined : undefined,
        }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(json.error === "no_store" ? t("auditNoStore") : t("ledgerFail"));
        return;
      }
      setName("");
      setQuantity("1");
      setUnitPrice("");
      setSellPrice("");
      setSaved(kind === "buy" ? t("ledgerSavedBuy") : t("ledgerSavedSell"));
      await load();
    } catch {
      setError(t("ledgerFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 sm:p-5">
        <h2 className="display-3">{t("whyTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("whyLead")}</p>
      </article>

      <form onSubmit={onSubmit} className="card-raised space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="display-3">{t("ledgerTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("ledgerLead")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${kind === "buy" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setKind("buy")}
          >
            {t("ledgerBuy")}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${kind === "sell" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setKind("sell")}
          >
            {t("ledgerSell")}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5 text-sm font-medium">
            {t("ledgerName")}
            <input
              className="input-field min-h-12"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ledgerNamePh")}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("ledgerQty")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {kind === "buy" ? t("ledgerBuyPrice") : t("ledgerSellPrice")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </label>
          {kind === "buy" ? (
            <label className="grid gap-1.5 text-sm font-medium">
              {t("ledgerShelf")}
              <input
                className="input-field min-h-12 num"
                type="number"
                min={0}
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder={t("ledgerShelfPh")}
              />
            </label>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary min-h-12" disabled={busy}>
            {busy ? t("ledgerSaving") : t("ledgerSave")}
          </button>
          <Link href="/dashboard" className="btn btn-ghost min-h-12">
            {t("ledgerToDash")}
          </Link>
          <Link href="/finance" className="btn btn-ghost min-h-12">
            {t("ledgerToFinance")}
          </Link>
          <Link href="/inventory" className="btn btn-ghost min-h-12">
            {t("ledgerToStock")}
          </Link>
        </div>
        {saved ? (
          <p className="text-sm text-success" role="status">
            {saved}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {items.length ? (
        <div className="card-raised table-scroll overflow-x-auto">
          <table className="table-intel">
            <thead>
              <tr>
                <th>{t("ledgerKind")}</th>
                <th>{t("ledgerName")}</th>
                <th>{t("ledgerQty")}</th>
                <th>{t("ledgerAmount")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.kind === "buy" ? t("ledgerBuy") : t("ledgerSell")}</td>
                  <td>{row.name}</td>
                  <td className="num">{row.quantity || "—"}</td>
                  <td className="num">{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
