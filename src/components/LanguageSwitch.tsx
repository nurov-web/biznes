"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSwitchLocale } from "@/components/i18n/I18nClientProvider";
import { LocaleFlag } from "@/components/ui/LocaleFlag";
import type { AppLocale } from "@/i18n/routing";

const LOCALES: { code: AppLocale; nameKey: "localeTg" | "localeRu" | "localeEn" }[] = [
  { code: "tg", nameKey: "localeTg" },
  { code: "ru", nameKey: "localeRu" },
  { code: "en", nameKey: "localeEn" },
];

export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const switchLocale = useSwitchLocale();
  const current = Math.max(
    0,
    LOCALES.findIndex((item) => item.code === locale),
  );
  const [active, setActive] = useState(current);

  useEffect(() => {
    setActive(current);
  }, [current]);

  return (
    <div
      className={`seg relative w-max max-w-full flex-none p-1 ${className ?? ""}`}
      role="group"
      aria-label={t("language")}
    >
      <span
        className="locale-pill pointer-events-none absolute top-1 bottom-1 left-1 z-0 rounded-md bg-primary shadow-[0_1px_2px_rgb(13_74_143/0.28)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `calc((100% - 0.5rem) / ${LOCALES.length})`,
          transform: `translateX(${active * 100}%)`,
        }}
        aria-hidden
      />
      {LOCALES.map((item, i) => (
        <button
          key={item.code}
          type="button"
          onClick={() => {
            if (item.code === locale) return;
            setActive(i);
            switchLocale(item.code);
          }}
          className="seg-item relative z-10 flex-1 bg-transparent hover:bg-transparent"
          data-selected={active === i}
          aria-pressed={locale === item.code}
          aria-label={t(item.nameKey)}
        >
          <LocaleFlag locale={item.code} />
        </button>
      ))}
    </div>
  );
}
