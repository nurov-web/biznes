"use client";

type Step = {
  id: string;
  label: string;
  done: number;
  total: number;
};

type Props = {
  title: string;
  hint: string;
  steps: Step[];
};

function ratio(done: number, total: number): number {
  if (total <= 0) return 0;
  const n = Math.max(0, Math.min(done, total));
  return Math.round((n / total) * 100);
}

/** Қадамҳо аз кори воқеӣ: 0% = нашудааст, на сутуни сохта. */
export function ProgressFunnel({ title, hint, steps }: Props) {
  const finished = steps.filter((step) => step.total > 0 && step.done >= step.total).length;
  return (
    <article className="card-raised p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="display-3">{title}</h2>
        <p className="num text-sm text-primary">
          {finished}/{steps.length}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>
      <ol className="mt-5 grid list-none gap-3 p-0">
        {steps.map((step, i) => {
          const pct = ratio(step.done, step.total);
          const complete = pct === 100;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  complete ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm ${complete ? "font-medium text-ink" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="num shrink-0 text-xs text-muted-foreground">
                    {Math.max(0, Math.min(step.done, step.total))}/{step.total}
                  </p>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={step.label}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
