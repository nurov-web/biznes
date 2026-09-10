"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { MotionLink } from "@/components/motion/MotionLink";
import { BrandMark } from "@/components/ui/BrandMark";
import { usePathname } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

/** Менюи мобилӣ пас аз ивази забон боз мемонад (дарахт аз нав сохта мешавад). */
let marketingMenuOpen = false;

export function MarketingHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpenState] = useState(marketingMenuOpen);

  function setOpen(value: boolean | ((prev: boolean) => boolean)) {
    setOpenState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      marketingMenuOpen = next;
      return next;
    });
  }

  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    marketingMenuOpen = false;
    setOpenState(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-30 w-full min-w-0 border-b bg-background/80 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl ${
        scrolled ? "border-border shadow-[var(--shadow-xs)]" : "border-transparent"
      }`}
    >
      <div
        className={`gutter-x mx-auto flex w-full min-w-0 max-w-6xl items-center gap-2 ${
          scrolled ? "py-1.5" : "py-2.5"
        }`}
      >
        <MotionLink
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-[0.9375rem] font-semibold tracking-tight"
        >
          <BrandMark size={36} />
          <span className="truncate">{APP_NAME}</span>
        </MotionLink>

        <nav
          data-nav="desktop"
          className="hidden items-center gap-2 md:flex"
          aria-label={t("home")}
        >
          <LanguageSwitch />
          <MotionLink href="/login" className="btn btn-sm btn-ghost">
            {t("login")}
          </MotionLink>
          <MotionLink href="/register" className="btn btn-sm btn-primary">
            {t("register")}
          </MotionLink>
        </nav>

        <button
          type="button"
          data-nav="toggle"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-white text-ink shadow-[var(--shadow-xs)] md:hidden"
          aria-label={open ? t("closeMenu") : t("menu")}
          aria-expanded={open}
          aria-controls="mobile-site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-site-menu"
          data-nav="panel"
          className="w-full border-t border-border bg-background md:hidden"
        >
          <div className="gutter-x mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <p className="text-xs font-medium text-muted-foreground">{t("language")}</p>
            <LanguageSwitch className="flex w-full" />
            <MotionLink href="/login" className="btn btn-ghost w-full">
              {t("login")}
            </MotionLink>
            <MotionLink href="/register" className="btn btn-primary w-full">
              {t("register")}
            </MotionLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
