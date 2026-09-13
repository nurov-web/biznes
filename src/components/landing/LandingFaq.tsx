"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function LandingFaq() {
  const t = useTranslations("landing");
  const items = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section className="gutter-x mx-auto w-full max-w-3xl py-12 sm:py-16">
      <h2 className="display-2">{t("faqTitle")}</h2>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {items.map((item, i) => {
          const expanded = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : i)}
              >
                {item.q}
              </button>
              {expanded ? (
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
