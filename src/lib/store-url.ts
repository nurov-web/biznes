import { STORE_PLATFORMS, type StorePlatform } from "@/constants/store";

export function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^::ffff:/, "");
  if (v === "127.0.0.1" || v.startsWith("127.")) return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("169.254.")) return true;
  const m = /^172\.(\d+)\./.exec(v);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

/** Хостҳои дохилӣ — fetch намекунем (SSRF). */
export function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h === "0.0.0.0") return true;
  if (h === "127.0.0.1" || h.startsWith("127.")) return true;
  if (h === "::1" || h.includes(":")) return true;
  if (h.endsWith(".internal") || h.endsWith(".local") || h.endsWith(".lan")) return true;
  if (h === "host.docker.internal" || h.startsWith("metadata.")) return true;
  if (h.includes("metadata.google")) return true;
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4.test(h)) return isPrivateIp(h);
  return false;
}

/** Силкаи мағоза: танҳо http(s) ва хости ҷамъиятӣ. */
export function normalizeStoreUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 300) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    if (!url.hostname.includes(".")) return null;
    url.hash = "";
    url.username = "";
    url.password = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function detectStorePlatform(url: string): StorePlatform {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("myshopify.com") || host === "shopify.com") return "shopify";
    if (host.includes("instagram.com") || host === "instagr.am") return "instagram";
    if (host.includes("woocommerce") || host.endsWith(".wpcomstaging.com")) return "woocommerce";
  } catch {
    return "custom";
  }
  return "custom";
}

export function isStorePlatform(value: string): value is StorePlatform {
  return (STORE_PLATFORMS as readonly string[]).includes(value);
}

const WALLED_HOSTS = [
  "instagram.com",
  "instagr.am",
  "t.me",
  "telegram.me",
  "telegram.org",
  "somon.tj",
  "olx.tj",
  "olx.com",
  "facebook.com",
  "fb.com",
  "tiktok.com",
] as const;

/** Instagram, Telegram, Somon — саҳифа баста, AI намехонад. */
export function isLoginWalledHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  return WALLED_HOSTS.some((domain) => h === domain || h.endsWith(`.${domain}`));
}

export function isLoginWalledUrl(raw: string): boolean {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return isLoginWalledHost(url.hostname);
  } catch {
    return false;
  }
}
