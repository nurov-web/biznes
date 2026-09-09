"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { markLocaleSwap } from "@/lib/locale-swap";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import tg from "../../../messages/tg.json";

const BUNDLES = { tg, ru, en } as const;

type LocaleSwitchContextValue = {
  locale: AppLocale;
  switchLocale: (next: AppLocale) => void;
};

const LocaleSwitchContext = createContext<LocaleSwitchContextValue | null>(null);

export function useSwitchLocale(): (next: AppLocale) => void {
  const ctx = useContext(LocaleSwitchContext);
  if (!ctx) {
    throw new Error("useSwitchLocale must be used within I18nClientProvider");
  }
  return ctx.switchLocale;
}

export function useClientLocaleOptional(): AppLocale | undefined {
  return useContext(LocaleSwitchContext)?.locale;
}

function localeFromPath(pathname: string): AppLocale | null {
  const match = pathname.match(/^\/(tg|ru|en)(?=\/|$)/);
  if (!match) return null;
  const code = match[1];
  return hasLocale(routing.locales, code) ? code : null;
}

function nextPathFor(locale: AppLocale): string {
  const { pathname, search, hash } = window.location;
  const stripped = pathname.replace(/^\/(tg|ru|en)(?=\/|$)/, "") || "/";
  const path = `/${locale}${stripped === "/" ? "" : stripped}`;
  return `${path}${search}${hash}`;
}

/**
 * Ивази забон бе навигатсияи Next — дарахти UI намеафтад, танҳо матн нав мешавад.
 */
export function I18nClientProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const initial = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const [current, setCurrent] = useState<AppLocale>(initial);

  useEffect(() => {
    const fromUrl = localeFromPath(window.location.pathname);
    if (fromUrl) {
      setCurrent(fromUrl);
      return;
    }
    if (hasLocale(routing.locales, locale)) setCurrent(locale);
  }, [locale]);

  useEffect(() => {
    function onPop() {
      const fromUrl = localeFromPath(window.location.pathname);
      if (fromUrl) setCurrent(fromUrl);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const switchLocale = useCallback((next: AppLocale) => {
    setCurrent((prev) => {
      if (prev === next) return prev;
      markLocaleSwap();
      document.documentElement.lang = next;
      window.history.replaceState(window.history.state, "", nextPathFor(next));
      document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax${
        window.location.protocol === "https:" ? ";secure" : ""
      }`;
      return next;
    });
  }, []);

  const value = useMemo(() => ({ locale: current, switchLocale }), [current, switchLocale]);

  return (
    <LocaleSwitchContext.Provider value={value}>
      <NextIntlClientProvider locale={current} messages={BUNDLES[current]} timeZone="Asia/Dushanbe">
        {children}
      </NextIntlClientProvider>
    </LocaleSwitchContext.Provider>
  );
}
