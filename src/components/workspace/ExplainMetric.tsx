"use client";

import { useState, type ReactNode } from "react";
import type { StoryTone } from "@/lib/business-story";

type Props = {
  label: string;
  value: string;
  plain: string;
  status: string;
  next: string;
  advancedLabel: string;
  advanced?: ReactNode;
  tone?: StoryTone;
};

const TONE: Record<StoryTone, string> = {
  ok: "text-success",
  watch: "text-warning",
  alert: "text-destructive",
  info: "text-muted-foreground",
};

/** Рақам + ҷумлаи оддӣ. Тафсил танҳо бо зер. */
export function ExplainMetric({
  label,
  value,
  plain,
  status,
  next,
  advancedLabel,
  advanced,
  tone = "info",
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <article className="border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plain}</p>
      <p className={`mt-2 text-sm font-medium ${TONE[tone]}`}>{status}</p>
      <p className="mt-1 text-sm text-foreground">{next}</p>
      {advanced ? (
        <div className="mt-3">
          <button
            type="button"
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {advancedLabel}
          </button>
          {open ? <div className="mt-2 text-xs text-muted-foreground">{advanced}</div> : null}
        </div>
      ) : null}
    </article>
  );
}
