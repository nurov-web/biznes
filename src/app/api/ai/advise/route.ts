/**
 * POST /api/ai/advise — короткий совет с action items.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { completeClaude } from "@/services/ai/claude";
import { readDb } from "@/lib/store";
import { llmLanguage } from "@/lib/locale-query";
import type { AppLocale } from "@/i18n/routing";

const schema = z.object({
  question: z.string().trim().min(1).max(1500),
  locale: z.enum(["tg", "ru", "en"]).default("tg"),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const locale: AppLocale = parsed.data.locale;
    const products = readDb()
      .products.filter((p) => p.businessId === business.id && !p.archived)
      .slice(0, 20);
    const fallback =
      locale === "en"
        ? "1) Raise the share of accessories with margin >25%. 2) Do not restock SKUs that did not move in 30 days. 3) Check 3 competitor prices this week. Forecast, not a guarantee."
        : locale === "ru"
          ? "1) Поднимите долю аксессуаров с маржой >25%. 2) Не докупайте SKU, которые не ушли за 30 дней. 3) Сверьте 3 цены конкурентов на этой неделе. Это прогноз, не гарантия."
          : "1) Ҳиссаи лавозимоти маржаашон >25%-ро зиёд кунед. 2) SKU-е, ки 30 рӯз фурӯхта нашуд, нахаред. 3) Ин ҳафта 3 нархи рақибро санҷед. Ин пешгӯӣ аст, на кафолат.";
    try {
      const answer = await completeClaude(
        `BusinessPilot advisor. Answer in ${llmLanguage(locale)}. Format: short → example with TJS → 3 numbered actions. No fluff.`,
        `Q: ${parsed.data.question}\nBusiness: ${business.name}, ${business.city}, ${business.type}\nProducts: ${JSON.stringify(products).slice(0, 4000)}`,
      );
      return NextResponse.json({ answer, usedAi: true });
    } catch {
      return NextResponse.json({ answer: fallback, usedAi: false });
    }
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
