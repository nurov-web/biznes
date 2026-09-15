"use client";

type Props = {
  label: string;
  value: string;
  hint: string;
};

/** Карти рақам — чӣ ҳозир дар бизнес аст. */
export function ProgressStat({ label, value, hint }: Props) {
  return (
    <article className="card-raised p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num mt-2 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
    </article>
  );
}
