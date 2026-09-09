"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_SWAP_FLAG } from "@/components/motion/LocaleTransition";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = Math.max(
    0,
    LOCALES.findIndex((item) => item.code === locale),
  );
  // Нишондиҳанда дарҳол мелағжад, ҳатто пеш аз он ки саҳифа омода шавад.
  const [active, setActive] = useState(current);

  useEffect(() => {
    setActive(current);
  }, [current]);

  function pick(index: number, code: AppLocale) {
    if (code === locale) return;
    setActive(index);
    try {
      window.sessionStorage.setItem(LOCALE_SWAP_FLAG, "1");
    } catch {
      /* sessionStorage дастрас нест */
    }
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  }

  return (
    <div
      className={`seg relative max-w-full shrink-0 ${className ?? ""}`}
      role="group"
      aria-label={t("language")}
      data-pending={pending || undefined}
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
          onClick={() => pick(i, item.code)}
          className="seg-item relative z-10 flex-1 bg-transparent hover:bg-transparent"
          data-selected={active === i}
          aria-current={locale === item.code ? "true" : undefined}
          aria-label={item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
