"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DEAL_STAGES, type DealStage } from "@/constants";

type Customer = { id: string; name: string };
type Deal = {
  id: string;
  title: string;
  stage: DealStage;
  amount: number;
  lostReason: string;
  customerId: string | null;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function SalesPage() {
  const t = useTranslations("crm");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [dealRes, clientRes] = await Promise.all([fetch("/api/crm/deals"), fetch("/api/crm/clients")]);
    const dealJson = (await dealRes.json()) as { deals?: Deal[] };
    const clientJson = (await clientRes.json()) as { customers?: Customer[] };
    setDeals(dealJson.deals ?? []);
    setCustomers(clientJson.customers ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function clientName(id: string | null): string {
    if (!id) return "";
    return customers.find((c) => c.id === id)?.name ?? "";
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount) || 0,
          customerId: customerId || null,
        }),
      });
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      setTitle("");
      setAmount("");
      setCustomerId("");
      await load();
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  async function move(deal: Deal, direction: -1 | 1) {
    const i = DEAL_STAGES.indexOf(deal.stage);
    const next = DEAL_STAGES[i + direction];
    if (!next) return;
    setError("");
    const response = await fetch("/api/crm/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: deal.id,
        stage: next,
        lostReason: next === "lost" ? t("lostDefault") : "",
      }),
    });
    if (!response.ok) {
      setError(t("saveError"));
      return;
    }
    await load();
  }

  const total = deals.filter((d) => d.stage !== "lost").reduce((s, d) => s + d.amount, 0);

  return (
    <PageShell
      title={t("sales")}
      lead={t("salesLead")}
      action={<span className="chip num">{money(total)}</span>}
    >
      <form onSubmit={onSubmit} className="card-raised flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:p-5">
        <label className="grid min-w-0 w-full flex-1 gap-1.5 text-sm font-medium sm:min-w-56">
          {t("dealTitle")}
          <input
            className="input-field min-h-12"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="grid w-full gap-1.5 text-sm font-medium sm:w-40">
          {t("client")}
          <select
            className="input-field min-h-12"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">{t("noClient")}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid w-full gap-1.5 text-sm font-medium sm:w-36">
          {t("amount")}
          <input
            className="input-field min-h-12 num"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button className="btn btn-primary min-h-12 w-full sm:w-auto" type="submit" disabled={busy}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("addDeal")}
        </button>
        {error ? (
          <p className="w-full text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-5">
        {DEAL_STAGES.map((stage) => {
          const rows = deals.filter((d) => d.stage === stage);
          const sum = rows.reduce((s, d) => s + d.amount, 0);
          return (
            <section
              key={stage}
              className="card-raised flex min-h-44 w-[min(18rem,calc(100%-0.5rem))] shrink-0 snap-start flex-col p-4 md:w-auto md:min-w-0"
            >
              <header className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">{t(`stages.${stage}`)}</h2>
                <span className="num text-xs text-muted-foreground">{rows.length}</span>
              </header>
              <p className="num mt-0.5 text-xs text-muted-foreground">{money(sum)}</p>
              <ul className="mt-3 flex-1 space-y-2">
                {rows.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-border bg-background p-3 transition-shadow duration-200 hover:shadow-[var(--shadow-sm)]"
                  >
                    <p className="text-sm font-medium leading-snug">{d.title}</p>
                    {clientName(d.customerId) ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{clientName(d.customerId)}</p>
                    ) : null}
                    <p className="num mt-0.5 text-xs text-muted-foreground">{money(d.amount)}</p>
                    {stage === "won" ? (
                      <p className="mt-1 text-[11px] font-medium text-success">{t("postedSale")}</p>
                    ) : null}
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        className="grid min-h-12 min-w-12 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground disabled:opacity-40"
                        disabled={DEAL_STAGES.indexOf(d.stage) === 0}
                        onClick={() => void move(d, -1)}
                        aria-label={t("moveBack")}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="grid min-h-12 min-w-12 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground disabled:opacity-40"
                        disabled={DEAL_STAGES.indexOf(d.stage) === DEAL_STAGES.length - 1}
                        onClick={() => void move(d, 1)}
                        aria-label={t("moveNext")}
                      >
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
                {rows.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                    {t("columnEmpty")}
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
