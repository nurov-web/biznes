import { routing, type AppLocale } from "@/i18n/routing";

/** Locale-ро аз pathname мегирад (`/tg/dashboard` → tg). */
export function localeFromPathname(pathname: string): AppLocale {
  const seg = pathname.split("/")[1];
  if (seg && routing.locales.includes(seg as AppLocale)) return seg as AppLocale;
  return routing.defaultLocale;
}

/** Префикси locale-ро меканад (`/tg/dashboard` → `/dashboard`). */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && routing.locales.includes(parts[0] as AppLocale)) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
