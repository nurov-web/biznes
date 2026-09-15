"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  CircleHelp,
  FileText,
  LogIn,
  Menu,
  Rocket,
  Shield,
  Store,
  Waypoints,
  X,
} from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { InstallTrigger } from "@/components/pwa/InstallTrigger";
import { Link, usePathname } from "@/i18n/navigation";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

/** Меню пас аз ивази забон боз мемонад. */
let marketingMenuOpen = false;

type Props = {
  dark?: boolean;
};

export function MarketingMenu({ dark }: Props) {
  const t = useTranslations("nav");
  const tl = useTranslations("landing");
  const pathname = usePathname();
  const [open, setOpenState] = useState(marketingMenuOpen);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 12 });
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);

  function setOpen(value: boolean | ((prev: boolean) => boolean)) {
    setOpenState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      marketingMenuOpen = next;
      return next;
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    marketingMenuOpen = false;
    setOpenState(false);
  }, [pathname]);

  function place(): void {
    const node = btn.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    setPos({
      top: box.bottom + 8,
      right: Math.max(10, window.innerWidth - box.right),
    });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (root.current?.contains(target) || panel.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const node = panel.current;
    if (!node || !open) return;
    if (reducedMotion()) {
      gsap.set(node, { opacity: 1, y: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: EASE },
      );
    }, node);
    return () => ctx.revert();
  }, [open]);

  const close = () => setOpen(false);

  const menu = open ? (
    <div
      ref={panel}
      id="mobile-site-menu"
      role="menu"
      aria-label={t("menu")}
      className="site-menu account-menu fixed z-[80]"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="site-menu-langs">
        <LanguageSwitch className="seg-on-dark" />
      </div>
      <div className="mx-2 my-1 h-px bg-white/10" />
      <Link href={{ pathname: "/", hash: "how" }} role="menuitem" className="account-menu-item" onClick={close}>
        <Waypoints className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("how")}
      </Link>
      <Link href={{ pathname: "/", hash: "faq" }} role="menuitem" className="account-menu-item" onClick={close}>
        <CircleHelp className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("faq")}
      </Link>
      <Link href="/has-business" role="menuitem" className="account-menu-item" onClick={close}>
        <Store className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {tl("ctaHas")}
      </Link>
      <Link href="/start-business" role="menuitem" className="account-menu-item" onClick={close}>
        <Rocket className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {tl("ctaStart")}
      </Link>
      <div className="mx-2 my-1 h-px bg-white/10" />
      <InstallTrigger menu onPick={close} />
      <Link href="/legal/terms" role="menuitem" className="account-menu-item" onClick={close}>
        <FileText className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("terms")}
      </Link>
      <Link href="/legal/privacy" role="menuitem" className="account-menu-item" onClick={close}>
        <Shield className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("privacy")}
      </Link>
      <div className="mx-2 my-1 h-px bg-white/10" />
      <Link href="/login" role="menuitem" className="account-menu-item" onClick={close}>
        <LogIn className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("login")}
      </Link>
      <Link href="/register" className="site-menu-cta" onClick={close}>
        {t("register")}
      </Link>
    </div>
  ) : null;

  return (
    <div ref={root} className="relative">
      <button
        ref={btn}
        type="button"
        data-nav="toggle"
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
          dark
            ? "border-white/15 bg-white/10 text-white"
            : "border-border bg-white text-ink"
        }`}
        aria-label={open ? t("closeMenu") : t("menu")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="mobile-site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
      </button>
      {mounted && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
