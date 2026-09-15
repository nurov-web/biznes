import { normalizeChannelUrl } from "@/lib/channel-url";
import { normalizeStoreUrl } from "@/lib/store-url";

export const SHOP_PLATFORMS = [
  "instagram",
  "telegram",
  "wildberries",
  "ozon",
  "kaspi",
  "somon",
  "olx",
  "avito",
  "website",
] as const;

export type ShopPlatform = (typeof SHOP_PLATFORMS)[number];

/** Силкаи витрина: Instagram, Telegram ё маркетплейс. */
export function normalizeShopLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 400) return null;
  const lower = trimmed.toLowerCase();
  if (lower.includes("t.me") || lower.includes("telegram")) {
    return normalizeChannelUrl("telegram", trimmed);
  }
  if (
    trimmed.startsWith("@") ||
    lower.includes("instagram.com") ||
    lower.includes("instagr.am")
  ) {
    return normalizeChannelUrl("instagram", trimmed);
  }
  return normalizeStoreUrl(trimmed);
}

export function detectShopPlatform(url: string): ShopPlatform {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("instagram.com") || host === "instagr.am") return "instagram";
    if (host === "t.me" || host.includes("telegram")) return "telegram";
    if (host.includes("wildberries") || host === "wb.ru" || host.endsWith(".wb.ru")) {
      return "wildberries";
    }
    if (host.includes("ozon.")) return "ozon";
    if (host.includes("kaspi.")) return "kaspi";
    if (host.includes("somon.tj")) return "somon";
    if (host.includes("olx.")) return "olx";
    if (host.includes("avito.")) return "avito";
  } catch {
    return "website";
  }
  return "website";
}

/** Telegram-и кушода: /s/username. */
export function publicFetchUrl(url: string, platform: ShopPlatform): string {
  if (platform !== "telegram") return url;
  try {
    const parsed = new URL(url);
    const name = parsed.pathname.replace(/^\/s\//, "/").replace(/^\//, "").split("/")[0];
    if (name && !parsed.pathname.startsWith("/s/")) {
      return `https://t.me/s/${name}`;
    }
  } catch {
    return url;
  }
  return url;
}
