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
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { markLocaleSwap } from "@/lib/locale-swap";

const MESSAGE_LOADERS: Record<AppLocale, () => Promise<{ default: AbstractIntlMessages }>> = {
  tg: () => import("../../../messages/tg.json"),
  ru: () => import("../../../messages/ru.json"),
  en: () => import("../../../messages/en.json"),
};

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
 * Як бандли забон дар HTML, дигарҳо танҳо ҳангоми иваз бор мешаванд.
 */
export function I18nClientProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  const initial = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const [current, setCurrent] = useState<AppLocale>(initial);
  const [bundle, setBundle] = useState<AbstractIntlMessages>(messages);

  useEffect(() => {
    const fromUrl = localeFromPath(window.location.pathname);
    const next = fromUrl ?? (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);
    setCurrent(next);
    if (next === (hasLocale(routing.locales, locale) ? locale : routing.defaultLocale)) {
      setBundle(messages);
    }
  }, [locale, messages]);

  useEffect(() => {
    function onPop() {
      const fromUrl = localeFromPath(window.location.pathname);
      if (!fromUrl) return;
      void MESSAGE_LOADERS[fromUrl]().then((mod) => {
        setBundle(mod.default);
        setCurrent(fromUrl);
      });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const switchLocale = useCallback((next: AppLocale) => {
    void MESSAGE_LOADERS[next]().then((mod) => {
      markLocaleSwap();
      document.documentElement.lang = next;
      window.history.replaceState(window.history.state, "", nextPathFor(next));
      document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax${
        window.location.protocol === "https:" ? ";secure" : ""
      }`;
      setBundle(mod.default);
      setCurrent(next);
    });
  }, []);

  const value = useMemo(() => ({ locale: current, switchLocale }), [current, switchLocale]);

  return (
    <LocaleSwitchContext.Provider value={value}>
      <NextIntlClientProvider locale={current} messages={bundle} timeZone="Asia/Dushanbe">
        {children}
      </NextIntlClientProvider>
    </LocaleSwitchContext.Provider>
  );
}
