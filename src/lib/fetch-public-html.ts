/**
 * Саҳифаи кушодаи мағоза — танҳо http(s) ва хости ҷамъиятӣ.
 * Ба /admin ворид намешавем.
 */
import { lookup } from "node:dns/promises";
import { isBlockedHost, isPrivateIp, normalizeStoreUrl } from "@/lib/store-url";

async function hostResolvesPublic(hostname: string): Promise<boolean> {
  if (isBlockedHost(hostname)) return false;
  try {
    const rows = await lookup(hostname, { all: true, verbatim: true });
    if (!rows.length) return false;
    return rows.every((row) => !isPrivateIp(row.address));
  } catch {
    return false;
  }
}

const EXTRA = ["/products", "/shop", "/catalog", "/collections", "/collection"];
const SKIP = /admin|wp-login|wp-admin|cart|checkout|account|login/i;

function sameOrigin(base: URL, href: string): string | null {
  try {
    const next = new URL(href, base);
    if (next.protocol !== "http:" && next.protocol !== "https:") return null;
    if (next.hostname !== base.hostname) return null;
    if (isBlockedHost(next.hostname)) return null;
    if (SKIP.test(next.pathname)) return null;
    next.hash = "";
    next.username = "";
    next.password = "";
    return next.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getPage(url: string): Promise<string> {
  try {
    if (!(await hostResolvesPublic(new URL(url).hostname))) return "";
  } catch {
    return "";
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "BusinessPilotBot/1.0 (+https://biznes-mu.vercel.app)",
      },
    });
    if (!response.ok) return "";
    try {
      const finalHost = new URL(response.url).hostname;
      if (isBlockedHost(finalHost)) return "";
      if (!(await hostResolvesPublic(finalHost))) return "";
    } catch {
      return "";
    }
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("xml") && !type.includes("text")) {
      return "";
    }
    const html = await response.text();
    return html.slice(0, 80_000);
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPublicShopText(storeUrl: string): Promise<{
  text: string;
  pagesRead: number;
  ok: boolean;
}> {
  const normalized = normalizeStoreUrl(storeUrl);
  if (!normalized) return { text: "", pagesRead: 0, ok: false };
  const base = new URL(normalized);
  if (base.hostname.includes("instagram.com")) {
    return { text: "", pagesRead: 0, ok: false };
  }

  const home = await getPage(normalized);
  const pages = [home];
  const extras: string[] = [];
  for (const path of EXTRA) {
    const href = sameOrigin(base, path);
    if (href && href !== normalized) extras.push(href);
  }
  const linkMatches = [...home.matchAll(/href=["']([^"']+)["']/gi)]
    .map((m) => sameOrigin(base, m[1] ?? ""))
    .filter((href): href is string => Boolean(href && EXTRA.some((p) => href.includes(p))));
  const targets = [...new Set([...extras, ...linkMatches])].slice(0, 2);
  for (const url of targets) {
    const html = await getPage(url);
    if (html) pages.push(html);
  }

  const text = pages
    .map(stripHtml)
    .filter((part) => part.length > 40)
    .join("\n---\n")
    .slice(0, 7000);
  return { text, pagesRead: pages.filter(Boolean).length, ok: text.length > 80 };
}

/** GET-и витрина: reachable танҳо агар саҳифаи кушода ҷавоб диҳад. */
export async function probeStoreReachable(storeUrl: string): Promise<boolean> {
  const normalized = normalizeStoreUrl(storeUrl);
  if (!normalized) return false;
  try {
    if (new URL(normalized).hostname.includes("instagram.com")) return false;
  } catch {
    return false;
  }
  const html = await getPage(normalized);
  return html.length > 40;
}
