"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Rocket, Store } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";

/** Ҳамон ду тугмаи лендинг — пас аз интихоб вуруд. */
export default function BeginPage() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <div className="hero-ink flex min-h-screen w-full min-w-0 flex-col">
      <MarketingHeader tone="dark" />
      <section className="gutter-x mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
        <div className="hero-actions flex w-full flex-col gap-3">
          <a href={`/${locale}/has-business`} className="btn btn-light min-h-12 w-full">
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaHas")}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </a>
          <a href={`/${locale}/start-business`} className="btn btn-primary min-h-12 w-full">
            <Rocket className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaStart")}
          </a>
        </div>
      </section>
    </div>
  );
}
