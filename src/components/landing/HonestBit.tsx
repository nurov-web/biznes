"use client";

import { useTranslations } from "next-intl";

export function HonestBit() {
  const t = useTranslations("landing");
  const does = [t("is1"), t("is2"), t("is3")] as const;
  const nots = [t("not1"), t("not4")] as const;
  return (
    <section className="gutter-x mx-auto w-full max-w-3xl py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("honestEyebrow")}</p>
      <h2 className="display-2 mt-2">{t("honestTitle")}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("honestLead")}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">{t("isTitle")}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground">
            {does.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{t("notTitle")}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted-foreground">
            {nots.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
