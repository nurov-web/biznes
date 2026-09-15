import { detectShopPlatform, normalizeShopLink, publicFetchUrl } from "@/lib/shop-link";
import { fetchPublicHtml, fetchPublicResource } from "@/lib/fetch-public-html";
import { normalizeStoreUrl } from "@/lib/store-url";
import { parseShopHtml } from "@/services/shop-pulse/parse";
import { mergeJsonMetrics, parseShopJson, type JsonMetrics } from "@/services/shop-pulse/json-metrics";
import type { MetricSource, ShopPulse } from "@/types/shop-pulse";

export type { MetricSource, ShopPulse };

export type OwnerShopCounts = {
  sold?: number | null;
  refused?: number | null;
  complaints?: number | null;
};

const SKIP_API = /\/api\/(auth|cart|favorites|notifications|admin|broadcast|messages|health)\b/i;
const COMMON_API = [
  "/api/products",
  "/api/products?page=1&limit=100",
  "/api/products/home/sections",
  "/api/sellers",
  "/api/categories",
  "/api/services/categories",
  "/api/orders",
  "/api/orders/public",
  "/api/stats",
];
const EXTRA_PAGES = ["/search", "/shops", "/services"];

function productSlugs(data: unknown): string[] {
  const found: string[] = [];
  function walk(node: unknown, depth: number): void {
    if (depth > 6 || node === null) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (
      typeof rec.slug === "string" &&
      rec.slug.length > 0 &&
      rec.slug.length < 80 &&
      (typeof rec.price === "number" || typeof rec.stock === "number" || typeof rec.name === "string")
    ) {
      found.push(rec.slug);
    }
    for (const value of Object.values(rec)) walk(value, depth + 1);
  }
  walk(data, 0);
  return [...new Set(found)].slice(0, 8);
}

function ownerCount(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 50_000_000) {
    return null;
  }
  return value;
}

function mergeMetric(
  page: number | null,
  owner: number | null,
): { value: number | null; source: MetricSource | null } {
  if (page !== null) return { value: page, source: "page" };
  if (owner !== null) return { value: owner, source: "owner" };
  return { value: null, source: null };
}

function prefer(json: number | null, html: number | null): number | null {
  return json !== null ? json : html;
}

export function emptyPulse(url = "", status: ShopPulse["status"] = "blocked"): ShopPulse {
  return {
    url,
    platform: detectShopPlatform(url),
    title: "",
    sold: null,
    refused: null,
    complaints: null,
    reviews: null,
    rating: null,
    returnPct: null,
    catalogProducts: null,
    catalogReviews: null,
    catalogShops: null,
    locked: [],
    soldSource: null,
    refusedSource: null,
    complaintsSource: null,
    status,
    fetchedAt: new Date().toISOString(),
  };
}

