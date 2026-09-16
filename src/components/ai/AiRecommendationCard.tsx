"use client";

import { useState, type ReactNode } from "react";
import type { PilotDifficulty } from "@/lib/store";
import type { AiRecommendationCardModel } from "@/types/ai-recommendation";

type Props = {
  model: AiRecommendationCardModel;
  pathLabel?: string;
  difficulty?: PilotDifficulty;
  difficultyLabel?: string;
  sectionWhat: string;
  sectionWhy: string;
  sectionData: string;
  sectionRisk: string;
  sectionNext: string;
  sectionResult: string;
  metricKnown: string;
  metricUnknown: string;
  doLabel: string;
  seeWhyLabel: string;
  changeLabel: string;
  dismissLabel: string;
  onDo: () => void;
  onChange?: () => void;
  onDismiss?: () => void;
  busy?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
};

/** WHAT → WHY → DATA → RISK → NEXT → RESULT + 4 тугма. */
export function AiRecommendationCard({
  model,
  pathLabel,
  difficulty,
  difficultyLabel,
  sectionWhat,
  sectionWhy,
  sectionData,
  sectionRisk,
  sectionNext,
  sectionResult,
  metricKnown,
  metricUnknown,
  doLabel,
  seeWhyLabel,
  changeLabel,
  dismissLabel,
  onDo,
  onChange,
  onDismiss,
  busy = false,
  disabled = false,
  footer,
}: Props) {
  const [openWhy, setOpenWhy] = useState(false);
  const tone: Record<PilotDifficulty, string> = {
    easy: "text-muted-foreground",
    medium: "text-muted-foreground",
    hard: "text-foreground",
  };

  const forecast =
    typeof model.forecastSomoni === "number" && model.forecastSomoni > 0
      ? metricKnown
      : metricUnknown;

  return (
    <article className="card-raised p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {pathLabel ? <p className="num text-xs text-muted-foreground">{pathLabel}</p> : null}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{sectionWhat}</p>
          <h2 className="mt-1 text-base font-semibold">{model.what}</h2>
        </div>
        {difficulty && difficultyLabel ? (
          <span className={`chip shrink-0 text-xs ${tone[difficulty]}`}>{difficultyLabel}</span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <section className={openWhy ? "rounded-lg bg-primary-soft/50 p-3" : undefined}>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{sectionWhy}</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">{model.why}</p>
        </section>
        {model.data ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{sectionData}</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">{model.data}</p>
          </section>
        ) : null}
        {model.risk ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-warning">{sectionRisk}</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">{model.risk}</p>
          </section>
        ) : null}
        {model.steps.length > 0 ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{sectionNext}</p>
            <ol className="mt-2 grid gap-2">
              {model.steps.map((text, index) => (
                <li key={`${index}-${text.slice(0, 20)}`} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 leading-snug text-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {model.result ? (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{sectionResult}</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">{model.result}</p>
          </section>
        ) : null}
      </div>

      <p className="num mt-4 text-sm font-medium text-primary">{forecast}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          className="btn btn-primary min-h-12 sm:flex-1"
          disabled={disabled || busy}
          onClick={onDo}
        >
          {busy ? "…" : doLabel}
        </button>
        <button
          type="button"
          className="btn btn-ghost min-h-12"
          disabled={disabled}
          onClick={() => setOpenWhy((v) => !v)}
        >
          {seeWhyLabel}
        </button>
        {onChange ? (
          <button type="button" className="btn btn-ghost min-h-12" disabled={disabled || busy} onClick={onChange}>
            {changeLabel}
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" className="btn btn-ghost min-h-12" disabled={disabled} onClick={onDismiss}>
            {dismissLabel}
          </button>
        ) : null}
      </div>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </article>
  );
}
