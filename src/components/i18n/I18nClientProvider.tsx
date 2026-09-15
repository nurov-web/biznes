"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/i18n/routing";
import { markLocaleSwap } from "@/lib/locale-swap";

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

function nextPathFor(locale: AppLocale): string {
  const { pathname, search, hash } = window.location;
  const stripped = pathname.replace(/^\/(tg|ru|en)(?=\/|$)/, "") || "/";
  const path = `/${locale}${stripped === "/" ? "" : stripped}`;
  return `${path}${search}${hash}`;
}

/**
 * Ивази забон — саҳифаи пурра бо ҳамон масир, то ҳамаи матн нав шавад.
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
  const current = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  const switchLocale = useCallback(
    (next: AppLocale) => {
      if (next === current) return;
      markLocaleSwap();
      document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax${
        window.location.protocol === "https:" ? ";secure" : ""
      }`;
      window.location.assign(nextPathFor(next));
    },
    [current],
  );

  const value = useMemo(() => ({ locale: current, switchLocale }), [current, switchLocale]);

  return (
    <LocaleSwitchContext.Provider value={value}>
      <NextIntlClientProvider locale={current} messages={messages} timeZone="Asia/Dushanbe">
        {children}
      </NextIntlClientProvider>
    </LocaleSwitchContext.Provider>
  );
}
