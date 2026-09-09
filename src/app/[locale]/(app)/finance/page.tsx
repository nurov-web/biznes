"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";

type Entry = { id: string; type: string; amount: number; category: string; note: string };

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function FinancePage() {
  const t = useTranslations("finance");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0 });
  const [form, setForm] = useState({ type: "income", amount: "", category: "sales", note: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/finance");
    const data = (await r.json()) as { entries?: Entry[]; totals?: typeof totals };
    setEntries(data.entries ?? []);
    if (data.totals) setTotals(data.totals);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          note: form.note,
        }),
      });
      setForm({ ...form, amount: "", note: "" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const cards = [
    { k: t("income"), v: totals.income, cls: "text-success" },
    { k: t("expense"), v: totals.expense, cls: "text-destructive" },
    { k: t("profit"), v: totals.profit, cls: totals.profit >= 0 ? "text-foreground" : "text-destructive" },
  ];

  return (
    <PageShell title={t("title")}>
      <section className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <article key={c.k} className="card-raised p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.k}</p>
            <p className={`num mt-2 text-2xl font-semibold ${c.cls}`}>{money(c.v)}</p>
          </article>
        ))}
      </section>

      <form onSubmit={onSubmit} className="card-raised grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        <label className="grid gap-1.5 text-sm font-medium">
          {t("category")}
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="income">{t("income")}</option>
            <option value="expense">{t("expense")}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("amount")}
          <input
            className="input-field"
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("category")}
          <input
            className="input-field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <div className="flex items-end">
          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t("add")}
          </button>
        </div>
      </form>

      <div className="card-raised table-scroll">
        <table className="table-intel">
          <thead>
            <tr>
              <th>{t("category")}</th>
              <th>{t("income")} / {t("expense")}</th>
              <th>{t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-sm text-muted-foreground">
                  —
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium">{e.category}</td>
                  <td className={e.type === "income" ? "text-success" : "text-destructive"}>
                    {e.type === "income" ? t("income") : t("expense")}
                  </td>
                  <td className="num">{money(e.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
