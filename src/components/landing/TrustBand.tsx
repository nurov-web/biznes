"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { WorkSlider } from "@/components/motion/WorkSlider";

export function TrustBand() {
  const t = useTranslations("landing");
  const isKeys = ["is1", "is2", "is3", "is4"] as const;
  const notKeys = ["not1", "not2", "not3", "not4"] as const;

  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-20">
      <Reveal>
        <p className="eyebrow text-primary">{t("honestEyebrow")}</p>
        <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("honestTitle")}</h2>
        <p className="lead mt-4 max-w-2xl">{t("honestLead")}</p>
      </Reveal>
      <div className="mt-9 grid gap-8 md:grid-cols-2 md:gap-10">
        <Reveal>
          <p className="mb-4 text-sm font-semibold">{t("isTitle")}</p>
          <WorkSlider
            label={t("isTitle")}
            prevLabel={t("prevSlide")}
            nextLabel={t("nextSlide")}
            formatStatus={(current, total) => t("slideStatus", { current, total })}
            slides={isKeys.map((k) => ({
              id: k,
              node: (
                <div data-slide-body className="card-raised min-h-[8.5rem] p-5">
                  <Check className="h-4 w-4 text-success" strokeWidth={1.75} aria-hidden />
                  <p className="mt-3 text-sm leading-relaxed">{t(k)}</p>
                </div>
              ),
            }))}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mb-4 text-sm font-semibold">{t("notTitle")}</p>
          <WorkSlider
            label={t("notTitle")}
            prevLabel={t("prevSlide")}
            nextLabel={t("nextSlide")}
            formatStatus={(current, total) => t("slideStatus", { current, total })}
            slides={notKeys.map((k) => ({
              id: k,
              node: (
                <div data-slide-body className="card-raised min-h-[8.5rem] p-5">
                  <X className="h-4 w-4 text-destructive" strokeWidth={1.75} aria-hidden />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(k)}</p>
                </div>
              ),
            }))}
          />
        </Reveal>
      </div>
    </section>
  );
}
