"use client";

import { useTranslations } from "next-intl";
import { BookOpen, MessageCircle, Store, Wallet } from "lucide-react";
import { WorkSlider } from "@/components/motion/WorkSlider";

/** Чӣ лозим аст ба соҳибкор — слайдер, на рӯйхати хушк. */
export function UseSlider() {
  const t = useTranslations("landing");
  const slides = [
    { id: "course", icon: BookOpen, title: t("use1t"), lead: t("use1d") },
    { id: "plan", icon: Wallet, title: t("use2t"), lead: t("use2d") },
    { id: "shop", icon: Store, title: t("use3t"), lead: t("use3d") },
    { id: "chat", icon: MessageCircle, title: t("use4t"), lead: t("use4d") },
  ] as const;

  return (
    <section className="gutter-x mx-auto w-full max-w-3xl py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("useEyebrow")}</p>
      <h2 className="display-2 mt-2">{t("useTitle")}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("useLead")}</p>
      <div className="mt-8">
        <WorkSlider
          label={t("sliderLabel")}
          prevLabel={t("prevSlide")}
          nextLabel={t("nextSlide")}
          formatStatus={(current, total) => t("slideStatus", { current, total })}
          slides={slides.map((slide) => ({
            id: slide.id,
            node: (
              <article
                data-slide-body
                className="mx-auto max-w-lg rounded-2xl border border-border bg-card px-6 py-8"
              >
                <slide.icon className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{slide.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{slide.lead}</p>
              </article>
            ),
          }))}
        />
      </div>
    </section>
  );
}
