"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { MotionLink } from "@/components/motion/MotionLink";
import { APP_NAME } from "@/constants";

export function MarketingHeader() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "border-border shadow-[var(--shadow-xs)]" : "border-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-all duration-300 ${
          scrolled ? "py-1.5" : "py-2.5"
        }`}
      >
        <MotionLink href="/" className="flex items-center gap-2 text-[0.9375rem] font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-on-primary">
            <Compass className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
          {APP_NAME}
        </MotionLink>
        <div className="flex items-center gap-1.5">
          <LanguageSwitch />
          <MotionLink href="/login" className="btn btn-sm btn-ghost hidden sm:inline-flex">
            {t("login")}
          </MotionLink>
          <MotionLink href="/register" className="btn btn-sm btn-primary">
            {t("register")}
          </MotionLink>
        </div>
      </div>
    </header>
  );
}
