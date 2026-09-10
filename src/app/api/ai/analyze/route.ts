/**
 * POST /api/ai/analyze — Claude + локальный fallback.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { analyzeLocal, buildAnalyzePrompt, mergeAi } from "@/services/ai/analyze";
import { completeClaude, extractJsonObject } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import { parseLocale } from "@/lib/locale-query";
import type { AppLocale } from "@/i18n/routing";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const body = (await request.json().catch(() => ({}))) as { locale?: AppLocale };
    const locale: AppLocale = parseLocale(body.locale);
    const products = readDb().products.filter(
      (p) => p.businessId === business.id && !p.archived,
    );
    const ctx = {
      locale,
      city: business.city,
      type: business.type,
      name: business.name,
      typeNote: business.typeNote,
      goal: business.goal,
      competitors: business.competitors,
      audience: business.audience,
      products: products.map((p) => ({
        category: p.category,
        brand: p.brand,
        model: p.model,
        buyPriceMin: p.buyPriceMin,
        buyPriceMax: p.buyPriceMax,
        sellPriceMin: p.sellPriceMin,
        sellPriceMax: p.sellPriceMax,
        quantity: p.quantity,
      })),
    };
    const local = analyzeLocal(ctx);
    let result = local;
    let usedAi = false;
    try {
      const text = await completeClaude(
        businessSystemPrompt({
          locale,
          jsonOnly: true,
          ownerFocus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
          format: "Practical advice with numbers. Never guarantee profit. Stay on this owner's niche.",
        }),
        buildAnalyzePrompt(ctx),
      );
      result = mergeAi(local, extractJsonObject(text));
      usedAi = true;
    } catch (error) {
      console.warn("[ai.analyze] fallback", error);
    }
    withDb((db) => {
      db.aiReports.push({
        id: newId(),
        businessId: business.id,
        payload: JSON.stringify(result),
        createdAt: nowIso(),
      });
    });
    return NextResponse.json({ result, usedAi });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
