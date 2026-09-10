/**
 * Скани бозор: модели шаҳр + Claude + ҷустуҷӯи веб.
 * Нархҳои зиндаи Somon/OLX кашида намешаванд — ин пешгӯӣ аст.
 */
import { citySearchLocation, localMarketBrief } from "@/constants/city-market";
import { llmLanguage, type Locale } from "@/lib/locale-query";
import { detectNiche, nicheLabel, skuFitsNiche, type NicheId } from "@/lib/niche";
import {
  completeClaude,
  completeClaudeWeb,
  extractJsonObject,
} from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import type { MarketBrief, MarketSkuHint, MarketVerdict } from "@/types";

export type MarketScanInput = {
  locale: Locale;
  city: string;
  type: string;
  goal?: string;
  products?: Array<{ category: string; brand: string; model: string }>;
};

function asVerdict(value: unknown): MarketVerdict {
  return value === "good" || value === "avoid" ? value : "watch";
}

function asSku(raw: unknown, fallback: MarketSkuHint | undefined): MarketSkuHint | null {
  if (!raw || typeof raw !== "object") return fallback ?? null;
  const row = raw as Record<string, unknown>;
  const name = String(row.name ?? fallback?.name ?? "").trim();
  if (!name) return null;
  const buy = Number(row.typicalBuy);
  const sell = Number(row.typicalSell);
  return {
    name: name.slice(0, 80),
    category: String(row.category ?? fallback?.category ?? "").slice(0, 60),
    typicalBuy: Number.isFinite(buy) && buy > 0 ? Math.round(buy) : fallback?.typicalBuy ?? 0,
    typicalSell: Number.isFinite(sell) && sell > 0 ? Math.round(sell) : fallback?.typicalSell ?? 0,
    verdict: asVerdict(row.verdict),
    why: String(row.why ?? fallback?.why ?? "").slice(0, 280),
  };
}

function asList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const rows = value.map((item) => String(item).trim()).filter(Boolean).slice(0, 6);
  return rows.length ? rows : fallback;
}

function mergeBrief(
  base: MarketBrief,
  raw: unknown,
  usedAi: boolean,
  usedWeb: boolean,
  niche: NicheId,
): MarketBrief {
  if (!raw || typeof raw !== "object") {
    return { ...base, usedAi, usedWeb };
  }
  const o = raw as Record<string, unknown>;
  const climate =
    o.climate === "good" || o.climate === "hard" || o.climate === "mixed" ? o.climate : base.climate;
  const pricesRaw = Array.isArray(o.prices) ? o.prices : [];
  const prices = (pricesRaw.length ? pricesRaw : base.prices)
    .map((item, i) => asSku(item, base.prices[i]))
    .filter((item): item is MarketSkuHint => Boolean(item))
    .filter((item) => skuFitsNiche(item.name, item.category, niche))
    .slice(0, 6);
  const mergedPrices = prices.length ? prices : base.prices;
  return {
    city: base.city,
    type: base.type,
    climate,
    summary: String(o.summary ?? base.summary).slice(0, 600),
    demand: String(o.demand ?? base.demand).slice(0, 400),
    prices: mergedPrices,
    products: asList(
      o.products,
      mergedPrices.filter((p) => p.verdict !== "avoid").map((p) => p.name),
    ),
    risks: asList(o.risks, base.risks),
    opportunities: asList(o.opportunities, base.opportunities),
    usedAi,
    usedWeb,
    disclaimer: String(o.disclaimer ?? base.disclaimer).slice(0, 400),
  };
}

export async function scanCityMarket(input: MarketScanInput): Promise<MarketBrief> {
  const city = input.city.trim() || "Душанбе";
  const type = input.type.trim() || "trade";
  const goal = input.goal?.trim() || "";
  const productBlob = (input.products ?? [])
    .map((p) => `${p.category} ${p.brand} ${p.model}`)
    .join(" ");
  const niche = detectNiche(goal, productBlob, type);
  const base = localMarketBrief(city, type, input.locale, goal || productBlob);
  const label = nicheLabel(niche, input.locale);
  const prompt = [
    `Research the small-business climate in ${city}, Tajikistan for: ${label}.`,
    goal ? `Owner wrote this exact direction: «${goal}». Stay on it.` : "",
    input.products?.length ? `Owner already sells: ${JSON.stringify(input.products).slice(0, 800)}` : "",
    niche !== "phones"
      ? "Do NOT mention phones, laptops or gadget accessories unless the owner asked for that."
      : "",
    "Search the public web for demand, typical retail categories, rent/competition, and indicative TJS price ranges.",
    "Do NOT claim you scraped somon.tj or olx.tj listings. If you saw a forum/news/wiki number, treat it as an orienter.",
    `Reply in ${llmLanguage(input.locale)} as JSON only:`,
    `{"climate":"good"|"mixed"|"hard","summary":"","demand":"","prices":[{"name":"","category":"","typicalBuy":0,"typicalSell":0,"verdict":"good"|"watch"|"avoid","why":""}],"products":[],"risks":[],"opportunities":[],"disclaimer":""}`,
    "3–5 SKUs max, all in this niche. typicalBuy/typicalSell in TJS integers. Always say this is a forecast, not guaranteed profit.",
  ]
    .filter(Boolean)
    .join("\n");

  const system = businessSystemPrompt({
    locale: input.locale,
    jsonOnly: true,
    ownerFocus: goal || label,
    role: "You estimate city climate for this owner's niche only. Label every figure as an orienter, not a listing scrape.",
  });

  try {
    const web = await completeClaudeWeb({
      system,
      user: prompt,
      city: citySearchLocation(city).city,
      maxUses: 2,
    });
    const merged = mergeBrief(base, extractJsonObject(web.text), true, web.usedWeb, niche);
    return merged;
  } catch (error) {
    console.warn("[market-scan] web fallback", error);
  }

  try {
    const text = await completeClaude(system, prompt);
    const merged = mergeBrief(base, extractJsonObject(text), true, false, niche);
    return merged;
  } catch (error) {
    console.warn("[market-scan] local fallback", error);
    return { ...base, usedAi: false, usedWeb: false };
  }
}
