import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteOrigin } from "@/lib/site-url";

const PUBLIC_PATHS = ["", "/login", "/register", "/legal/terms", "/legal/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const now = new Date();
  return routing.locales.flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${origin}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.6,
    })),
  );
}
