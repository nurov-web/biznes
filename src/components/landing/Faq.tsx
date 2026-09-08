"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const ITEMS = ["q1", "q2", "q3", "q4", "q5"] as const;

export function Faq() {
  const t = useTranslations("landing");
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <Reveal>
        <p className="eyebrow text-primary">{t("faqEyebrow")}</p>
        <h2 className="display-2 mt-3 text-balance">{t("faqTitle")}</h2>
      </Reveal>
      <Reveal stagger className="mt-8 divide-y divide-border border-y border-border">
        {ITEMS.map((key) => (
          <details key={key} className="group py-4">
            <summary className="flex list-none items-start justify-between gap-4 text-left">
              <span className="text-base font-medium leading-snug">{t(`${key}q`)}</span>
              <Plus
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                strokeWidth={2}
                aria-hidden
              />
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t(`${key}a`)}
            </p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
