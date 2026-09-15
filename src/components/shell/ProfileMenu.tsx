"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { LogOut, Settings, UserRound } from "lucide-react";
import { InstallTrigger } from "@/components/pwa/InstallTrigger";
import { Link } from "@/i18n/navigation";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

type Props = {
  firstName: string;
  lastName: string;
  businessName: string;
  email?: string;
  onLogout: () => void;
  onDark?: boolean;
};

function initials(first: string, last: string): string {
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

/** Менюи ҳисоб: сиёҳи дафтар, на корти кремии кӯдакона. */
export function ProfileMenu({
  firstName,
  lastName,
  businessName,
  email,
  onLogout,
  onDark,
}: Props) {
  const t = useTranslations("nav");
  const th = useTranslations("navHints");
  const tp = useTranslations("profilePage");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 12 });
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const name = `${firstName} ${lastName}`.trim();
  const mark = initials(firstName, lastName);

  useEffect(() => {
    setMounted(true);
  }, []);

  function place(): void {
    const node = btn.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    setPos({
      top: box.bottom + 10,
      right: Math.max(12, window.innerWidth - box.right),
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
        { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: EASE },
      );
    }, node);
    return () => ctx.revert();
  }, [open]);

  const menu = open ? (
    <div
      ref={panel}
      role="menu"
      aria-label={tp("openMenu")}
      className="account-menu fixed z-[80]"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-[13px] font-semibold tracking-wide text-white">
          {mark}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="truncate text-[12px] text-dark-muted">{businessName || email}</p>
        </div>
      </div>
      <div className="mx-2 my-1 h-px bg-white/10" />
      <Link
        href="/profile"
        role="menuitem"
        className="account-menu-item"
        onClick={() => setOpen(false)}
      >
        <UserRound className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("profile")}
      </Link>
      <Link
        href="/settings"
        role="menuitem"
        className="account-menu-item"
        onClick={() => setOpen(false)}
      >
        <Settings className="h-4 w-4 text-dark-muted" strokeWidth={1.75} aria-hidden />
        {t("settings")}
      </Link>
      <InstallTrigger menu onPick={() => setOpen(false)} />
      <div className="mx-2 my-1 h-px bg-white/10" />
      <button
        type="button"
        role="menuitem"
        title={th("logout")}
        className="account-menu-item account-menu-item-danger"
        onClick={() => {
          setOpen(false);
          onLogout();
        }}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        {t("logout")}
      </button>
    </div>
  ) : null;

  return (
    <div ref={root} className="relative">
      <button
        ref={btn}
        type="button"
        className={
          onDark
            ? "account-face"
            : `flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-1.5 hover:bg-muted ${
                open ? "bg-muted" : ""
              }`
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={tp("openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        {onDark ? (
          mark
        ) : (
          <>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink text-[11px] font-semibold tracking-wide text-white">
              {mark}
            </span>
            <span className="hidden min-w-0 lg:grid">
              <span className="truncate text-sm font-medium leading-tight">{name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{businessName}</span>
            </span>
          </>
        )}
      </button>
      {mounted && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
