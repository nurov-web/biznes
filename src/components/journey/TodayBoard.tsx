"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import { buildBusinessStory, type StoryTone } from "@/lib/business-story";
import type { RunGuide } from "@/components/dashboard/RunBusinessGuide";
import { ExplainMetric } from "@/components/workspace/ExplainMetric";
import { SuggestionPath } from "@/components/pilot/SuggestionPath";
import { shortLine, suggestionSteps } from "@/lib/pilot-suggestions";
import { modulePackFor } from "@/constants/workspace";

type Props = {
  profile: PilotProfileRow;
  guide: RunGuide | null;
  chosen: boolean;
  chosenItem: PilotSuggestionItem | null;
  todaySales: number;
  simple: boolean;
};

const TONE_BG: Record<StoryTone, string> = {
  ok: "border-success/30 bg-success/5",
  watch: "border-warning/30 bg-warning/5",
  alert: "border-destructive/30 bg-destructive/5",
  info: "border-border bg-muted/40",
};

/** Имрӯз: куҷоям → чӣ хатост → чаро → чӣ кунам → чӣ тавр пеш меравам. */
export function TodayBoard({ profile, guide, chosen, chosenItem, todaySales, simple }: Props) {
  const t = useTranslations("today");
  const tw = useTranslations("workspace");
  const story = buildBusinessStory({ profile, chosen, chosenItem, guide, todaySales });
  const pack = modulePackFor(profile.category);
  const money = todaySales.toLocaleString("ru-RU");

  return (
    <div className="grid gap-4">
      <section className={`card-raised p-5 sm:p-6 ${TONE_BG[story.tone]}`}>
        <p className="eyebrow">{t("kicker")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold tabular-nums text-primary">{story.healthPct}%</p>
            <p className="mt-1 text-sm font-medium">{t("healthTitle")}</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t(`where_${story.caseId}`)}</p>
          </div>
          <Link href={story.doHref} className="btn btn-primary min-h-12 shrink-0">
            {t(story.doKey)}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </section>

      <ol className="grid gap-3">
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qWhere")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t(`where_${story.caseId}`)}</p>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">{t("qWrong")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t(`wrong_${story.caseId}`)}</p>
          {story.mainProblem ? (
            <p className="mt-2 text-sm text-muted-foreground">{story.mainProblem}</p>
          ) : null}
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qWhy")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t(`why_${story.caseId}`)}</p>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qDo")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t(`do_${story.caseId}`)}</p>
          <Link href={story.doHref} className="btn btn-primary mt-4 min-h-12 w-full sm:w-auto">
            {t(story.doKey)}
          </Link>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-success">{t("qNext")}</p>
          <p className="mt-1 text-sm leading-relaxed">{t(`next_${story.caseId}`)}</p>
          <p className="mt-3 text-sm font-medium">
            {t("progress", { done: story.progressDone, goal: story.progressGoal })}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, (story.progressDone / Math.max(story.progressGoal, 1)) * 100)}%` }}
            />
          </div>
        </li>
      </ol>

      <ExplainMetric
        label={t("moneyLabel")}
        value={`${money} TJS`}
        plain={
          story.notEnough && todaySales <= 0 ? t("moneyUnknown") : t("moneyPlain", { amount: money })
        }
        status={t(`moneyStatus_${story.caseId}`)}
        next={t(`do_${story.caseId}`)}
        advancedLabel={t("showDetails")}
        advanced={t("moneyAdvanced")}
        tone={story.tone}
      />

      {chosenItem ? (
        <article className="card-raised p-5 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground">{t("todayPath")}</p>
          <h2 className="mt-1 text-base font-semibold">{chosenItem.title}</h2>
          <SuggestionPath steps={suggestionSteps(chosenItem).map((row) => shortLine(row, 88))} heading={t("qDo")} />
        </article>
      ) : null}

      {!simple ? (
        <section className="card-raised p-5 sm:p-6">
          <p className="eyebrow">{tw("modulesKicker")}</p>
          <h2 className="display-3 mt-1">{tw(pack.titleKey)}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {pack.nodes.map((node) => (
              <li key={node.key}>
                <Link href={node.href} className="flex min-h-12 items-center justify-between border border-border px-4 text-sm">
                  {tw(`nav.${node.key}`)}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
