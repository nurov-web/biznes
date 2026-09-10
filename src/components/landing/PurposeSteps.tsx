"use client";

import { useTranslations } from "next-intl";
import { Banknote, LayoutDashboard, Package } from "lucide-react";

/** Се қадами оддӣ — бе жаргон. */
export function PurposeSteps() {
  const t = useTranslations("landing");
  const steps = [
    { icon: Package, title: t("s1t"), text: t("s1d") },
    { icon: Banknote, title: t("s2t"), text: t("s2d") },
    { icon: LayoutDashboard, title: t("s3t"), text: t("s3d") },
  ];
  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-14 md:py-20">
      <p className="eyebrow text-primary">{t("howEyebrow")}</p>
      <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("howTitle")}</h2>
      <p className="lead mt-4 max-w-2xl">{t("howLead")}</p>
      <ol className="mt-9 grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => {
          const Glyph = step.icon;
          return (
            <li key={step.title} className="card-raised p-5 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Glyph className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold">
                {i + 1}. {step.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
