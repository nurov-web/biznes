"use client";

import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/BrandMark";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

export function MarketingFooter() {
  const t = useTranslations("landing");
  const tn = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-background">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="flex items-center gap-2.5 font-semibold tracking-tight">
              <BrandMark size={32} />
              {APP_NAME}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footerNote")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm" aria-label={t("colAccount")}>
            <Link href="/register" className="text-muted-foreground hover:text-foreground">
              {tn("register")}
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              {tn("login")}
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
