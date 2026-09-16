"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useOwnerSnapshot } from "@/hooks/useOwnerSnapshot";
import { ExplainMetric } from "@/components/workspace/ExplainMetric";
import { buildBusinessStory } from "@/lib/business-story";

/** Ҳафтаи воқеӣ — бо ҷумла, на девори график. */
export default function AnalyticsPage() {
  const t = useTranslations("today");
  const tw = useTranslations("workspace");
  const snap = useOwnerSnapshot();
  if (!snap.ready) return <p className="p-8 text-sm text-muted-foreground">{tw("loading")}</p>;
  const story = buildBusinessStory({
    profile: snap.profile,
    chosen: snap.chosen,
    chosenItem: snap.chosenItem,
    guide: snap.guide,
    todaySales: snap.todaySales,
  });
  const weekSum = snap.week.reduce((sum, row) => sum + row.value, 0);
  const max = Math.max(...snap.week.map((row) => row.value), 1);

  return (
    <PageShell title={tw("pages.analytics")} lead={tw("analyticsLead")} eyebrow={tw("group.see")}>
      <ExplainMetric
        label={t("moneyLabel")}
        value={`${snap.todaySales.toLocaleString("ru-RU")} TJS`}
        plain={weekSum <= 0 ? t("moneyUnknown") : t("weekPlain", { amount: weekSum.toLocaleString("ru-RU") })}
        status={t(`moneyStatus_${story.caseId}`)}
        next={t(`do_${story.caseId}`)}
        advancedLabel={t("showDetails")}
        advanced={t("moneyAdvanced")}
        tone={story.tone}
      />
      <section className="card-raised mt-4 p-5">
        <p className="text-sm font-medium">{tw("weekTitle")}</p>
        {weekSum <= 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{tw("noData")}</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {snap.week.map((row) => (
              <li key={row.day} className="flex items-center gap-3 text-sm">
                <span className="w-12 tabular-nums text-muted-foreground">{row.day}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full bg-primary"
                    style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                  />
                </span>
                <span className="w-20 text-right tabular-nums">{row.value.toLocaleString("ru-RU")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
