"use client";

import { useEffect } from "react";

/** lang-и html ҳангоми ивази забон бе боридани ҳуҷҷат. */
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
