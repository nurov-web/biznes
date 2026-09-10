"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { BrandMark } from "@/components/ui/BrandMark";
import { EASE, gsap, restoreVisible, shouldSkipIntro } from "@/lib/gsap";
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

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const head = node.querySelectorAll<HTMLElement>("[data-auth-head] > *");
    const fields = node.querySelectorAll<HTMLElement>("form > *");
    const foot = node.querySelectorAll<HTMLElement>("[data-auth-foot]");
    const panel = node.querySelectorAll<HTMLElement>("[data-auth-panel] > *");
    const all = [...head, ...fields, ...foot, ...panel];

    if (shouldSkipIntro()) {
      restoreVisible(all);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE, clearProps: "transform" } });
      tl.from(head, { y: 14, duration: 0.5, stagger: 0.07 })
        .from(fields, { y: 12, duration: 0.42, stagger: 0.055 }, "-=0.24")
        .from(foot, { y: 8, duration: 0.35 }, "-=0.12")
        .from(panel, { y: 16, duration: 0.5, stagger: 0.08 }, 0.15);
    }, node);
    return () => {
      ctx.revert();
      restoreVisible(all);
    };
  }, []);

  return (
    <div ref={root} className="grid min-h-screen min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="gutter-x flex min-w-0 flex-col py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-[0.9375rem] font-semibold tracking-tight">
            <BrandMark size={32} />
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
                <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-[12px] font-semibold text-dark-accent">
                  {i + 1}
                </span>
                <span className="max-w-sm text-sm leading-relaxed text-dark-muted">{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-dark-muted">{t("footerLegal")}</p>
        </div>
      </aside>
    </div>
  );
}
