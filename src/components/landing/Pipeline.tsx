"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, reducedMotion, ScrollTrigger } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";

const STEPS = ["p1", "p2", "p3", "p4", "p5"] as const;

export function Pipeline() {
  const t = useTranslations("landing");
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const node = root.current;
    if (!node || reducedMotion()) return;
    const rows = node.querySelectorAll<HTMLElement>("[data-step]");
    const triggers: ScrollTrigger[] = [];
    rows.forEach((row, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          end: "bottom 42%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        }),
      );
    });
    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  useEffect(() => {
    if (reducedMotion()) return;
    const bar = root.current?.querySelector<HTMLElement>("[data-progress]");
    if (!bar) return;
    gsap.to(bar, {
      scaleY: (active + 1) / STEPS.length,
      duration: 0.5,
      ease: "power2.out",
      transformOrigin: "top center",
    });
  }, [active]);

  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-24">
      <div ref={root} className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="eyebrow">{t("pipeEyebrow")}</p>
            <h2 className="display-2 mt-3 text-balance">{t("pipeTitle")}</h2>
            <p className="lead mt-4">{t("pipeLead")}</p>
            <p className="num mt-8 text-sm text-muted-foreground">
              {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </p>
          </Reveal>
        </div>

        <div className="relative">
          <span className="absolute left-[15px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border sm:block" aria-hidden />
          <span
            data-progress
            className="absolute left-[15px] top-2 hidden h-[calc(100%-1rem)] w-px origin-top scale-y-0 bg-primary sm:block"
            aria-hidden
          />
          <ol className="space-y-3">
            {STEPS.map((key, i) => (
              <li key={key} data-step>
                <div
                  className={`relative flex gap-4 border p-5 sm:pl-14 ${
                    active === i ? "border-border bg-card" : "border-transparent bg-transparent"
                  }`}
                >
                  <span
                    className={`num absolute left-0 top-5 hidden h-8 w-8 place-items-center border text-xs font-semibold sm:grid ${
                      active === i
                        ? "border-ink bg-ink text-white"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="display-3">{t(`${key}t`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`${key}d`)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
