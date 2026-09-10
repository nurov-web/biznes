"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LearnMindQuiz } from "@/components/learn/LearnMindQuiz";
import { LearnPath, type PathUnit } from "@/components/learn/LearnPath";
import { LearnNextActions } from "@/components/learn/LearnNextActions";
import { Icon } from "@/components/ui/Icon";

type Diagnosis = {
  title: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  firstAdvice: string;
  usedAi: boolean;
  aiError: string | null;
};

type LearnSnap = {
  xp: number;
  streak: number;
  completedLessonIds: string[];
  nextLessonId: string | null;
  totalLessons: number;
  intro: string;
  needsDiagnosis: boolean;
  diagnosis: Diagnosis | null;
  units: PathUnit[];
};

export default function LearnPage() {
  const t = useTranslations("learn");
  const locale = useLocale();
  const [data, setData] = useState<LearnSnap | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/learn?locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: LearnSnap | null) => {
        if (!json) {
          setError(true);
          return;
        }
        setData(json);
      })
      .catch(() => setError(true));
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return <p className="p-8 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  if (data.needsDiagnosis) {
    return (
      <PageShell title={t("diagTitle")} lead={t("diagLead")} eyebrow={t("kicker")}>
        <LearnMindQuiz onDone={load} />
      </PageShell>
    );
  }

  const done = data.completedLessonIds.length;
  const pct = data.totalLessons ? Math.round((done / data.totalLessons) * 100) : 0;

  return (
    <PageShell title={t("title")} lead={data.intro} eyebrow={t("kicker")}>
      {data.diagnosis ? (
        <article className="card-raised p-4 sm:p-6">
          <p className="eyebrow text-primary">{t("diagResult")}</p>
          <h2 className="display-3 mt-1">{data.diagnosis.title}</h2>
          <p className="mt-2 text-sm leading-relaxed">{data.diagnosis.summary}</p>
          <p className="mt-3 text-sm font-medium">{data.diagnosis.firstAdvice}</p>
          {data.diagnosis.strengths.length || data.diagnosis.gaps.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.diagnosis.strengths.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("diagStrengths")}</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {data.diagnosis.strengths.map((item) => (
                      <li key={item}>— {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {data.diagnosis.gaps.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("diagGaps")}</p>
                  <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {data.diagnosis.gaps.map((item) => (
                      <li key={item}>— {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          <p className="mt-3 text-xs text-muted-foreground">
            {data.diagnosis.usedAi
              ? t("diagAiOn")
              : data.diagnosis.aiError === "bad_key"
                ? t("diagAiBadKey")
                : data.diagnosis.aiError === "timeout"
                  ? t("diagAiTimeout")
                  : t("diagAiOff")}
          </p>
        </article>
      ) : null}

      <LearnNextActions />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="card-raised p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("xp")}</p>
          <p className="num mt-1 text-3xl font-semibold">{data.xp}</p>
        </article>
        <article className="card-raised p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <Icon icon={Flame} className="h-3.5 w-3.5 text-primary" />
            {t("streak")}
          </p>
          <p className="num mt-1 text-3xl font-semibold">{data.streak}</p>
        </article>
        <article className="card-raised p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("progress")}</p>
          <p className="num mt-1 text-3xl font-semibold">{pct}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </article>
      </section>

      <LearnPath
        units={data.units}
        nextLessonId={data.nextLessonId}
        unitLabel={t("unit")}
        xpLabel={t("xp")}
        recLabel={t("recommended")}
      />
    </PageShell>
  );
}
