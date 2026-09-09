"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { markLocaleSwap } from "@/lib/locale-swap";
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
  const pathname = usePathname();
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
      className={`seg relative max-w-full shrink-0 ${className ?? ""}`}
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
        <Link
          key={item.code}
          href={pathname || "/"}
          locale={item.code}
          replace
          scroll={false}
          prefetch
          onClick={(event) => {
            if (item.code === locale) {
              event.preventDefault();
              return;
            }
            setActive(i);
            markLocaleSwap();
          }}
          className="seg-item relative z-10 flex-1 bg-transparent no-underline hover:bg-transparent"
          data-selected={active === i}
          aria-current={locale === item.code ? "true" : undefined}
          aria-label={item.label}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
