"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Flame } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";

type LearnSnap = {
  xp: number;
  streak: number;
  completedLessonIds: string[];
  nextLessonId: string | null;
  totalLessons: number;
  intro: string;
  needsDiagnosis?: boolean;
};

export function LearnHero() {
  const t = useTranslations("learn");
  const locale = useLocale();
  const [data, setData] = useState<LearnSnap | null>(null);

  useEffect(() => {
    fetch(`/api/learn?locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: LearnSnap | null) => setData(json))
      .catch(() => undefined);
  }, [locale]);

  if (!data) return null;

  const done = data.completedLessonIds.length;
  const pct = data.totalLessons ? Math.round((done / data.totalLessons) * 100) : 0;
  const href = data.needsDiagnosis || !data.nextLessonId ? "/learn" : `/learn/${data.nextLessonId}`;

  return (
    <section className="card-raised overflow-hidden">
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="eyebrow text-primary">{t("kicker")}</p>
          <h2 className="display-3 mt-1">{t("heroTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.intro}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <p className="num text-sm">
              <span className="text-2xl font-semibold">{data.xp}</span>
              <span className="ml-1 text-xs text-muted-foreground">{t("xp")}</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon icon={Flame} className="h-4 w-4 text-primary" />
              <span className="num font-medium text-foreground">{data.streak}</span>
              {t("streak")}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="num font-medium text-foreground">
                {done}/{data.totalLessons}
              </span>{" "}
              {t("lessons")}
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link href={href} className="btn btn-primary">
          <Icon icon={BookOpen} className="h-4 w-4" />
          {data.needsDiagnosis ? t("startDiag") : done === 0 ? t("start") : data.nextLessonId ? t("continue") : t("review")}
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
