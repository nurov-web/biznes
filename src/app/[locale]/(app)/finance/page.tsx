"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ModuleEmpty } from "@/components/ops/ModuleEmpty";
import { FINANCE_CATEGORIES } from "@/constants";

type Entry = {
  id: string;
  type: string;
  amount: number;
  category: string;
  note: string;
  entryDate?: string;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function FinancePage() {
  const t = useTranslations("finance");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, profit: 0 });
  const [form, setForm] = useState({ type: "income", amount: "", category: "sales", note: "" });
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/finance");
    const data = (await r.json()) as { entries?: Entry[]; totals?: typeof totals };
    setEntries(data.entries ?? []);
    if (data.totals) setTotals(data.totals);
  }

  useEffect(() => {
    void load();
  }, []);

  function catLabel(key: string): string {
    if ((FINANCE_CATEGORIES as readonly string[]).includes(key)) {
      return t(`cats.${key}` as "cats.sales");
    }
    return key;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          note: form.note,
        }),
      });
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      setForm({ ...form, amount: "", note: "" });
      await load();
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  const visible = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.type === filter);
  }, [entries, filter]);

  const cards = [
    { k: t("income"), v: totals.income, cls: "text-success" },
    { k: t("expense"), v: totals.expense, cls: "text-destructive" },
    { k: t("profit"), v: totals.profit, cls: totals.profit >= 0 ? "text-foreground" : "text-destructive" },
  ];

  return (
    <PageShell title={t("title")} lead={t("lead")}>
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
          {t("type")}
          <select
            className="input-field min-h-12"
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
            className="input-field min-h-12 num"
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {t("category")}
          <select
            className="input-field min-h-12"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {FINANCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`cats.${cat}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-4">
          {t("note")}
          <input
            className="input-field min-h-12"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder={t("notePh")}
          />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button className="btn btn-primary min-h-12 w-full sm:w-auto" type="submit" disabled={busy}>
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t("add")}
          </button>
        </div>
        {error ? (
          <p className="text-sm text-destructive sm:col-span-2 lg:col-span-4" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <div className="seg">
        {(["all", "income", "expense"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className="seg-item"
            data-active={filter === key}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? t("all") : t(key)}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <ModuleEmpty title={t("empty")} lead={t("emptyLead")} href="/crm/sales" cta={t("emptyCta")} />
      ) : (
        <div className="card-raised table-scroll">
          <table className="table-intel">
            <thead>
              <tr>
                <th>{t("category")}</th>
                <th>{t("type")}</th>
                <th>{t("note")}</th>
                <th>{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-sm text-muted-foreground">
                    {t("noMatch")}
                  </td>
                </tr>
              ) : (
                visible.map((e) => (
                  <tr key={e.id}>
                    <td className="font-medium">{catLabel(e.category)}</td>
                    <td className={e.type === "income" ? "text-success" : "text-destructive"}>
                      {e.type === "income" ? t("income") : t("expense")}
                    </td>
                    <td className="max-w-xs text-muted-foreground">{e.note || "—"}</td>
                    <td className="num">{money(e.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
