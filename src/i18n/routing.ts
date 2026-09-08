import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tg", "ru", "en"],
  defaultLocale: "tg",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
