/**
 * Саҳифаи кушодаи мағоза — танҳо http(s) ва хости ҷамъиятӣ.
 * Ба /admin ворид намешавем.
 */
import { lookup } from "node:dns/promises";
import { isBlockedHost, isPrivateIp, normalizeStoreUrl } from "@/lib/store-url";

async function hostResolvesPublic(hostname: string): Promise<boolean> {
  if (isBlockedHost(hostname)) return false;
  try {
    const rows = await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("DNS_TIMEOUT")), 4000);
      }),
    ]);
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
  const row = await fetchPublicResource(url);
  return row.body;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type PublicFetch = {
  url: string;
  status: number;
  body: string;
  json: unknown | null;
};

/** HTML ё JSON-и кушода — хости ҷамъиятӣ, бе SSRF. */
export async function fetchPublicResource(url: string): Promise<PublicFetch> {
  const empty: PublicFetch = { url, status: 0, body: "", json: null };
  try {
    if (!(await hostResolvesPublic(new URL(url).hostname))) return empty;
  } catch {
    return empty;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/json,application/xhtml+xml,*/*;q=0.8",
        "User-Agent": BROWSER_UA,
      },
    });
    let finalUrl = url;
    try {
      const finalHost = new URL(response.url).hostname;
      if (isBlockedHost(finalHost)) return empty;
      if (!(await hostResolvesPublic(finalHost))) return empty;
      finalUrl = response.url;
    } catch {
      return empty;
    }
    const type = response.headers.get("content-type") ?? "";
    const raw = await response.text();
    const body = raw.slice(0, 400_000);
    let json: unknown | null = null;
    if (type.includes("json") || body.trim().startsWith("{") || body.trim().startsWith("[")) {
      try {
        json = JSON.parse(body) as unknown;
      } catch {
        json = null;
      }
    }
    return { url: finalUrl, status: response.status, body, json };
  } catch {
    return empty;
  } finally {
    clearTimeout(timer);
  }
}

/** HTML-и кушода (Instagram ҳам — агар ҷавоб диҳад). */
export async function fetchPublicHtml(url: string): Promise<{ html: string; ok: boolean }> {
  const normalized = normalizeStoreUrl(url);
  if (!normalized) return { html: "", ok: false };
  const row = await fetchPublicResource(normalized);
  const html = row.body;
  return { html, ok: html.length > 80 && row.status > 0 && row.status < 400 };
}

export async function fetchPublicShopText(
  storeUrl: string,
  options?: { maxExtraPages?: number },
): Promise<{
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

  const extraLimit = Math.max(0, options?.maxExtraPages ?? 2);
  const home = await getPage(normalized);
  const pages = [home];
  if (extraLimit === 0) {
    const text = stripHtml(home).slice(0, 7000);
    return { text, pagesRead: home ? 1 : 0, ok: text.length > 80 };
  }
  const extras: string[] = [];
  for (const path of EXTRA) {
    const href = sameOrigin(base, path);
    if (href && href !== normalized) extras.push(href);
  }
  const linkMatches = [...home.matchAll(/href=["']([^"']+)["']/gi)]
    .map((m) => sameOrigin(base, m[1] ?? ""))
    .filter((href): href is string => Boolean(href && EXTRA.some((p) => href.includes(p))));
  const targets = [...new Set([...extras, ...linkMatches])].slice(0, extraLimit);
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
