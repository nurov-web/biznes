"use client";

import { useMemo } from "react";
import { useClientLocaleOptional } from "@/components/i18n/I18nClientProvider";
import { useIntlRouter } from "@/i18n/navigation-base";

/** push/replace бо locale-и клиент, то пас аз ТҶ/RU/EN масир гум нашавад. */
export function useRouter() {
  const router = useIntlRouter();
  const locale = useClientLocaleOptional();

  return useMemo(
    () => ({
      ...router,
      push: (
        href: Parameters<typeof router.push>[0],
        options?: Parameters<typeof router.push>[1],
      ) => router.push(href, { ...options, locale: options?.locale ?? locale }),
      replace: (
        href: Parameters<typeof router.replace>[0],
        options?: Parameters<typeof router.replace>[1],
      ) => router.replace(href, { ...options, locale: options?.locale ?? locale }),
      prefetch: (
        href: Parameters<typeof router.prefetch>[0],
        options?: Parameters<typeof router.prefetch>[1],
      ) => router.prefetch(href, { ...options, locale: options?.locale ?? locale }),
    }),
    [router, locale],
  );
}
