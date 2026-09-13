"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";
import { WorkSlider } from "@/components/motion/WorkSlider";

export function CtaBand() {
  const t = useTranslations("landing");
  const jobs = [
    { n: "01", title: t("s1t"), text: t("s1d") },
    { n: "02", title: t("s2t"), text: t("s2d") },
    { n: "03", title: t("s3t"), text: t("s3d") },
  ];

  return (
    <section className="section-dark relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 glow-primary" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-dark-accent/15 blur-3xl" />
      </div>
      <Reveal className="gutter-x relative mx-auto max-w-3xl py-20 md:py-24">
        <h2 className="display-2 text-balance text-center text-white">{t("ctaTitle")}</h2>
        <p className="lead mx-auto mt-4 max-w-xl text-center text-dark-muted">{t("ctaBody")}</p>
        <div className="mt-10">
          <WorkSlider
            tone="dark"
            label={t("howTitle")}
            prevLabel={t("prevSlide")}
            nextLabel={t("nextSlide")}
            formatStatus={(current, total) => t("slideStatus", { current, total })}
            slides={jobs.map((job) => ({
              id: job.n,
              node: (
                <div data-slide-body className="px-1 text-center">
                  <p className="font-mono text-sm text-dark-accent">{job.n}</p>
                  <p className="mt-3 text-xl font-semibold text-white">{job.title}</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dark-muted">
                    {job.text}
                  </p>
                </div>
              ),
            }))}
          />
        </div>
        <div className="mt-8 flex w-full min-w-0 flex-col items-stretch justify-center gap-3 md:flex-row md:flex-wrap md:items-center">
          <MotionLink href="/register" className="btn btn-light w-full md:w-auto">
            {t("cta")}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </MotionLink>
          <MotionLink href="/login" className="btn btn-dark w-full md:w-auto">
            {t("ctaLogin")}
          </MotionLink>
        </div>
        <p className="mt-4 text-center text-sm text-dark-muted">{t("trial")}</p>
      </Reveal>
    </section>
  );
}
