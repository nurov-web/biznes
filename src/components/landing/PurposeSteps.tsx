"use client";

import { useTranslations } from "next-intl";

/** Се қадам бо рақами калон — бе чоҳи нишона. */
export function PurposeSteps() {
  const t = useTranslations("landing");
  const steps = [
    { n: "01", title: t("s1t"), text: t("s1d") },
    { n: "02", title: t("s2t"), text: t("s2d") },
    { n: "03", title: t("s3t"), text: t("s3d") },
  ];
  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-24">
      <p className="eyebrow text-primary">{t("howEyebrow")}</p>
      <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("howTitle")}</h2>
      <p className="lead mt-4 max-w-2xl">{t("howLead")}</p>
      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
        {steps.map((step) => (
          <li key={step.n} className="min-w-0 border-t border-border pt-6">
            <p className="step-index">{step.n}</p>
            <p className="mt-5 text-lg font-semibold tracking-tight">{step.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
