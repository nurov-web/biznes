"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";
import { APP_NAME } from "@/constants";

type Props = {
  title: string;
  lead: string;
  children: ReactNode;
  footer: ReactNode;
  points: string[];
};

/** Саҳифаи вуруд/бақайдгирӣ: ду сутун ва кушода шудани пай дар пай. */
export function AuthShell({ title, lead, children, footer, points }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const t = useTranslations("landing");

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const head = node.querySelectorAll<HTMLElement>("[data-auth-head] > *");
    const fields = node.querySelectorAll<HTMLElement>("form > *");
    const foot = node.querySelectorAll<HTMLElement>("[data-auth-foot]");
    const panel = node.querySelectorAll<HTMLElement>("[data-auth-panel] > *");
    const all = [...head, ...fields, ...foot, ...panel];

    if (reducedMotion()) {
      gsap.set(all, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      tl.fromTo(head, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 })
        .fromTo(
          fields,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.42, stagger: 0.055 },
          "-=0.24",
        )
        .fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.35 }, "-=0.12")
        .fromTo(
          panel,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          0.15,
        );
    }, node);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="grid min-h-screen min-w-0 overflow-x-clip lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="gutter-x flex min-w-0 flex-col py-6">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-[0.9375rem] font-semibold tracking-tight">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
              <Compass className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </span>
            <span className="truncate">{APP_NAME}</span>
          </Link>
          <LanguageSwitch />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 sm:max-w-sm sm:py-10">
          <div data-auth-head>
            <h1 className="display-2">{title}</h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{lead}</p>
          </div>
          {children}
          <div data-auth-foot>{footer}</div>
        </div>
      </div>

      <aside className="section-dark relative hidden overflow-hidden lg:block">
        <div className="pointer-events-none absolute inset-0 blueprint-dark fade-edges" />
        <div className="pointer-events-none absolute inset-0 glow-primary" />
        <div
          data-auth-panel
          className="relative flex h-full flex-col justify-center gap-6 px-12 py-16"
        >
          <p className="eyebrow text-dark-accent">{t("honestEyebrow")}</p>
          <p className="display-2 max-w-md text-balance text-white">{t("ctaTitle")}</p>
          <ul className="mt-2 space-y-4">
            {points.map((point, i) => (
              <li key={point} className="flex gap-3.5">
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full border border-dark-border bg-[#101a2c] text-[11px] font-semibold text-dark-accent">
                  {i + 1}
                </span>
                <span className="max-w-sm text-sm leading-relaxed text-dark-muted">{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#6d7d97]">{t("footerLegal")}</p>
        </div>
      </aside>
    </div>
  );
}
