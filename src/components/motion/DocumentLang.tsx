"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/** lang-и html ҳангоми ивази забон бе боридани ҳуҷҷат. */
export function DocumentLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
