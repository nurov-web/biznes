"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useIntelligence } from "@/hooks/useIntelligence";

const AGENTS = ["ceo", "cfo", "marketing", "sales", "inventory", "market", "risk"] as const;

export default function AgentsPage() {
  const t = useTranslations("intel");
  const { data, loading, error, locale } = useIntelligence();
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>("ceo");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAnswer("");
    try {
      const response = await fetch("/api/intelligence/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, agent, question }),
      });
      const json = (await response.json()) as { answer?: string };
      setAnswer(json.answer || t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (loading || error || !data) {
    return <p className="p-6 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  return (
    <PageShell title={t("agentTitle")} lead={t("agentLead")}>
      <p className="text-sm text-muted-foreground">{t("pipeline")}</p>
      <form className="card space-y-3 p-5" onSubmit={(e) => void onAsk(e)}>
        <div className="flex flex-wrap gap-2">
          {AGENTS.map((id) => (
            <button
              key={id}
              type="button"
              className={`btn text-sm ${agent === id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setAgent(id)}
            >
              {t(`ag_${id}`)}
            </button>
          ))}
        </div>
        <label className="block text-sm">
          {t("ask")}
          <textarea
            className="input-field mt-1 min-h-24"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={1500}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? t("running") : t("send")}
        </button>
      </form>
      {answer ? (
        <article className="card p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </article>
      ) : null}
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
