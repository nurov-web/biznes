/**
 * POST /api/ai/chat — чати мушовири бизнес (Gemini).
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
import { businessSystemPrompt } from "@/services/ai/business-system";
import { completeGemini, geminiConfigured } from "@/services/ai/gemini";
import { wrapOwnerMessage } from "@/lib/tajik-text";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).default("tg"),
  messages: z.array(turnSchema).min(1).max(16),
});

function fallback(locale: AppLocale): string {
  if (locale === "en") {
    return "I only help with business: price, stock, sales and cash in TJS. Write one concrete shop question. Forecast, not a guarantee.";
  }
  if (locale === "ru") {
    return "Я помогаю только по бизнесу: цена, запас, продажи и касса в сомони. Напишите один конкретный вопрос по магазину. Это прогноз, не гарантия.";
  }
  return "Ман танҳо оид ба бизнес кӯмак мекунам: нарх, захира, фурӯш ва пули нақд бо сомонӣ. Як саволи мушаххаси мағоза нависед. Ин пешгӯӣ аст, на кафолат.";
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

    if (!geminiConfigured()) {
      return NextResponse.json({ answer: fallback(locale), usedAi: false });
    }

    let shopLine = "";
    if (user) {
      const db = await readDb();
      const business = await getOwnedBusiness(user.id);
      const pilot = db.pilotProfiles
        .filter((row) => row.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      shopLine = [
        business ? `Shop: ${business.name}, ${business.city}, ${business.type}` : "",
        business?.goal || business?.typeNote || "",
        pilot
          ? `Product: ${pilot.product}; region: ${pilot.region}; category: ${pilot.category}; problem: ${pilot.problem}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    const question = last.content;
    try {
      const answer = await completeGemini({
        system: businessSystemPrompt({
          locale,
          ownerFocus: shopLine,
          ownerMessage: question,
          role: [
            "You are the in-app business chat of BusinessPilot AI for shop owners in Tajikistan.",
            "Answer ONLY business questions: price, stock, sales, costs, customers, suppliers, cash, Instagram/WhatsApp trade, market stalls, wholesale.",
            "If the message is not about business (politics, coding, medicine, homework, jokes), reply in one sentence that you only help with business, then ask one business question.",
            "Every useful reply: short fact → number in TJS when money is involved → 2 to 4 numbered next steps. No fluff, no guaranteed profit, no fake Somon/OLX prices.",
          ].join(" "),
          format: "Plain text. No markdown tables. Numbered actions.",
        }),
        messages: parsed.data.messages.map((row, index) =>
          index === parsed.data.messages.length - 1 && row.role === "user"
            ? { role: "user", content: `${wrapOwnerMessage(row.content)}\n${shopLine}`.trim() }
            : row,
        ),
      });
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
