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
        y: 10,
        duration: 0.45,
        ease: EASE,
        stagger: 0.06,
        clearProps: "transform",
      });
    }, node);
    return () => {
      ctx.revert();
      restoreVisible(items);
    };
  }, []);

  return (
    <section ref={root} className="relative border-b border-border bg-background">
      <div className="gutter-x relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
        <div className="min-w-0 max-w-full">
          <p data-hero className="text-sm font-medium text-muted-foreground">
            {t("kicker")}
          </p>
          <h1 data-hero className="display-1 mt-4 w-full max-w-xl text-ink">
            {t("title")}
          </h1>
          <p data-hero className="lead mt-5 w-full max-w-lg">
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
            <MotionLink href="/login" className="btn btn-ghost w-full md:w-auto">
              {t("ctaLogin")}
            </MotionLink>
          </div>
          <p data-hero className="mt-4 max-w-full text-sm text-muted-foreground">
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
