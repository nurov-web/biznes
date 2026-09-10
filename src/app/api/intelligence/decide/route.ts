import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import {
  buildIntelligence,
  recommendedSim,
  simulate,
} from "@/services/intelligence/engine";
import { completeClaudeWithTools } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { BUSINESS_TOOLS, makeToolRunner } from "@/services/ai/tools";
import { addAction, addAudit, addMemory } from "@/services/intelligence/persist";
import { readDb } from "@/lib/store";
import { ownerReplyScript, wrapOwnerMessage } from "@/lib/tajik-text";

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
    const db = await readDb();
    const snap = buildIntelligence(db, business, locale);
    const simInput = recommendedSim(snap);
    const sim = simulate(snap, simInput, locale);
    const latinTg = ownerReplyScript(parsed.data.question ?? "", locale) === "latin";
    const explain =
      locale === "en" && !latinTg
        ? `Analyze: ${snap.happened} Why: ${snap.why} Simulation of the recommended step (price ${simInput.priceDeltaPct}%, volume ${simInput.volumeDeltaPct}%): ${sim.note} Recommend: ${snap.shouldDo}`
        : locale === "ru" && !latinTg
          ? `Анализ: ${snap.happened} Почему: ${snap.why} Симуляция рекомендуемого шага (цена ${simInput.priceDeltaPct}%, объём ${simInput.volumeDeltaPct}%): ${sim.note} Рекомендация: ${snap.shouldDo}`
          : latinTg
            ? `Tahlil: ${snap.happened} Charo: ${snap.why} Simulyatsiyai qadami tavsiyashuda (narx ${simInput.priceDeltaPct}%, hajm ${simInput.volumeDeltaPct}%): ${sim.note} Tavsiya: ${snap.shouldDo}`
            : `Таҳлил: ${snap.happened} Чаро: ${snap.why} Симуляцияи қадами тавсияшуда (нарх ${simInput.priceDeltaPct}%, ҳаҷм ${simInput.volumeDeltaPct}%): ${sim.note} Тавсия: ${snap.shouldDo}`;
    let narrative = explain;
    let usedAi = false;
    try {
      const result = await completeClaudeWithTools({
        system: businessSystemPrompt({
          locale,
          role: "You are the Decision Engine for this owner.",
          ownerFocus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
          ownerMessage: parsed.data.question,
          format:
            "Use tools. Run at least one simulation before you recommend. Four short labeled paragraphs: Analyze → Explain → Simulate → Recommend.",
        }),
        user: `${wrapOwnerMessage(parsed.data.question || "In hafta chi kunam?")}\nBusiness: ${snap.businessName}, ${snap.city}, stage ${business.stage}, budget ${business.budget} TJS. Direction: ${business.goal || business.typeNote || "—"}.`,
        tools: BUSINESS_TOOLS,
        runTool: makeToolRunner(business, locale),
      });
      narrative = result.text;
      usedAi = true;
    } catch (error) {
      console.warn("[decide] fallback", error);
    }
    const impact = snap.alerts[0]?.impactMonthly ?? Math.round(sim.profit - snap.profit);
    const action = await addAction(business.id, snap.shouldDo.slice(0, 140), narrative.slice(0, 800), impact);
    await addMemory(business.id, "decision", snap.shouldDo.slice(0, 120), {
      question: parsed.data.question || "",
      sim,
      healthScore: snap.healthScore,
    });
    await addAudit(business.id, user.id, "intelligence.decide");
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
