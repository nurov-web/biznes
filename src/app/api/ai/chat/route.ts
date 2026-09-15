/**
 * POST /api/ai/chat — чати ИИ: ҳар саволи соҳиб ҷавоб мегирад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/business";
import { jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/client-ip";
import { consumeAiQuota } from "@/lib/ai-quota";
import { readDb } from "@/lib/store";
import { chatSystemPrompt } from "@/services/ai/business-system";
import { completeAi } from "@/services/ai/complete";
import { latestShopPulse, pulseFacts } from "@/services/shop-pulse";
import type { AppLocale } from "@/i18n/routing";
import type { ChatTurn } from "@/services/ai/gemini";

export const dynamic = "force-dynamic";

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).default("tg"),
  messages: z.array(turnSchema).min(1).max(20),
});

function fallback(locale: AppLocale): string {
  if (locale === "en") {
    return "AI did not answer this time. Send the question again. I do not invent Somon/OLX prices.";
  }
  if (locale === "ru") {
    return "ИИ сейчас не ответил. Напишите вопрос ещё раз. Цены Somon/OLX не выдумываю.";
  }
  return "ИИ ҳоло ҷавоб надод. Саволро бори дигар фиристед. Нархи Somon/OLX-ро дурӯғ намегӯям.";
}

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const ip = clientIp(request);
    if (!rateLimit(`chat:${ip}`, 40, 60 * 60_000)) return jsonError("rate", 429);

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return jsonError("invalid_json", 400);
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parsed.data.locale;
    const last = parsed.data.messages[parsed.data.messages.length - 1];
    if (!last || last.role !== "user") return jsonError("validation", 400);

    const user = await getSessionUser();
    if (user) {
      if (!(await consumeAiQuota(user.id, 40))) return jsonError("rate", 429);
    }

    let shopLine = "";
    if (user) {
      const db = await readDb();
      const business = await getOwnedBusiness(user.id);
      const pilot = db.pilotProfiles
        .filter((row) => row.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const products = business
        ? db.products
            .filter((row) => row.businessId === business.id && !row.archived)
            .slice(0, 15)
            .map((row) => `${row.brand} ${row.model}: ${row.sellPriceMin}–${row.sellPriceMax} TJS × ${row.quantity}`)
            .join("; ")
        : "";
      const pulse = await latestShopPulse(user.id);
      shopLine = [
        business ? `Shop: ${business.name}, ${business.city}, ${business.type}` : "",
        business?.goal || business?.typeNote || "",
        products ? `Catalog: ${products}` : "",
        pilot
          ? `Product: ${pilot.product}; region: ${pilot.region}; volume: ${pilot.volume}; price: ${pilot.price} TJS; category: ${pilot.category}; channels: ${pilot.channels.join(", ") || "—"}; problem: ${pilot.problem}`
          : "",
        pulse ? pulseFacts(pulse) : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    const question = last.content;
    const history: ChatTurn[] = parsed.data.messages.map((row) => ({
      role: row.role,
      content: row.content,
    }));

    try {
      const answer = await completeAi(
        chatSystemPrompt({
          locale,
          ownerMessage: question,
          shopFacts: shopLine || undefined,
        }),
        history,
        { timeoutMs: 28000, maxTokens: 4096, temperature: 0.5 },
      );
      return NextResponse.json({ answer, usedAi: true });
    } catch (error) {
      console.error("[ai/chat]", error instanceof Error ? error.message : "fail");
      return NextResponse.json({ answer: fallback(locale), usedAi: false });
    }
  } catch (error) {
    console.error("[ai/chat]", error instanceof Error ? error.message : "fail");
    return jsonError("server", 500);
  }
}
