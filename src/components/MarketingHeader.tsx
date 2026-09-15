"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { MarketingMenu } from "@/components/MarketingMenu";
import { MotionLink } from "@/components/motion/MotionLink";
import { InstallTrigger } from "@/components/pwa/InstallTrigger";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Link } from "@/i18n/navigation";

type Props = {
  tone?: "light" | "dark";
};

export function MarketingHeader({ tone = "light" }: Props) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const dark = tone === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const deskLink = dark
    ? "px-2 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
    : "px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header
      className={`sticky top-0 z-30 w-full min-w-0 border-b pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl ${
        dark
          ? scrolled
            ? "border-white/10 bg-[#0b1018]/80"
            : "border-transparent bg-transparent"
          : scrolled
            ? "border-border bg-background/80 shadow-[var(--shadow-xs)]"
            : "border-transparent bg-background/80"
      }`}
    >
      <div className="gutter-x mx-auto flex w-full min-w-0 max-w-6xl items-center gap-2 py-2">
        <MotionLink
          href="/"
          className={`flex min-w-0 flex-1 items-center overflow-hidden ${
            dark ? "text-white" : ""
          }`}
          aria-label={t("brand")}
        >
          <BrandLockup size={28} dark={dark} />
        </MotionLink>

        <nav
          data-nav="desktop"
          className="hidden items-center gap-1 md:flex"
          aria-label={t("home")}
        >
          <Link href={{ pathname: "/", hash: "how" }} className={deskLink}>
            {t("how")}
          </Link>
          <Link href={{ pathname: "/", hash: "faq" }} className={deskLink}>
            {t("faq")}
          </Link>
          <LanguageSwitch className={dark ? "seg-on-dark" : undefined} />
          <InstallTrigger className={`btn btn-sm inline-flex items-center gap-1.5 ${dark ? "btn-dark" : "btn-ghost"}`} />
          <MotionLink href="/login" className={`btn btn-sm ${dark ? "btn-dark" : "btn-ghost"}`}>
            {t("login")}
          </MotionLink>
          <MotionLink href="/register" className="btn btn-sm btn-primary">
            {t("register")}
          </MotionLink>
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <InstallTrigger compact className={dark ? "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white" : "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-white text-ink"} />
          <MarketingMenu dark={dark} />
        </div>
      </div>
    </header>
  );
}
