"use client";

import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("landing");
  const steps = [
    { title: t("s1t"), detail: t("s1d") },
    { title: t("s2t"), detail: t("s2d") },
    { title: t("s3t"), detail: t("s3d") },
  ];
  return (
    <section className="gutter-x mx-auto w-full max-w-3xl py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("howEyebrow")}</p>
      <h2 className="display-2 mt-2">{t("howTitle")}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("howLead")}</p>
      <ol className="mt-8 grid list-none gap-3 p-0">
        {steps.map((step, i) => (
          <li key={step.title} className="flex min-h-12 gap-4 rounded-xl border border-border px-4 py-4">
            <span className="num mt-0.5 w-6 shrink-0 text-sm font-semibold text-primary">{i + 1}</span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