/** Барои ИИ: танҳо факт. Ҷойи холӣ = нест, на сифр. */
export function pulseFacts(pulse: ShopPulse | null): string {
  if (!pulse || !pulse.url) return "Shop URL: none. Marketplace numbers: none.";
  const cell = (n: number | null, src: MetricSource | null) =>
    n === null ? "NOT ON PAGE" : `${n} (source: ${src ?? "unknown"})`;
  return [
    `Owner shop URL: ${pulse.url}`,
    `Platform: ${pulse.platform}`,
    `Page title: ${pulse.title || "none"}`,
    `Fetch status: ${pulse.status}`,
    `Catalog products found: ${pulse.catalogProducts ?? "none"}`,
    `Catalog reviews found: ${pulse.catalogReviews ?? "none"}`,
    `Catalog shops found: ${pulse.catalogShops ?? "none"}`,
    `Sold: ${cell(pulse.sold, pulse.soldSource)}`,
    `Refused/cancelled: ${cell(pulse.refused, pulse.refusedSource)}`,
    pulse.returnPct !== null ? `Return/cancel percent on page: ${pulse.returnPct}%` : "",
    `Complaints: ${cell(pulse.complaints, pulse.complaintsSource)}`,
    `Reviews on page: ${pulse.reviews === null ? "NOT ON PAGE" : pulse.reviews}`,
    `Rating on page: ${pulse.rating === null ? "NOT ON PAGE" : pulse.rating}`,
    pulse.locked.length ? `Locked without login: ${pulse.locked.join(", ")}` : "",
    "Never invent NOT ON PAGE fields. Never use demo CRM numbers.",
  ]
    .filter(Boolean)
    .join("\n");
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function discoverApiUrls(origin: string, html: string): string[] {
  const fromHtml = [...html.matchAll(/["'`](\/api\/[a-zA-Z0-9_\-\/]+)["'`]/g)].map((m) => m[1] ?? "");
  const paths = [...new Set([...COMMON_API, ...fromHtml])]
    .filter((path) => path.startsWith("/api/") && !SKIP_API.test(path))
    .slice(0, 18);
  const urls: string[] = [];
  for (const path of paths) {
    try {
      const next = new URL(path, origin);
      if (next.origin !== origin) continue;
      const normalized = normalizeStoreUrl(next.toString());
      if (normalized) urls.push(normalized);
    } catch {
      /* нодуруст */
    }
  }
  return [...new Set(urls)];
}

async function readPublicApis(origin: string, html: string): Promise<{
  metrics: JsonMetrics;
  locked: string[];
}> {
  const extraHtml = await Promise.all(
    EXTRA_PAGES.map((path) => fetchPublicHtml(`${origin}${path}`)),
  );
  const combinedHtml = [html, ...extraHtml.map((row) => row.html)].join("\n");
  const urls = discoverApiUrls(origin, combinedHtml);
  const locked: string[] = [];
  const parts: JsonMetrics[] = [];
  const rows = await Promise.all(urls.map((url) => fetchPublicResource(url)));
  const slugs: string[] = [];
  for (const row of rows) {
    const path = (() => {
      try {
        return new URL(row.url).pathname;
      } catch {
        return "";
      }
    })();
    if ((row.status === 401 || row.status === 403) && /order|stat|complaint|return/.test(path)) {
      locked.push("sold", "refused", "complaints");
    }
    if (!row.json || row.status >= 400) continue;
    parts.push(parseShopJson(row.json));
    slugs.push(...productSlugs(row.json));
  }
  const detailUrls = [...new Set(slugs)]
    .slice(0, 8)
    .map((slug) => normalizeStoreUrl(`${origin}/api/products/${encodeURIComponent(slug)}`))
    .filter((href): href is string => Boolean(href));
  if (detailUrls.length) {
    const details = await Promise.all(detailUrls.map((href) => fetchPublicResource(href)));
    for (const row of details) {
      if (!row.json || row.status >= 400) continue;
      parts.push(parseShopJson(row.json));
    }
  }
  return { metrics: mergeJsonMetrics(parts), locked: [...new Set(locked)] };
}

export async function readShopPulse(
  rawUrl: string,
  owner: OwnerShopCounts = {},
): Promise<ShopPulse> {
  const url = normalizeShopLink(rawUrl);
  if (!url) return emptyPulse("", "blocked");
  const platform = detectShopPlatform(url);
  const target = publicFetchUrl(url, platform);
  const page = await fetchPublicHtml(target);
  const parsed = page.ok ? parseShopHtml(page.html) : null;
  const origin = originOf(url);
  const api =
    origin && platform !== "instagram" && platform !== "telegram"
      ? await readPublicApis(origin, page.html)
      : { metrics: mergeJsonMetrics([]), locked: [] };
  const pageSold = prefer(api.metrics.sold, parsed?.sold ?? null);
  const pageRefused = prefer(api.metrics.refused, parsed?.refused ?? null);
  const pageComplaints = prefer(api.metrics.complaints, parsed?.complaints ?? null);
  const sold = mergeMetric(pageSold, ownerCount(owner.sold));
  const refused = mergeMetric(pageRefused, ownerCount(owner.refused));
  const complaints = mergeMetric(pageComplaints, ownerCount(owner.complaints));
  const catalogHit = Boolean(
    (api.metrics.products ?? 0) > 0 ||
      (api.metrics.shops ?? 0) > 0 ||
      api.metrics.reviews !== null ||
      parsed?.title,
  );
  let status: ShopPulse["status"] = "empty";
  if (!page.ok && !catalogHit) status = platform === "instagram" ? "walled" : "empty";
  else if (parsed?.walled && !catalogHit) status = "walled";
  else if (catalogHit || sold.value !== null) status = "read";
  if (platform === "instagram" && parsed?.sold === null && api.metrics.sold === null) {
    if (sold.value !== null || refused.value !== null || complaints.value !== null) status = "read";
    else status = parsed?.title || catalogHit ? "read" : "walled";
  }
  const locked = api.locked.filter((key) => {
    if (key === "sold") return sold.value === null;
    if (key === "refused") return refused.value === null;
    if (key === "complaints") return complaints.value === null;
    return true;
  });
  return {
    url,
    platform,
    title: parsed?.title ?? "",
    sold: sold.value,
    refused: refused.value,
    complaints: complaints.value,
    reviews: prefer(api.metrics.reviews, parsed?.reviews ?? null),
    rating: prefer(api.metrics.rating, parsed?.rating ?? null),
    returnPct: parsed?.returnPct ?? null,
    catalogProducts: api.metrics.products,
    catalogReviews: api.metrics.reviews,
    catalogShops: api.metrics.shops,
    locked,
    soldSource: sold.source,
    refusedSource: refused.source,
    complaintsSource: complaints.source,
    status,
    fetchedAt: new Date().toISOString(),
  };
}
