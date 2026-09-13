import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tg", "ru", "en"],
  defaultLocale: "tg",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
});

export type AppLocale = (typeof routing.locales)[number];
