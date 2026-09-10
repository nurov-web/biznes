"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { LessonPlayer } from "@/components/learn/LessonPlayer";
import { findLesson } from "@/constants/academy";
import { parseLocale } from "@/lib/locale-query";
import { Link } from "@/i18n/navigation";

type LearnSnap = {
  needsDiagnosis?: boolean;
  completedLessonIds: string[];
  units: { lessons: { id: string; locked: boolean; title: string }[] }[];
};

export default function LessonPage() {
  const t = useTranslations("learn");
  const locale = parseLocale(useLocale());
  const params = useParams();
  const lessonId = String(params.lessonId ?? "");
  const lesson = findLesson(lessonId);
  const [locked, setLocked] = useState(true);
  const [needQuiz, setNeedQuiz] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`/api/learn?locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: LearnSnap | null) => {
        const node = json?.units.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
        const quiz = Boolean(json?.needsDiagnosis);
        setNeedQuiz(quiz);
        setLocked(quiz || Boolean(node?.locked));
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [lessonId, locale]);

  if (!lesson) {
    return (
      <PageShell title={t("title")}>
        <p className="text-sm text-muted-foreground">
          {t("missing")}{" "}
          <Link href="/learn" className="text-primary hover:underline">
            {t("backPath")}
          </Link>
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={lesson.title[locale]}
      lead={t("lessonLead")}
      action={
        <Link href="/learn" className="btn btn-ghost">
          {t("backPath")}
        </Link>
      }
    >
      {ready && needQuiz ? (
        <article className="card-raised p-6">
          <p className="text-sm leading-relaxed">{t("diagLead")}</p>
          <Link href="/learn" className="btn btn-primary mt-4">
            {t("startDiag")}
          </Link>
        </article>
      ) : ready ? (
        <LessonPlayer key={lessonId} lessonId={lessonId} locked={locked} />
      ) : (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      )}
    </PageShell>
  );
}
