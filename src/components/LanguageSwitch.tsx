"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSwitchLocale } from "@/components/i18n/I18nClientProvider";
import type { AppLocale } from "@/i18n/routing";

/** Коди масир `tg` мемонад, вале дар экран ТҶ нишон дода мешавад. */
const LOCALES: { code: AppLocale; label: string }[] = [
  { code: "tg", label: "ТҶ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
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
      className={`seg relative w-max max-w-full flex-none ${className ?? ""}`}
      role="group"
      aria-label={t("language")}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 rounded-[0.45rem] bg-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `${100 / LOCALES.length}%`,
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
          aria-label={item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
