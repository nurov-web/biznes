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
      <div className="flex min-w-0 items-center justify-between border-b border-border px-4 py-3">
        <p className="truncate text-[11px] font-medium text-muted-foreground">{t("window")}</p>
        <p className="text-[11px] text-muted-foreground">{t("sample")}</p>
      </div>
      <div className="space-y-2 p-4">
        <ul className="space-y-2">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-3 border border-border bg-background px-3 py-3">
              <span className="num grid h-6 w-6 shrink-0 place-items-center border border-border text-[11px] font-semibold text-muted-foreground">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
          <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          {t("flow")}
        </p>
      </div>
    </div>
  );
}
