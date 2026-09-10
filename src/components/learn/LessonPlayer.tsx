"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, X } from "lucide-react";
import { GsapStep } from "@/components/motion/GsapStep";
import { Icon } from "@/components/ui/Icon";
import { findLesson } from "@/constants/academy";
import { parseLocale } from "@/lib/locale-query";
import { Link, useRouter } from "@/i18n/navigation";

type CheckResult = {
  correct: boolean;
  already: boolean;
  why: string;
  xp: number;
  nextLessonId: string | null;
};

export function LessonPlayer({ lessonId, locked }: { lessonId: string; locked: boolean }) {
  const t = useTranslations("learn");
  const locale = parseLocale(useLocale());
  const router = useRouter();
  const lesson = useMemo(() => findLesson(lessonId), [lessonId]);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [fail, setFail] = useState("");

  if (!lesson) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("missing")}{" "}
        <Link href="/learn" className="text-primary hover:underline">
          {t("backPath")}
        </Link>
      </p>
    );
  }

  if (locked) {
    return (
      <article className="card-raised p-6">
        <p className="text-sm leading-relaxed">{t("lockedLead")}</p>
        <Link href="/learn" className="btn btn-primary mt-4">
          {t("backPath")}
        </Link>
      </article>
    );
  }

  const teachCount = lesson.steps.length;
  const isQuiz = step >= teachCount;
  const teach = lesson.steps[step];

  async function submit(answerIndex: number) {
    setPicked(answerIndex);
    setBusy(true);
    setResult(null);
    setFail("");
    try {
      const response = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, answerIndex, locale }),
      });
      const json = (await response.json()) as CheckResult & { error?: string };
      if (!response.ok) {
        setFail(json.error === "locked" ? t("quizLocked") : t("quizError"));
        return;
      }
      setResult(json);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card-raised overflow-hidden">
      <div className="flex gap-1.5 border-b border-border px-4 py-3 sm:px-6">
        {Array.from({ length: teachCount + 1 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <div className="p-4 sm:p-6">
        <GsapStep step={step}>
          {!isQuiz && teach ? (
            <div>
              <p className="eyebrow text-primary">
                {t("stepOf", { current: step + 1, total: teachCount })}
              </p>
              <h2 className="display-3 mt-2">{teach.title[locale]}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-[15px]">{teach.body[locale]}</p>
              <button type="button" className="btn btn-primary mt-6" onClick={() => setStep(step + 1)}>
                {t("nextStep")}
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          ) : (
            <div>
              <p className="eyebrow text-primary">{t("check")}</p>
              <h2 className="display-3 mt-2">{lesson.quiz.question[locale]}</h2>
              <ul className="mt-5 grid gap-2">
                {lesson.quiz.options[locale].map((option, i) => {
                  const selected = picked === i;
                  const show = result && selected;
                  const good = show && result.correct;
                  const bad = show && !result.correct;
                  return (
                    <li key={option}>
                      <button
                        type="button"
                        disabled={busy || Boolean(result?.correct)}
                        onClick={() => void submit(i)}
                        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-200 ${
                          good
                            ? "border-success/40 bg-[#e7f6ee]"
                            : bad
                              ? "border-destructive/40 bg-[#fdeceb]"
                              : selected
                                ? "border-primary bg-primary-soft"
                                : "border-border hover:border-border-strong hover:bg-muted/40"
                        }`}
                      >
                        <span>{option}</span>
                        {good ? <Icon icon={Check} className="h-4 w-4 text-success" /> : null}
                        {bad ? <Icon icon={X} className="h-4 w-4 text-destructive" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {fail ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {fail}
                </p>
              ) : null}
              {result ? (
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{result.why}</p>
                  {result.correct ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.nextLessonId ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => router.push(`/learn/${result.nextLessonId}`)}
                        >
                          {t("nextLesson")}
                          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </button>
                      ) : (
                        <Link href="/learn" className="btn btn-primary">
                          {t("pathDone")}
                        </Link>
                      )}
                      <Link href="/learn" className="btn btn-ghost">
                        {t("backPath")}
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost mt-4"
                      onClick={() => {
                        setPicked(null);
                        setResult(null);
                      }}
                    >
                      {t("tryAgain")}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </GsapStep>
      </div>
    </article>
  );
}
