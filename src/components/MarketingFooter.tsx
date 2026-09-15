import { useTranslations } from "next-intl";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Link } from "@/i18n/navigation";

export function MarketingFooter() {
  const t = useTranslations("landing");
  const tn = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-background">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p>
              <BrandLockup size={22} />
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footerNote")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm" aria-label={t("colAccount")}>
            <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground">
              {tn("terms")}
            </Link>
            <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground">
              {tn("privacy")}
            </Link>
            <Link href="/register" className="text-muted-foreground hover:text-foreground">
              {tn("register")}
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              {tn("login")}
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {tn("brand")}
        </p>
      </div>
    </footer>
  );
}
