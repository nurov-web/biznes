"use client";

import { useTranslations } from "next-intl";

export type BusinessReadView = {
  understood: string;
  usedAi: boolean;
  note: string;
};

/** Хониши ИИ аз қадами 1 — на демо. */
export function BusinessReadout({ read }: { read: BusinessReadView }) {
  const t = useTranslations("pilot");
  return (
    <aside className="rounded-2xl border border-border bg-primary-soft/60 px-4 py-3">
      <p className="text-xs font-medium text-primary">{read.usedAi ? t("readLive") : t("readLocal")}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink">{read.understood}</p>
      {read.note ? <p className="mt-1 text-xs text-muted-foreground">{read.note}</p> : null}
    </aside>
  );
}
