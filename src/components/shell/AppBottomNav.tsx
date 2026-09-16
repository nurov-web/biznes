"use client";

import { useTranslations } from "next-intl";
import { MOBILE_TABS, isNavActive } from "@/constants/workspace";
import { Link, usePathname } from "@/i18n/navigation";

/** Имрӯз · ИИ · Вазифа · Фурӯш · Пул */
export function AppBottomNav() {
  const t = useTranslations("workspace");
  const pathname = usePathname();

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      aria-label={t("mobileAria")}
    >
      <ul className="mx-auto flex max-w-lg">
        {MOBILE_TABS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium sm:text-xs ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

