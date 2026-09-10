"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { SalesChart } from "@/components/SalesChart";
import { EphemeralStoreBanner } from "@/components/dashboard/EphemeralStoreBanner";

type Week = { day: string; value: number }[];
type Low = { id: string; brand: string; model: string; quantity: number };

type Dash = {
  stats: { todaySales: number; profit: number; newClients: number; lowStock: number };
  week: Week;
  lowProducts: Low[];
  ephemeralStore: boolean;
  businessName: string;
};

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function DashboardPage() {
  const t = useTranslations("dash");
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<Dash>) : null))
      .then((d) => {
        if (!d) {
          setError(true);
          return;
        }
        setData(d);
      })
      .catch(() => setError(true));
  }, []);

  if (!data) {
    return (
      <p className="p-8 text-sm text-muted-foreground" role={error ? "alert" : undefined}>
        {error ? t("empty") : "…"}
      </p>
    );
  }

  const cards = [
    { k: t("today"), v: money(data.stats.todaySales) },
    { k: t("profit"), v: money(data.stats.profit) },
    { k: t("clients"), v: String(data.stats.newClients) },
    { k: t("low"), v: String(data.stats.lowStock) },
  ];

  return (
    <PageShell title={t("title")} lead={data.businessName}>
      <EphemeralStoreBanner show={data.ephemeralStore} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.k} className="card-raised min-w-0 p-4 sm:p-5">
            <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{card.k}</p>
            <p className="num mt-2 text-xl font-semibold sm:text-2xl">{card.v}</p>
          </article>
        ))}
      </section>

      {data.week.length ? <SalesChart points={data.week} label={t("week")} /> : null}

      {data.lowProducts.length ? (
        <article className="card-raised p-4 sm:p-6">
          <h2 className="display-3">{t("alerts")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.lowProducts.map((p) => (
              <li key={p.id} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                <span className="min-w-0 truncate">
                  {p.brand} {p.model}
                </span>
                <span className="num shrink-0">{p.quantity}</span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {!data.week.length && !data.lowProducts.length ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : null}
    </PageShell>
  );
}
