"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

/** Намунаи дафтар — на рақами дурӯғи дӯкони кас. */
export function ProductPreview() {
  const t = useTranslations("preview");
  const steps = [
    { n: "1", title: t("p1t"), text: t("p1d") },
    { n: "2", title: t("p2t"), text: t("p2d") },
    { n: "3", title: t("p3t"), text: t("p3d") },
  ];

  return (
    <div className="app-frame w-full max-w-full overflow-hidden select-none" aria-hidden>
      <div className="flex min-w-0 items-center gap-3 border-b border-dark-border px-3 py-3 sm:px-4">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
        </div>
        <p className="num min-w-0 truncate text-[11px] text-dark-muted">{t("window")}</p>
      </div>
      <div className="space-y-3 p-3 sm:p-5">
        <p className="text-[11px] uppercase tracking-[0.12em] text-dark-muted">{t("sample")}</p>
        <ul className="space-y-2.5">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-3 rounded-lg border border-dark-border bg-[#0c1421] p-3">
              <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#17243c] text-xs font-semibold text-dark-accent">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-dark-text">{step.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-dark-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 text-[11px] text-dark-muted">
          {t("flow")}
          <ArrowRight className="h-3 w-3 shrink-0" strokeWidth={2} />
        </p>
      </div>
    </div>
  );
}
