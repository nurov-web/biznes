"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { GsapStep } from "@/components/motion/GsapStep";
import { MIND_QUESTIONS } from "@/constants/mind-quiz";
import { parseLocale } from "@/lib/locale-query";

export function LearnMindQuiz({ onDone }: { onDone: () => void }) {
  const t = useTranslations("learn");
  const locale = parseLocale(useLocale());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const question = MIND_QUESTIONS[index];
  const total = MIND_QUESTIONS.length;

  async function pick(option: number) {
    if (!question || busy) return;
    const next = [...answers];
    next[index] = option;
    setAnswers(next);
    if (index < total - 1) {
      setIndex(index + 1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/learn/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next, locale }),
      });
      if (!response.ok) {
        setError(t("diagFail"));
        return;
      }
      onDone();
    } catch {
      setError(t("diagFail"));
    } finally {
      setBusy(false);
    }
  }

  if (!question) return null;

  return (
    <article className="card-raised overflow-hidden">
      <div className="flex gap-1 border-b border-border px-4 py-3 sm:px-6">
        {MIND_QUESTIONS.map((item, i) => (
          <span
            key={item.id}
            className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <div className="p-4 sm:p-6">
        <p className="eyebrow text-primary">{t("diagStep", { current: index + 1, total })}</p>
        <h2 className="display-3 mt-2">{t("diagTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("diagLead")}</p>
        <GsapStep step={index}>
          <p className="mt-5 text-sm font-medium sm:text-[15px]">{question.title[locale]}</p>
          <ul className="mt-4 grid gap-2">
            {question.options.map((option, i) => (
              <li key={option.tg}>
                <button
                  type="button"
                  className="btn btn-ghost min-h-12 w-full justify-between text-left"
                  disabled={busy}
                  onClick={() => void pick(i)}
                >
                  <span className="whitespace-normal">{option[locale]}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </GsapStep>
        {busy ? <p className="mt-4 text-sm text-muted-foreground">{t("diagRunning")}</p> : null}
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
