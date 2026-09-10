import type { AppLocale } from "@/i18n/routing";

export type Locale = AppLocale;

export function parseLocale(value: unknown): Locale {
  if (value === "ru" || value === "en" || value === "tg") return value;
  return "tg";
}

export function localeFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  return parseLocale(url.searchParams.get("locale"));
}

export function llmLanguage(locale: Locale): string {
  if (locale === "en") return "English";
  if (locale === "ru") return "Russian";
  return "Tajik — Cyrillic or Latin letters (tojiki). Latin Tajik is Tajik, not English.";
}
