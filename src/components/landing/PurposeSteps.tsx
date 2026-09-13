"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { WorkSlider } from "@/components/motion/WorkSlider";

/** Се кори дӯкон — ҳар кадом як слайди аниматсия. */
export function PurposeSteps() {
  const t = useTranslations("landing");
  const steps = [
    { n: "01", title: t("s1t"), text: t("s1d") },
    { n: "02", title: t("s2t"), text: t("s2d") },
    { n: "03", title: t("s3t"), text: t("s3d") },
  ];

  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-24">
      <Reveal>
        <p className="eyebrow text-primary">{t("howEyebrow")}</p>
        <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("howTitle")}</h2>
        <p className="lead mt-4 max-w-2xl">{t("howLead")}</p>
      </Reveal>
      <Reveal className="mt-12">
        <WorkSlider
          label={t("howTitle")}
          prevLabel={t("prevSlide")}
          nextLabel={t("nextSlide")}
          formatStatus={(current, total) => t("slideStatus", { current, total })}
          slides={steps.map((step) => ({
            id: step.n,
            node: (
              <div data-slide-body className="border-t border-border pt-6 md:pt-8">
                <p className="step-index">{step.n}</p>
                <p className="mt-5 text-xl font-semibold tracking-tight md:text-2xl">{step.title}</p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  {step.text}
                </p>
              </div>
            ),
          }))}
        />
      </Reveal>
    </section>
  );
}
