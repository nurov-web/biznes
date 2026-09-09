"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";
import { isLocaleSwap } from "@/lib/locale-swap";
import { MotionLink } from "@/components/motion/MotionLink";
import { ProductPreview } from "@/components/landing/ProductPreview";

export function Hero() {
  const t = useTranslations("landing");
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const items = node.querySelectorAll<HTMLElement>("[data-hero]");
    if (reducedMotion() || isLocaleSwap() || window.matchMedia("(max-width: 767.98px)").matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.62, ease: EASE, stagger: 0.085 },
      );
    }, node);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="section-dark relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 blueprint-dark fade-edges" />
      <div className="pointer-events-none absolute inset-0 glow-primary" />
      <div className="gutter-x relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-8 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:py-24">
        <div className="min-w-0 max-w-full">
          <span data-hero className="chip chip-dark max-w-full">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0">{t("kicker")}</span>
          </span>
          <h1
            data-hero
            className="display-1 mt-5 w-full max-w-xl text-white"
          >
            {t("title")}
          </h1>
          <p
            data-hero
            className="lead mt-5 w-full max-w-lg text-dark-text/80"
          >
            {t("subtitle")}
          </p>
          <div
            data-hero
            className="hero-actions mt-8 flex w-full min-w-0 flex-col gap-3 md:flex-row md:flex-wrap"
          >
            <MotionLink href="/register" className="btn btn-primary w-full md:w-auto">
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
