"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";

export function CtaBand() {
  const t = useTranslations("landing");
  return (
    <section className="section-dark relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 blueprint-dark fade-edges" />
      <div className="pointer-events-none absolute inset-0 glow-primary" />
      <Reveal className="relative mx-auto max-w-3xl px-4 py-20 text-center md:py-24">
        <h2 className="display-2 text-balance text-white">{t("ctaTitle")}</h2>
        <p className="lead mx-auto mt-4 max-w-xl text-dark-muted">{t("ctaBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <MotionLink href="/register" className="btn btn-light">
            {t("cta")}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </MotionLink>
          <MotionLink href="/login" className="btn btn-dark">
            {t("ctaLogin")}
          </MotionLink>
        </div>
        <p className="mt-4 text-sm text-[#6d7d97]">{t("trial")}</p>
      </Reveal>
    </section>
  );
}
