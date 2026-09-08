"use client";

import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

export function MarketingFooter() {
  const t = useTranslations("landing");
  const tn = useTranslations("nav");

  const columns = [
    {
      title: t("colProduct"),
      links: [
        { label: tn("dashboard"), href: "/dashboard" },
        { label: tn("pricing"), href: "/pricing" },
        { label: tn("simulator"), href: "/simulator" },
        { label: tn("agents"), href: "/agents" },
      ],
    },
    {
      title: t("colData"),
      links: [
        { label: tn("data"), href: "/data" },
        { label: tn("competitors"), href: "/competitors" },
        { label: tn("market"), href: "/market" },
        { label: tn("inventory"), href: "/inventory" },
      ],
    },
    {
      title: t("colAccount"),
      links: [
        { label: tn("register"), href: "/register" },
        { label: tn("login"), href: "/login" },
        { label: tn("settings"), href: "/settings" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-on-primary">
                <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              {APP_NAME}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footerNote")}
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
          <p className="text-xs text-muted-foreground">{t("footerLegal")}</p>
        </div>
      </div>
    </footer>
  );
}
