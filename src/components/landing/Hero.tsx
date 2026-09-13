import { useTranslations } from "next-intl";
import { ArrowRight, Rocket, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("landing");

  return (
    <section className="relative min-w-0">
      <div className="gutter-x relative mx-auto w-full min-w-0 max-w-3xl py-16 sm:py-24 lg:py-28">
        <div className="chip chip-dark font-medium text-dark-accent">
          <svg width="20" height="20" viewBox="0 0 64 64" className="shrink-0" aria-hidden>
            <path
              d="M14 42 24 30 32 38 50 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("kicker")}
        </div>
        <h1 className="display-1 mt-5 w-full text-balance text-white">{t("title")}</h1>
        <p className="lead mt-5 max-w-xl text-dark-muted">{t("subtitle")}</p>
        <div className="hero-actions mt-9 flex w-full min-w-0 flex-col gap-3 sm:flex-row">
          <Link href="/has-business" className="btn btn-light min-h-12 w-full sm:w-auto">
            <Store className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaHas")}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </Link>
          <Link href="/start-business" className="btn btn-primary min-h-12 w-full sm:w-auto">
            <Rocket className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {t("ctaStart")}
          </Link>
        </div>
      </div>
    </section>
  );
}
