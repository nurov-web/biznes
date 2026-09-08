"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";
import { MotionLink } from "@/components/motion/MotionLink";
import { ProductPreview } from "@/components/landing/ProductPreview";

export function Hero() {
  const t = useTranslations("landing");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const items = node.querySelectorAll<HTMLElement>("[data-hero]");
    if (reducedMotion()) {
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
    <section ref={root} className="section-dark relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 blueprint-dark fade-edges" />
      <div className="pointer-events-none absolute inset-0 glow-primary" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:py-24">
        <div>
          <span data-hero className="chip chip-dark" style={{ opacity: 0 }}>
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {t("kicker")}
          </span>
          <h1
            data-hero
            className="display-1 mt-5 max-w-xl text-balance text-white"
            style={{ opacity: 0 }}
          >
            {t("title")}
          </h1>
          <p
            data-hero
            className="lead mt-5 max-w-lg text-dark-muted"
            style={{ opacity: 0 }}
          >
            {t("subtitle")}
          </p>
          <div data-hero className="mt-8 flex flex-wrap gap-3" style={{ opacity: 0 }}>
            <MotionLink href="/register" className="btn btn-primary">
              {t("cta")}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </MotionLink>
            <MotionLink href="/login" className="btn btn-dark">
              {t("ctaLogin")}
            </MotionLink>
          </div>
          <p data-hero className="mt-4 text-sm text-[#6d7d97]" style={{ opacity: 0 }}>
            {t("trial")}
          </p>
        </div>
        <div data-hero style={{ opacity: 0 }}>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
