/**
 * POST /api/onboarding/hints — маслиҳати AI ҳангоми пур кардани анкета.
 * Бе калиди Claude — маслиҳати маҳаллӣ.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { completeClaude, extractJsonObject } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { localMarketBrief } from "@/constants/city-market";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  type: z.string().trim().max(40).default("trade"),
  city: z.string().trim().max(80).default(""),
  name: z.string().trim().max(120).default(""),
  products: z
    .array(
      z.object({
        category: z.string().max(80).default(""),
        brand: z.string().max(80).default(""),
        model: z.string().max(120).default(""),
        buyPriceMin: z.number().default(0),
        sellPriceMin: z.number().default(0),
      }),
    )
    .max(20)
    .default([]),
});

function localHints(locale: "tg" | "ru" | "en", city: string): string[] {
  if (locale === "en") {
    return [
      `Write the buy price honestly — with transport to ${city || "your city"}, not just the invoice.`,
      "Under 15% margin a retail shop usually does not survive rent and losses.",
      "Enter 3 competitor prices right away, otherwise pricing advice stays generic.",
    ];
  }
  if (locale === "ru") {
    return [
      `Цену закупа пишите честно — с доставкой до ${city || "вашего города"}, а не только по накладной.`,
      "При марже ниже 15% розница обычно не вытягивает аренду и потери.",
      "Сразу внесите 3 цены конкурентов, иначе советы по цене будут общими.",
    ];
  }
  return [
    `Нархи харидро рост нависед — бо доставка то ${city || "шаҳри шумо"}, на танҳо аз рӯи ҳуҷҷат.`,
    "Бо маржаи камтар аз 15% чакана одатан иҷора ва зарарро намекашад.",
    "Дарҳол 3 нархи рақибро ворид кунед, вагарна маслиҳати нарх умумӣ мемонад.",
  ];
}

export async function POST(request: Request) {
  try {
    await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const data = parsed.data;
    const locale = parseLocale(data.locale);
    const market = localMarketBrief(data.city || "Душанбе", data.type, locale);
    const sku = market.prices.find((p) => p.verdict === "good") ?? market.prices[0];
    const fallback = sku
      ? [
          market.summary,
          `${sku.name}: ${sku.why}`,
          ...localHints(locale, data.city).slice(0, 1),
        ]
      : localHints(locale, data.city);

    try {
      const text = await completeClaude(
        businessSystemPrompt({
          locale,
          jsonOnly: true,
          role: "You coach the owner while they fill onboarding.",
          format: 'JSON: {"hints":["","",""]}. Exactly 3 hints, each under 160 characters, about their numbers.',
        }),
        JSON.stringify({
          businessType: data.type,
          city: data.city,
          name: data.name,
          products: data.products,
          cityClimate: market.climate,
          citySummary: market.summary,
        }).slice(0, 4000),
      );
      const raw = extractJsonObject(text) as { hints?: unknown };
      const hints = Array.isArray(raw.hints)
        ? raw.hints.map((h) => String(h)).filter(Boolean).slice(0, 3)
        : [];
      return NextResponse.json({ hints: hints.length ? hints : fallback, usedAi: hints.length > 0 });
    } catch (error) {
      console.warn("[onboarding.hints] fallback", error);
      return NextResponse.json({ hints: fallback, usedAi: false });
    }
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
