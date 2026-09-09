"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DEAL_STAGES, type DealStage } from "@/constants";

type Deal = {
  id: string;
  title: string;
  stage: DealStage;
  amount: number;
  lostReason: string;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function SalesPage() {
  const t = useTranslations("crm");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/crm/deals");
    const data = (await r.json()) as { deals?: Deal[] };
    setDeals(data.deals ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, amount: Number(amount) || 0 }),
      });
      setTitle("");
      setAmount("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function move(deal: Deal, direction: -1 | 1) {
    const i = DEAL_STAGES.indexOf(deal.stage);
    const next = DEAL_STAGES[i + direction];
    if (!next) return;
    await fetch("/api/crm/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deal.id, stage: next, lostReason: next === "lost" ? "—" : "" }),
    });
    await load();
  }

  const total = deals
    .filter((d) => d.stage !== "lost")
    .reduce((s, d) => s + d.amount, 0);

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
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="grid w-full gap-1.5 text-sm font-medium sm:w-36">
          {t("amount")}
          <input
            className="input-field"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button className="btn btn-primary w-full sm:w-auto" type="submit" disabled={busy}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("addDeal")}
        </button>
      </form>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-5">
        {DEAL_STAGES.map((stage) => {
          const rows = deals.filter((d) => d.stage === stage);
          const sum = rows.reduce((s, d) => s + d.amount, 0);
          return (
            <section key={stage} className="card-raised flex min-h-44 w-[min(18rem,calc(100%-0.5rem))] shrink-0 snap-start flex-col p-4 md:w-auto md:min-w-0">
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
                    <p className="num mt-0.5 text-xs text-muted-foreground">{money(d.amount)}</p>
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground disabled:opacity-40"
                        disabled={DEAL_STAGES.indexOf(d.stage) === 0}
                        onClick={() => void move(d, -1)}
                        aria-label={t("moveBack")}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground disabled:opacity-40"
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
                    —
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
