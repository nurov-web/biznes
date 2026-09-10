import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { buildIntelligence, type AgentId } from "@/services/intelligence/engine";
import { completeClaudeWithTools } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { BUSINESS_TOOLS, makeToolRunner } from "@/services/ai/tools";
import { addAudit, addMemory } from "@/services/intelligence/persist";
import { readDb } from "@/lib/store";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  agent: z.enum(["ceo", "cfo", "marketing", "sales", "inventory", "market", "risk"]),
  question: z.string().trim().min(1).max(1500),
});

const ROLE: Record<AgentId, { ru: string; tg: string; en: string }> = {
  ceo: {
    ru: "Вы CEO-агент. Стратегия, приоритеты недели, капитал.",
    tg: "Шумо агенти CEO ҳастед. Стратегия, афзалиятҳои ҳафта, сармоя.",
    en: "You are the CEO agent. Strategy, weekly priorities, capital.",
  },
  cfo: {
    ru: "Вы CFO-агент. Маржа, кэш-флоу, закупки, риск кассы.",
    tg: "Шумо агенти CFO ҳастед. Маржа, ҷараёни пул, харид, хатари хазина.",
    en: "You are the CFO agent. Margin, cash-flow, purchasing, cash risk.",
  },
  marketing: {
    ru: "Вы Marketing-агент. Канал, сезон, акция без демпинга витрины.",
    tg: "Шумо агенти Marketing ҳастед. Канал, мавсим, аксия бе паст кардани витрина.",
    en: "You are the Marketing agent. Channel, season, promotion without dumping the shelf price.",
  },
  sales: {
    ru: "Вы Sales-агент. Скрипт продажи, допродажа в нише владельца, конверсия.",
    tg: "Шумо агенти Sales ҳастед. Скрипти фурӯш, фурӯши иловагӣ дар самти соҳибкор, конверсия.",
    en: "You are the Sales agent. Pitch, related upsell in the owner's niche, conversion.",
  },
  inventory: {
    ru: "Вы Inventory-агент. Остатки, dead stock, reorder.",
    tg: "Шумо агенти Inventory ҳастед. Захира, моли бефурӯш, хариди нав.",
    en: "You are the Inventory agent. Stock, dead stock, reorder.",
  },
  market: {
    ru: "Вы Market-агент. Спрос города, сезон, оценка ёмкости. Пометка: оценка, не перепись.",
    tg: "Шумо агенти Market ҳастед. Талаботи шаҳр, мавсим, ҳаҷми бозор. Ин баҳост, на барӯйхатгирӣ.",
    en: "You are the Market agent. City demand, season, capacity estimate. Estimate, not a census.",
  },
  risk: {
    ru: "Вы Risk-агент. Курс, поставщик, stock-out, конкурент. Survival.",
    tg: "Шумо агенти Risk ҳастед. Қурб, таъминкунанда, stock-out, рақиб. Survival.",
    en: "You are the Risk agent. FX, supplier, stock-out, competitor. Survival.",
  },
};

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const snap = buildIntelligence(readDb(), business, locale);
    const role = ROLE[parsed.data.agent][locale];
    const fallback =
      locale === "en"
        ? `${role} ${snap.shouldDo} Health ${snap.healthScore}/100. Forecast, not a guarantee.`
        : locale === "ru"
          ? `${role} ${snap.shouldDo} Health ${snap.healthScore}/100. Это прогноз, не гарантия.`
          : `${role} ${snap.shouldDo} Health ${snap.healthScore}/100. Ин пешгӯӣ аст, на кафолат.`;
    let answer = fallback;
    let toolsUsed: string[] = [];
    try {
      const result = await completeClaudeWithTools({
        system: businessSystemPrompt({
          locale,
          role,
          ownerFocus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
          format:
            "Call tools before any figure. Format: 1) fact from the data 2) risk or opportunity in TJS 3) one action.",
        }),
        user: `Question: ${parsed.data.question}\nBusiness: ${snap.businessName}, ${snap.city}, stage ${business.stage}. Direction: ${business.goal || business.typeNote || "—"}.`,
        tools: BUSINESS_TOOLS,
        runTool: makeToolRunner(business, locale),
      });
      answer = result.text;
      toolsUsed = result.toolsUsed;
    } catch (error) {
      console.warn("[agent] fallback", error);
    }
    addMemory(business.id, `agent:${parsed.data.agent}`, parsed.data.question.slice(0, 80), {
      answer: answer.slice(0, 4000),
    });
    addAudit(business.id, user.id, `agent.${parsed.data.agent}`);
    return NextResponse.json({
      answer,
      agent: parsed.data.agent,
      usedAi: toolsUsed.length > 0 || answer !== fallback,
      toolsUsed,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
