"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
import { money, useIntelligence } from "@/hooks/useIntelligence";
import { parseLocale } from "@/lib/locale-query";
import { suggestAction } from "@/services/intelligence/advice";

const NEXT: Record<string, string[]> = {
  pending: ["approved", "rejected"],
  approved: ["done", "rejected"],
  rejected: ["pending"],
  done: [],
};

export default function ActionsPage() {
  const t = useTranslations("intel");
  const { data, loading, error, reload, locale } = useIntelligence();

  async function setStatus(id: string, status: string) {
    await fetch("/api/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await reload();
  }

  if (loading || error || !data) {
    return <p className="p-8 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  const tip = suggestAction(data.actions, parseLocale(locale));

  return (
    <PageShell title={t("actTitle")} lead={t("actLead")}>
      <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {[t("stepRec"), t("stepSim"), t("stepAppr"), t("stepAct"), t("stepRes")].map((step, i) => (
          <li key={step} className="chip">
            <span className="num">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <RecommendedNote suggestion={tip} />

      <ul className="space-y-3">
        {data.actions.length === 0 ? (
          <li className="card-raised p-6 text-sm text-muted-foreground">{t("noActions")}</li>
        ) : (
          data.actions.map((a) => (
            <li
              key={a.id}
              className={`card-raised p-6 ${tip?.key === a.id ? "border-primary/40" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {a.title}
                    {tip?.key === a.id ? <RecommendedBadge /> : null}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {a.detail.slice(0, 280)}
                  </p>
                  <p className="eyebrow mt-2 text-primary">{a.status}</p>
                </div>
                <p className="num shrink-0 text-sm">{money(a.impactMonthly)}/mo</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(NEXT[a.status] || []).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => void setStatus(a.id, s)}
                  >
                    {t(`st_${s}`)}
                  </button>
                ))}
              </div>
            </li>
          ))
        )}
      </ul>
      <p className="text-xs text-muted-foreground">{t("humanGate")}</p>
    </PageShell>
  );
}
