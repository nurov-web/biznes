/**
 * POST /api/market/scan — муҳити шаҳр: AI + ҷустуҷӯи веб, на парсинги эълонҳо.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { scanCityMarket } from "@/services/ai/market-scan";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  city: z.string().trim().max(80).default("Душанбе"),
  type: z.string().trim().max(40).default("trade"),
  goal: z.string().trim().max(500).optional(),
  products: z
    .array(
      z.object({
        category: z.string().max(80).default(""),
        brand: z.string().max(80).default(""),
        model: z.string().max(120).default(""),
      }),
    )
    .max(12)
    .optional(),
});

export async function POST(request: Request) {
  try {
    await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const brief = await scanCityMarket({
      locale,
      city: parsed.data.city,
      type: parsed.data.type,
      goal: parsed.data.goal,
      products: parsed.data.products,
    });
    return NextResponse.json({ brief });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    console.error("[market.scan]", error);
    return jsonError("server", 500);
  }
}
