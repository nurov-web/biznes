import { useTranslations } from "next-intl";

export function LandingFaq() {
  const t = useTranslations("landing");
  const items = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ];

  return (
    <section id="faq" className="gutter-x mx-auto w-full max-w-3xl scroll-mt-24 py-12 sm:py-16">
      <h2 className="display-2">{t("faqTitle")}</h2>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {items.map((item, index) => (
          <details key={item.q} className="group" open={index === 0}>
            <summary className="flex min-h-12 w-full cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
