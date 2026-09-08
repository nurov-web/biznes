import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale, llmLanguage } from "@/lib/locale-query";
import {
  buildIntelligence,
  recommendedSim,
  simulate,
} from "@/services/intelligence/engine";
import { completeClaudeWithTools } from "@/services/ai/claude";
import { BUSINESS_TOOLS, makeToolRunner } from "@/services/ai/tools";
import { addAction, addAudit, addMemory } from "@/services/intelligence/persist";
import { readDb } from "@/lib/store";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  question: z.string().trim().max(1500).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const db = readDb();
    const snap = buildIntelligence(db, business, locale);
    const simInput = recommendedSim(snap);
    const sim = simulate(snap, simInput, locale);
    const explain =
      locale === "en"
        ? `Analyze: ${snap.happened} Why: ${snap.why} Simulation of the recommended step (price ${simInput.priceDeltaPct}%, volume ${simInput.volumeDeltaPct}%): ${sim.note} Recommend: ${snap.shouldDo}`
        : locale === "ru"
          ? `Анализ: ${snap.happened} Почему: ${snap.why} Симуляция рекомендуемого шага (цена ${simInput.priceDeltaPct}%, объём ${simInput.volumeDeltaPct}%): ${sim.note} Рекомендация: ${snap.shouldDo}`
          : `Таҳлил: ${snap.happened} Чаро: ${snap.why} Симуляцияи қадами тавсияшуда (нарх ${simInput.priceDeltaPct}%, ҳаҷм ${simInput.volumeDeltaPct}%): ${sim.note} Тавсия: ${snap.shouldDo}`;
    let narrative = explain;
    let usedAi = false;
    try {
      const result = await completeClaudeWithTools({
        system: `BusinessPilot Decision Engine. Language: ${llmLanguage(locale)}. Use the tools to read the real numbers and to run at least one simulation before you recommend. Pipeline in 4 short labeled paragraphs: Analyze → Explain → Simulate → Recommend. All money in TJS. Never guarantee profit. No jokes, no filler.`,
        user: `Question: ${parsed.data.question || "What should I do this week?"}\nBusiness: ${snap.businessName}, ${snap.city}, stage ${business.stage}, budget ${business.budget} TJS.`,
        tools: BUSINESS_TOOLS,
        runTool: makeToolRunner(business, locale),
      });
      narrative = result.text;
      usedAi = true;
    } catch (error) {
      console.warn("[decide] fallback", error);
    }
    const impact = snap.alerts[0]?.impactMonthly ?? Math.round(sim.profit - snap.profit);
    const action = addAction(business.id, snap.shouldDo.slice(0, 140), narrative.slice(0, 800), impact);
    addMemory(business.id, "decision", snap.shouldDo.slice(0, 120), {
      question: parsed.data.question || "",
      sim,
      healthScore: snap.healthScore,
    });
    addAudit(business.id, user.id, "intelligence.decide");
    return NextResponse.json({
      analyze: snap.happened,
      explain: snap.why,
      simulate: sim,
      recommend: snap.shouldDo,
      narrative,
      action,
      usedAi,
      willHappen: snap.willHappen,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
