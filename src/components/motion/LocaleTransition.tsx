"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";

export const LOCALE_SWAP_FLAG = "bp_locale_swap";

/**
 * Ҳангоми иваз шудани забон мундариҷа мулоим иваз мешавад.
 * Дар навигатсияи муқаррарӣ ҳеҷ аниматсия нест.
 */
export function LocaleTransition({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const previous = useRef(locale);
  const [key, setKey] = useState(0);
  const [animate, setAnimate] = useState(false);

  // Навигатсияи сахт (reload): парчам дар sessionStorage мемонад.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(LOCALE_SWAP_FLAG)) {
        window.sessionStorage.removeItem(LOCALE_SWAP_FLAG);
        setAnimate(true);
      }
    } catch {
      /* sessionStorage дастрас нест */
    }
  }, []);

  // Навигатсияи нарм: худи локал иваз мешавад.
  useEffect(() => {
    if (previous.current === locale) return;
    previous.current = locale;
    setAnimate(true);
    setKey((k) => k + 1);
  }, [locale]);

  return (
    <div key={key} className={`w-full min-w-0 overflow-x-clip ${animate ? "locale-swap" : ""}`}>
      {children}
    </div>
  );
}
