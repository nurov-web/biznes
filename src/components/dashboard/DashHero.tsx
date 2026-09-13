import type { ReactNode } from "react";

type Kpi = { key: string; label: string; value: number; unit: string };

/** Сарлавҳаи панел: ҳамон сиёҳи саҳифаи вуруд, рақам бе ранги светофор. */
export function DashHero({
  eyebrow,
  title,
  lead,
  action,
  healthLabel,
  healthScore,
  kpis,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  action: ReactNode;
  healthLabel: string;
  healthScore: number;
  kpis: Kpi[];
}) {
  return (
    <section className="hero-ink">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-8 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-dark-accent">{eyebrow}</p>
            <h1 className="display-2 mt-1 text-balance text-white">{title}</h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-dark-muted">{lead}</p>
          </div>
          {action ? <div className="shrink-0 [&>.btn]:w-full sm:[&>.btn]:w-auto">{action}</div> : null}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden bg-white/10 sm:grid-cols-3 xl:grid-cols-5">
          <article className="bg-[var(--dark-bg)] px-4 py-5 sm:px-5">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-dark-muted">
              {healthLabel}
            </p>
            <p className="num mt-2 text-3xl font-semibold text-white sm:text-4xl">
              {healthScore}
              <span className="text-base font-normal text-dark-muted">/100</span>
            </p>
            <div className="mt-3 h-0.5 overflow-hidden bg-white/10">
              <div className="h-full bg-dark-accent" style={{ width: `${healthScore}%` }} />
            </div>
          </article>
          {kpis.map((k) => (
            <article key={k.key} className="bg-[var(--dark-bg)] px-4 py-5 sm:px-5">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-dark-muted">
                {k.label}
              </p>
              <p className="num mt-2 text-xl font-semibold text-white sm:text-2xl">
                {k.value.toLocaleString("ru-RU")}
                <span className="ml-1 font-sans text-xs font-normal text-dark-muted">{k.unit}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
