/**
 * Рақам танҳо агар дар HTML ёфт шавад. Ҳеҷ тахмин.
 */
export type ParsedShopPage = {
  title: string;
  sold: number | null;
  refused: number | null;
  complaints: number | null;
  reviews: number | null;
  rating: number | null;
  returnPct: number | null;
  walled: boolean;
};

function metaContent(html: string, key: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    "i",
  );
  return (html.match(re)?.[1] ?? html.match(alt)?.[1] ?? "").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .slice(0, 160);
}

function asCount(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  if (!Number.isInteger(n) || n < 0 || n > 50_000_000) return null;
  if (n >= 1900 && n <= 2100) return null;
  return n;
}

function asPct(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n * 10) / 10;
}

function asRating(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

function firstCount(html: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const match = html.match(re);
    const n = asCount(match?.[1] ?? match?.[2]);
    if (n !== null) return n;
  }
  return null;
}

function firstPct(html: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const match = html.match(re);
    const n = asPct(match?.[1]);
    if (n !== null) return n;
  }
  return null;
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = re.exec(html);
  while (match) {
    try {
      const parsed: unknown = JSON.parse(match[1] ?? "");
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed && typeof parsed === "object") {
        const rec = parsed as Record<string, unknown>;
        if (Array.isArray(rec["@graph"])) blocks.push(...rec["@graph"]);
        else blocks.push(parsed);
      }
    } catch {
      /* JSON-LD шикаста — намоиш намедиҳем */
    }
    match = re.exec(html);
  }
  return blocks;
}

function fromJsonLd(blocks: unknown[]): {
  title: string;
  sold: number | null;
  reviews: number | null;
  rating: number | null;
} {
  let title = "";
  let sold: number | null = null;
  let reviews: number | null = null;
  let rating: number | null = null;
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const rec = block as Record<string, unknown>;
    if (!title && typeof rec.name === "string") title = rec.name.slice(0, 120);
    const agg = rec.aggregateRating;
    if (agg && typeof agg === "object") {
      const a = agg as Record<string, unknown>;
      if (rating === null) rating = asRating(String(a.ratingValue ?? ""));
      if (reviews === null) reviews = asCount(String(a.reviewCount ?? a.ratingCount ?? ""));
    }
    const stats = rec.interactionStatistic;
    const list = Array.isArray(stats) ? stats : stats ? [stats] : [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const type = String(row.interactionType ?? row["@type"] ?? "");
      if (/Purchase|Order|Sold/i.test(type) && sold === null) {
        sold = asCount(String(row.userInteractionCount ?? row.count ?? ""));
      }
    }
  }
  return { title, sold, reviews, rating };
}

function looksWalled(html: string, title: string): boolean {
  const low = html.slice(0, 12_000).toLowerCase();
  const login =
    low.includes("log in") ||
    low.includes("войти") ||
    low.includes("create an account") ||
    low.includes('name="password"');
  const generic = !title || /^instagram$|^telegram$|^wildberries$|^ozon$/i.test(title);
  return login && generic;
}

/** Аз HTML танҳо рақамҳои ёфтшуда. */
export function parseShopHtml(html: string): ParsedShopPage {
  const ogTitle = decodeEntities(metaContent(html, "og:title") || metaContent(html, "twitter:title"));
  const tagTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")
    .replace(/<[^>]+>/g, " ")
    .trim();
  const ld = fromJsonLd(jsonLdBlocks(html));
  const title = decodeEntities(ld.title || ogTitle || tagTitle).slice(0, 120);

  const sold =
    ld.sold ??
    firstCount(html, [
      /"(?:ordersCount|salesCount|soldCount|purchasesCount|buyCount|orders_count|sold)"\s*:\s*"?(\d+)/i,
      /купили\s+(\d[\d\s]*)\s+раз/i,
      /продано\s*[:\-]?\s*(\d[\d\s]*)/i,
      /sold\s*[:\-]?\s*(\d[\d\s]*)/i,
      /фурӯхта(?:нд| шуд)?\s*[:\-]?\s*(\d[\d\s]*)/i,
      /хариданд\s+(\d[\d\s]*)/i,
    ]);

  const refused = firstCount(html, [
    /"(?:cancelCount|returnCount|refuseCount|returnsCount|cancellations)"\s*:\s*"?(\d+)/i,
    /отказ(?:ов|а)?\s*[:\-]?\s*(\d[\d\s]*)/i,
    /возврат(?:ов|а)?\s*[:\-]?\s*(\d[\d\s]*)/i,
    /отмен[аыё]\s*[:\-]?\s*(\d[\d\s]*)/i,
    /рад\s*[:\-]?\s*(\d[\d\s]*)/i,
  ]);

  const returnPct = firstPct(html, [
    /"(?:returnPercent|cancelPercent|refusePercent|buyoutPercent)"\s*:\s*"?([\d.]+)/i,
    /процент\s+(?:выкупа|возврата|отказ)\s*[:\-]?\s*([\d.,]+)\s*%/i,
  ]);

  const complaints = firstCount(html, [
    /"(?:complaintsCount|claimsCount|oneStarCount|rating1Count|negativeCount)"\s*:\s*"?(\d+)/i,
    /жалоб[аы]?\s*[:\-]?\s*(\d[\d\s]*)/i,
    /шикоят(?:ҳо)?\s*[:\-]?\s*(\d[\d\s]*)/i,
    /complaint[s]?\s*[:\-]?\s*(\d[\d\s]*)/i,
  ]);

  const reviews =
    ld.reviews ??
    firstCount(html, [
      /"(?:feedbacks|reviewsCount|reviewCount|reviews|feedbackCount)"\s*:\s*"?(\d+)/i,
      /(\d[\d\s]*)\s*(?:отзыв|оченк|тақриз)/i,
    ]);

  const rating =
    ld.rating ??
    asRating(
      html.match(/"(?:rating|ratingValue|productRating)"\s*:\s*"?([\d.]+)/i)?.[1] ??
        (metaContent(html, "og:rating") || ""),
    );

  return {
    title,
    sold,
    refused,
    complaints,
    reviews,
    rating,
    returnPct,
    walled: looksWalled(html, title),
  };
}
