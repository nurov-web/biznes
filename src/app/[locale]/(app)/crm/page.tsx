"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CrmTabs } from "@/components/crm/CrmTabs";
import { Reveal } from "@/components/motion/Reveal";
import { DEAL_STAGES, type DealStage } from "@/constants";

type Customer = { id: string; name: string; tags: string; createdAt: string };
type Deal = { id: string; title: string; stage: DealStage; amount: number };

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

export default function CrmOverviewPage() {
  const t = useTranslations("crm");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/crm/clients").then((r) => (r.ok ? r.json() : { customers: [] })),
      fetch("/api/crm/deals").then((r) => (r.ok ? r.json() : { deals: [] })),
    ])
      .then(([c, d]) => {
        setCustomers(c.customers ?? []);
        setDeals(d.deals ?? []);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost");
  const closed = won.length + lost.length;
  const conversion = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
  const avgDeal = won.length ? won.reduce((s, d) => s + d.amount, 0) / won.length : 0;
  const maxStage = Math.max(1, ...DEAL_STAGES.map((s) => deals.filter((d) => d.stage === s).length));

  const kpis = [
    { k: t("kpiClients"), v: customers.length.toLocaleString("ru-RU") },
    { k: t("kpiOpen"), v: money(open.reduce((s, d) => s + d.amount, 0)) },
    { k: t("kpiWon"), v: money(won.reduce((s, d) => s + d.amount, 0)) },
    { k: t("kpiConversion"), v: `${conversion}%` },
    { k: t("kpiAvg"), v: money(avgDeal) },
  ];

  return (
    <PageShell
      title={t("overview")}
      lead={t("overviewLead")}
      action={
        <Link href="/crm/sales" className="btn btn-primary">
          {t("sales")}
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      }
    >
      <CrmTabs />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <article key={kpi.k} className="card-raised p-5">
            <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{kpi.k}</p>
            <p className="num mt-2 text-xl font-semibold sm:text-2xl">{kpi.v}</p>
          </article>
        ))}
      </section>

      <Reveal className="card-raised p-6">
        <h2 className="display-3">{t("funnel")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("funnelLead")}</p>
        <ul className="mt-5 space-y-3">
          {DEAL_STAGES.map((stage) => {
            const rows = deals.filter((d) => d.stage === stage);
            const sum = rows.reduce((s, d) => s + d.amount, 0);
            return (
              <li key={stage}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{t(`stages.${stage}`)}</span>
                  <span className="num text-muted-foreground">
                    {rows.length} · {money(sum)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      stage === "won" ? "bg-success" : stage === "lost" ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${Math.max(2, (rows.length / maxStage) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="card-raised p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display-3">{t("recentClients")}</h2>
            <Link href="/crm/clients" className="text-sm font-medium text-primary hover:underline">
              {t("clients")}
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {customers.length === 0 ? (
              <li className="text-muted-foreground">{t("noClients")}</li>
            ) : (
              customers.slice(0, 6).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate">{c.name}</span>
                  <span className="chip text-xs">{c.tags ? t(`tagNames.${c.tags}` as "tagNames.vip") : t("noTag")}</span>
                </li>
              ))
            )}
          </ul>
        </article>
        <article className="card-raised p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display-3">{t("openDeals")}</h2>
            <Link href="/crm/sales" className="text-sm font-medium text-primary hover:underline">
              {t("sales")}
            </Link>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {open.length === 0 ? (
              <li className="text-muted-foreground">{t("noDeals")}</li>
            ) : (
              open.slice(0, 6).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
                  <span className="min-w-0 truncate">{d.title}</span>
                  <span className="num shrink-0 text-xs text-muted-foreground">{money(d.amount)}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
      {lost.length ? (
        <p className="text-xs text-muted-foreground">
          {t("lostNote", { count: lost.length })}
        </p>
      ) : null}
    </PageShell>
  );
}
