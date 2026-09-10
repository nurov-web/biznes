/**
 * POST /api/ai/advise — короткий совет с action items.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { completeClaude } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { readDb } from "@/lib/store";
import { tajikReplyScript } from "@/lib/tajik-text";
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
    const db = await readDb();
    const products = db.products
      .filter((p) => p.businessId === business.id && !p.archived)
      .slice(0, 20);
    const latinTg = tajikReplyScript(parsed.data.question) === "latin";
    const fallback =
      locale === "en"
        ? "1) Raise the share of SKUs with margin >25% in your niche. 2) Do not restock SKUs that did not move in 30 days. 3) Check 3 competitor prices this week. Forecast, not a guarantee."
        : locale === "ru"
          ? "1) Поднимите долю SKU с маржой >25% в вашем направлении. 2) Не докупайте SKU, которые не ушли за 30 дней. 3) Сверьте 3 цены конкурентов на этой неделе. Это прогноз, не гарантия."
          : latinTg
            ? "1) Hissai SKU-hoi marjaaashon >25%-ro dar samti khud ziyod kuned. 2) SKU-e, ki 30 ruz furukhta nashud, nakharid. 3) In hafta 3 narxi raqibro sanjed. In peshgii ast, na kafolat."
            : "1) Ҳиссаи SKU-ҳои маржаашон >25%-ро дар самти худ зиёд кунед. 2) SKU-е, ки 30 рӯз фурӯхта нашуд, нахаред. 3) Ин ҳафта 3 нархи рақибро санҷед. Ин пешгӯӣ аст, на кафолат.";
    try {
      const answer = await completeClaude(
        businessSystemPrompt({
          locale,
          ownerFocus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
          ownerMessage: parsed.data.question,
          role: "You are the owner’s advisor for this week’s cash, price and stock.",
          format: "Format: one short fact → example with TJS → 3 numbered actions. No fluff.",
        }),
        `Q: ${parsed.data.question}\nBusiness: ${business.name}, ${business.city}, ${business.type}\nDirection: ${business.goal || business.typeNote || "—"}\nProducts: ${JSON.stringify(products).slice(0, 4000)}`,
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
