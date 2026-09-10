"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

type Props = {
  firstName: string;
  lastName: string;
  businessName: string;
  onLogout: () => void;
};

function initials(first: string, last: string): string {
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

export function ProfileMenu({ firstName, lastName, businessName, onLogout }: Props) {
  const t = useTranslations("nav");
  const tp = useTranslations("profilePage");
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
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
        { opacity: 0, y: 8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: EASE },
      );
    }, node);
    return () => ctx.revert();
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="flex min-h-11 max-w-full items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-muted"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={tp("openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
          {initials(firstName, lastName)}
        </span>
        <span className="hidden min-w-0 sm:grid">
          <span className="truncate text-sm font-medium leading-tight">
            {firstName} {lastName}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">{businessName}</span>
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 text-muted-foreground sm:block ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          ref={panel}
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-background py-1.5 shadow-[var(--shadow-lg)]"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="flex min-h-11 items-center gap-2.5 px-3 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <UserRound className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            {t("profile")}
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            className="flex min-h-11 items-center gap-2.5 px-3 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            {t("settings")}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex min-h-11 w-full items-center gap-2.5 px-3 text-left text-sm text-destructive hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
