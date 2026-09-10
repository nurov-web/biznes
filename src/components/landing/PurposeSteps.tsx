"use client";

import { useTranslations } from "next-intl";

/** Се қадами оддӣ — бе жаргон. */
export function PurposeSteps() {
  const t = useTranslations("landing");
  const steps = [
    { title: t("s1t"), text: t("s1d") },
    { title: t("s2t"), text: t("s2d") },
    { title: t("s3t"), text: t("s3d") },
  ];
  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-14 md:py-20">
      <p className="eyebrow">{t("howEyebrow")}</p>
      <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("howTitle")}</h2>
      <p className="lead mt-4 max-w-2xl">{t("howLead")}</p>
      <ol className="mt-9 grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="card-raised p-5 sm:p-6">
            <span className="num grid h-8 w-8 place-items-center border border-border text-xs font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <p className="mt-4 text-sm font-semibold">{step.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
