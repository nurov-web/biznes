import { useTranslations } from "next-intl";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Link } from "@/i18n/navigation";

const FOOT_LINK =
  "inline-flex min-h-12 items-center text-sm text-dark-muted transition-colors hover:text-white";

/** Поёни сайт — ҳамон сиёҳи сарлавҳа, на хати холӣ. */
export function MarketingFooter() {
  const t = useTranslations("landing");
  const tn = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-[var(--dark-bg)] text-[var(--dark-text)]">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-12 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:py-14 sm:pb-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.9fr))]">
          <div className="min-w-0">
            <Link href="/" className="inline-flex" aria-label={tn("brand")}>
              <BrandLockup size={22} dark />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-dark-muted">{t("subtitle")}</p>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-dark-muted">{t("footerNote")}</p>
          </div>

          <nav className="grid min-w-0 content-start" aria-label={t("colProduct")}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/45">{t("colProduct")}</p>
            <Link href={{ pathname: "/", hash: "how" }} className={FOOT_LINK}>
              {tn("how")}
            </Link>
            <Link href={{ pathname: "/", hash: "faq" }} className={FOOT_LINK}>
              {tn("faq")}
            </Link>
            <Link href="/has-business" className={FOOT_LINK}>
              {t("ctaHas")}
            </Link>
            <Link href="/start-business" className={FOOT_LINK}>
              {t("ctaStart")}
            </Link>
          </nav>

          <nav className="grid min-w-0 content-start" aria-label={t("colAccount")}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/45">{t("colAccount")}</p>
            <Link href="/login" className={FOOT_LINK}>
              {tn("login")}
            </Link>
            <Link href="/register" className={FOOT_LINK}>
              {tn("register")}
            </Link>
            <Link href="/legal/terms" className={FOOT_LINK}>
              {tn("terms")}
            </Link>
            <Link href="/legal/privacy" className={FOOT_LINK}>
              {tn("privacy")}
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-dark-muted">
            © {year} {tn("brand")}. {t("footerLegal")}
          </p>
          <LanguageSwitch className="seg-on-dark" />
        </div>
      </div>
    </footer>
  );
}
