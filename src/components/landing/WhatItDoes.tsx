import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

export function WhatItDoes() {
  const t = useTranslations("landing");
  const items = ["what1", "what2", "what3"] as const;
  return (
    <section className="gutter-x mx-auto w-full max-w-3xl py-12 sm:py-16">
      <h2 className="display-2">{t("whatTitle")}</h2>
      <ul className="mt-6 grid gap-3">
        {items.map((key) => (
          <li key={key} className="flex min-h-12 items-start gap-3 rounded-xl border border-border px-4 py-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={2} aria-hidden />
            <span className="text-sm leading-relaxed">{t(key)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
