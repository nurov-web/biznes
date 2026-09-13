"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PILOT_MODULES } from "@/constants/pilot-course";
import { PILOT_PASS_SCORE } from "@/constants/pilot";
import { PageShell } from "@/components/PageShell";

export default function CourseModulePage() {
  const params = useParams<{ id: string }>();
  const moduleId = Number(params.id);
  const router = useRouter();
  const t = useTranslations("pilot");
  const tc = useTranslations("pilotCourse");
  const module = useMemo(() => PILOT_MODULES.find((m) => m.id === moduleId), [moduleId]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);

  if (!module) {
    return (
      <PageShell title={t("missing")}>
        <button type="button" className="btn btn-ghost min-h-12" onClick={() => router.push("/dashboard")}>
          {t("backDash")}
        </button>
      </PageShell>
    );
  }

  async function check() {
    if (!module) return;
    let correct = 0;
    module.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct += 1;
    });
    const finalScore = Math.round((correct / module.questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    if (finalScore < PILOT_PASS_SCORE) return;
    setBusy(true);
    await fetch("/api/pilot/progress", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: module.id, score: finalScore }),
    });
    setBusy(false);
  }

  return (
    <PageShell title={tc(module.titleKey)}>
      <button type="button" className="btn btn-ghost min-h-12 w-fit" onClick={() => router.push("/dashboard")}>
        {t("backDash")}
      </button>
      <article className="card-raised whitespace-pre-wrap p-5 text-sm leading-relaxed">{tc(module.contentKey)}</article>
      <h2 className="display-3 mt-2">{t("quiz")}</h2>
      {module.questions.map((q, i) => (
        <fieldset key={q.q} className="card-raised p-4">
          <legend className="font-medium">
            {i + 1}. {tc(q.q)}
          </legend>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, j) => {
              const picked = answers[i] === j;
              const right = submitted && j === q.correct;
              const wrong = submitted && picked && j !== q.correct;
              return (
                <label key={opt} className="flex min-h-12 items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q${i}`}
                    className="h-4 w-4 accent-[color:var(--primary)]"
                    checked={picked}
                    disabled={submitted}
                    onChange={() => setAnswers({ ...answers, [i]: j })}
                  />
                  <span className={right ? "font-medium text-ink" : wrong ? "text-destructive" : ""}>
                    {tc(opt)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!submitted ? (
        <button
          type="button"
          className="btn btn-primary min-h-12"
          disabled={Object.keys(answers).length < module.questions.length}
          onClick={() => void check()}
        >
          {t("check")}
        </button>
      ) : (
        <div className="card-raised p-6">
          <p className="num text-4xl font-semibold text-ink">{score}%</p>
          {score >= PILOT_PASS_SCORE ? (
            <>
              <p className="mt-2 font-medium">{t("passed")}</p>
              <button
                type="button"
                className="btn btn-primary mt-4 min-h-12"
                disabled={busy}
                onClick={() => router.push("/dashboard")}
              >
                {t("backDash")}
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">{t("retry")}</p>
              <button
                type="button"
                className="btn btn-primary mt-4 min-h-12"
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                }}
              >
                {t("retryBtn")}
              </button>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}
