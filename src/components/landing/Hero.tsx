"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Rocket, Store } from "lucide-react";
import { EASE, gsap, restoreVisible, shouldSkipIntro } from "@/lib/gsap";
import { MotionLink } from "@/components/motion/MotionLink";
import { InkMark } from "@/components/motion/InkMark";

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
      <div className="gutter-x relative mx-auto w-full min-w-0 max-w-3xl py-16 sm:py-24 lg:py-28">
        <div data-hero className="chip chip-dark font-medium text-dark-accent">
          <InkMark />
          {t("kicker")}
        </div>
        <h1 data-hero className="display-1 mt-5 w-full text-balance text-white">
          {t("title")}
        </h1>
        <p data-hero className="lead mt-5 max-w-xl text-dark-muted">
          {t("subtitle")}
        </p>
        <div data-hero className="hero-actions mt-9 flex w-full min-w-0 flex-col gap-3 sm:flex-row">
          <MotionLink href="/has-business" className="btn btn-light min-h-12 w-full sm:w-auto">
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaHas")}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </MotionLink>
          <MotionLink href="/start-business" className="btn btn-primary min-h-12 w-full sm:w-auto">
            <Rocket className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaStart")}
          </MotionLink>
        </div>
      </div>
    </section>
  );
}
