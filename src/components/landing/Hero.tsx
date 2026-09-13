"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { EASE, gsap, restoreVisible, shouldSkipIntro } from "@/lib/gsap";
import { MotionLink } from "@/components/motion/MotionLink";
import { ProductPreview } from "@/components/landing/ProductPreview";

export function Hero() {
  const t = useTranslations("landing");
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const items = node.querySelectorAll<HTMLElement>("[data-hero]");
    if (shouldSkipIntro()) {
      restoreVisible(items);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 14,
        duration: 0.55,
        ease: EASE,
        stagger: 0.07,
        clearProps: "transform",
      });
    }, node);
    return () => {
      ctx.revert();
      restoreVisible(items);
    };
  }, []);

  return (
    <section ref={root} className="relative min-w-0">
      <div className="gutter-x relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:py-28">
        <div className="w-full min-w-0 max-w-full">
          <p data-hero className="chip chip-dark font-medium text-dark-accent">
            {t("kicker")}
          </p>
          <h1 data-hero className="display-1 mt-5 w-full max-w-xl text-balance text-white">
            {t("title")}
          </h1>
          <p data-hero className="lead mt-5 w-full max-w-full text-dark-muted md:max-w-lg">
            {t("subtitle")}
          </p>
          <div
            data-hero
            className="hero-actions mt-9 flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap"
          >
            <MotionLink href="/register" className="btn btn-light w-full md:w-auto">
              {t("cta")}
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            </MotionLink>
            <MotionLink href="/login" className="btn btn-dark w-full md:w-auto">
              {t("ctaLogin")}
            </MotionLink>
          </div>
          <p data-hero className="mt-4 max-w-full text-sm text-dark-muted">
            {t("trial")}
          </p>
        </div>
        <div className="w-full min-w-0 max-w-full overflow-hidden" data-hero>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
