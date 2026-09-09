"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { MotionLink } from "@/components/motion/MotionLink";
import { TARIFFS } from "@/constants";

export function Pricing() {
  const t = useTranslations("landing");
  const rows = [
    { id: TARIFFS[0].id, price: TARIFFS[0].priceTjs, blurb: "st1", features: ["pf1", "pf2", "pf3"] },
    { id: TARIFFS[1].id, price: TARIFFS[1].priceTjs, blurb: "st2", features: ["pf4", "pf5", "pf6"] },
    { id: TARIFFS[2].id, price: TARIFFS[2].priceTjs, blurb: "st3", features: ["pf7", "pf8", "pf9"] },
  ] as const;

  return (
    <section id="pricing" className="border-y border-border bg-surface">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-20">
        <Reveal>
          <p className="eyebrow text-primary">{t("prices")}</p>
          <h2 className="display-2 mt-3 text-balance">{t("priceHead")}</h2>
          <p className="lead mt-4 max-w-xl">{t("trial")}</p>
        </Reveal>
        <Reveal stagger className="mt-9 grid gap-4 md:grid-cols-3">
          {rows.map((row, i) => {
            const featured = i === 1;
            return (
              <article
                key={row.id}
                className={`relative flex flex-col rounded-2xl border p-5 transition-shadow duration-200 sm:p-6 ${
                  featured
                    ? "border-primary bg-card shadow-[var(--shadow-lg)]"
                    : "border-border bg-card shadow-[var(--shadow-xs)]"
                }`}
              >
                {featured ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-primary">
                    {t("popular")}
                  </span>
                ) : null}
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.id}
                </h3>
                <p className="num mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {row.price}
                  <span className="ml-1.5 font-sans text-sm font-normal text-muted-foreground">
                    {t("perMonth")}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(row.blurb)}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {row.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm leading-relaxed">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                      {t(f)}
                    </li>
                  ))}
                </ul>
                <MotionLink
                  href="/register"
                  className={`btn mt-6 w-full ${featured ? "btn-primary" : "btn-ghost"}`}
                >
                  {t("cta")}
                </MotionLink>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
