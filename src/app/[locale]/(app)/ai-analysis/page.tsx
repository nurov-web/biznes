"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AdviceCard, AiAnalysisPayload } from "@/types";

function Cards({ title, items }: { title: string; items: AdviceCard[] }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((c) => (
          <article
            key={c.title + c.detail}
            className={`card p-4 ${
              c.level === "green"
                ? "border-success/40"
                : c.level === "red"
                  ? "border-destructive/40"
                  : "border-warning/40"
            }`}
          >
            <p className="font-medium">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
            <p className="mt-2 text-sm font-medium">{c.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function AiPage() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [result, setResult] = useState<AiAnalysisPayload | null>(null);
  const [usedAi, setUsedAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");

  async function run() {
    setBusy(true);
    const r = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const data = (await r.json()) as { result?: AiAnalysisPayload; usedAi?: boolean };
    setResult(data.result ?? null);
    setUsedAi(Boolean(data.usedAi));
    setBusy(false);
  }

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    const r = await fetch("/api/ai/advise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, locale }),
    });
    const data = (await r.json()) as { answer?: string };
    setAnswer(data.answer ?? "");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? t("running") : t("run")}
        </button>
      </div>
      {result ? (
        <>
          <p className="rounded-xl bg-muted px-4 py-3 text-sm">{usedAi ? t("live") : t("demo")}</p>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
          <p className="card p-4 text-sm">{result.dailyTip}</p>
          <Cards title={t("price")} items={result.priceAdvice} />
          <Cards title={t("stock")} items={result.inventoryAdvice} />
          <Cards title={t("growth")} items={result.growthAdvice} />
          <Cards title={t("risk")} items={result.risks} />
        </>
      ) : null}
      <form onSubmit={onAsk} className="card space-y-3 p-4">
        <label className="grid gap-1 text-sm font-medium">
          {t("ask")}
          <input className="input-field" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">{t("send")}</button>
        {answer ? <p className="text-sm whitespace-pre-wrap">{answer}</p> : null}
      </form>
    </div>
  );
}
