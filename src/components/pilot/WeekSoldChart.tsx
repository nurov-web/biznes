"use client";

type Point = { key: string; label: string; value: number };

type Props = {
  title: string;
  empty: string;
  points: Point[];
};

/** Ҳафт рӯзи фурӯш — баландии сутун аз рақами воқеӣ. */
export function WeekSoldChart({ title, empty, points }: Props) {
  const max = Math.max(...points.map((p) => p.value), 0);
  const has = points.some((p) => p.value > 0);
  return (
    <article className="card-raised p-5 sm:p-6">
      <h2 className="display-3">{title}</h2>
      {!has ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : null}
      <div className="mt-6 flex h-40 items-end gap-2">
        {points.map((point) => {
          const pct = max > 0 ? Math.max(point.value / max, 0) : 0;
          const h = has ? Math.max(pct * 100, point.value > 0 ? 8 : 2) : 2;
          return (
            <div key={point.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="num text-xs font-semibold text-ink">
                {point.value > 0 ? point.value : ""}
              </span>
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-md bg-primary"
                  style={{ height: `${h}%`, opacity: point.value > 0 ? 1 : 0.18 }}
                />
              </div>
              <span className="truncate text-[11px] text-muted-foreground">{point.label}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
