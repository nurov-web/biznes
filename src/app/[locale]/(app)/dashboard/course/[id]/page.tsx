"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PILOT_MODULES } from "@/constants/pilot-course";
import { isModuleOpen, PILOT_PASS_SCORE } from "@/constants/pilot";
import { PageShell } from "@/components/PageShell";
import { monthlyRevenue, splitVolume } from "@/lib/pilot-volume";
import type { PilotProfileRow } from "@/lib/store";

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
  const [key, setKey] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<PilotProfileRow | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/pilot/state", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { profile?: PilotProfileRow; progress?: number[] } | null) => {
        setProfile(d?.profile ?? null);
        setProgress(d?.progress ?? []);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  if (!module) {
    return (
      <PageShell title={t("missing")}>
        <button type="button" className="btn btn-ghost min-h-12" onClick={() => router.push("/dashboard")}>
          {t("backDash")}
        </button>
      </PageShell>
    );
  }

  if (!ready) {
    return <p className="p-8 text-sm text-muted-foreground">{t("saving")}</p>;
  }

  if (!isModuleOpen(module.id, progress)) {
    return (
      <PageShell title={tc(module.titleKey)}>
        <p className="text-sm text-muted-foreground">{t("moduleLocked")}</p>
        <button type="button" className="btn btn-primary min-h-12 w-fit" onClick={() => router.push("/dashboard")}>
          {t("backDash")}
        </button>
      </PageShell>
    );
  }

  async function check() {
    if (!module) return;
    setBusy(true);
    try {
      const ordered = module.questions.map((_, i) => answers[i] ?? -1);
      const response = await fetch("/api/pilot/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: module.id, answers: ordered }),
      });
      const json = (await response.json()) as { score?: number; correct?: number[]; error?: string };
      const finalScore = typeof json.score === "number" ? json.score : 0;
      setScore(finalScore);
      setKey(json.correct ?? []);
      setSubmitted(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title={tc(module.titleKey)}>
      <button type="button" className="btn btn-ghost min-h-12 w-fit" onClick={() => router.push("/dashboard")}>
        {t("backDash")}
      </button>
      <article className="card-raised whitespace-pre-wrap p-5 text-sm leading-relaxed">{tc(module.contentKey)}</article>
      {profile ? (
        <article className="card-raised tone-edge border-l-primary p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("applyTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {tc(module.applyKey, {
              product: profile.product,
              region: profile.region,
              price: profile.price,
              volume: `${splitVolume(profile.volume).amount} ${t(`units.${splitVolume(profile.volume).unit}`)}`,
              revenue: monthlyRevenue(profile.volume, profile.price),
            })}
          </p>
        </article>
      ) : null}
      <h2 className="display-3 mt-2">{t("quiz")}</h2>
      {module.questions.map((q, i) => (
        <fieldset key={q.q} className="card-raised p-4">
          <legend className="font-medium">
            {i + 1}. {tc(q.q)}
          </legend>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, j) => {
              const picked = answers[i] === j;
              const right = submitted && key[i] === j;
              const wrong = submitted && picked && key[i] !== j;
              return (
                <label key={opt} className="flex min-h-12 items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`q${i}`}
                    className="h-4 w-4 accent-[color:var(--primary)]"
                    checked={picked}
                    disabled={submitted || busy}
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
          disabled={busy || Object.keys(answers).length < module.questions.length}
          onClick={() => void check()}
        >
          {busy ? t("saving") : t("check")}
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
                  setKey([]);
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
