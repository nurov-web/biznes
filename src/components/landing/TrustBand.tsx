"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function TrustBand() {
  const t = useTranslations("landing");
  const isKeys = ["is1", "is2", "is3", "is4"] as const;
  const notKeys = ["not1", "not2", "not3", "not4"] as const;

  return (
    <section className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-20">
      <Reveal>
        <p className="eyebrow text-primary">{t("honestEyebrow")}</p>
        <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("honestTitle")}</h2>
        <p className="lead mt-4 max-w-2xl">{t("honestLead")}</p>
      </Reveal>
      <Reveal stagger className="mt-9 grid gap-4 md:grid-cols-2">
        <div className="card-raised p-4 sm:p-6">
          <p className="text-sm font-semibold">{t("isTitle")}</p>
          <ul className="mt-4 space-y-3">
            {isKeys.map((k) => (
              <li key={k} className="flex min-w-0 gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e7f6ee] text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="min-w-0">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-raised p-4 sm:p-6">
          <p className="text-sm font-semibold">{t("notTitle")}</p>
          <ul className="mt-4 space-y-3">
            {notKeys.map((k) => (
              <li key={k} className="flex min-w-0 gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#fdeceb] text-destructive">
                  <X className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="min-w-0">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
