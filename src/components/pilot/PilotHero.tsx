import type { ReactNode } from "react";

/** Сарлавҳаи панели бизнесмен — ҳамон сиёҳи саҳифаи вуруд. */
export function PilotHero({
  eyebrow,
  title,
  lead,
  progressLabel,
  progressMeta,
  pct,
  action,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  progressLabel: string;
  progressMeta: string;
  pct: number;
  action?: ReactNode;
}) {
  return (
    <section className="hero-ink">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-8 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow text-dark-accent">{eyebrow}</p>
            <h1 className="display-2 mt-1 text-balance text-white">{title}</h1>
            {lead ? (
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-dark-muted">{lead}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <div className="mt-8 max-w-md">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-dark-muted">{progressLabel}</span>
            <span className="num text-dark-accent">{progressMeta}</span>
          </div>
          <div className="mt-3 h-0.5 overflow-hidden bg-white/10">
            <div className="h-full bg-dark-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
