/**
 * POST /api/startup/adopt — интихоби як варианти нақша ва пур кардани анбор.
 * Пас аз ин муҳаррики зеҳнӣ бо ҳамон рақамҳо кор мекунад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { addAudit, addMemory } from "@/services/intelligence/persist";
import { businessTypeForNiche, detectNiche } from "@/lib/niche";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const schema = z.object({
  planId: z.string().trim().min(1).max(80),
  optionIndex: z.number().int().min(0).max(9),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);

    const db = await readDb();
    const plan = db.plans.find(
      (p) => p.id === parsed.data.planId && p.businessId === business.id,
    );
    if (!plan) return jsonError("not_found", 404);
    const option = plan.options[parsed.data.optionIndex];
    if (!option) return jsonError("not_found", 404);

    const now = nowIso();
    const added = await withDb((db) => {
      const row = db.businesses.find((b) => b.id === business.id);
      if (row) {
        row.name = option.name;
        row.goal = plan.goal || row.goal;
        row.typeNote = plan.goal || option.name;
        row.type = businessTypeForNiche(detectNiche(plan.goal, option.name));
        row.updatedAt = now;
      }
      let n = 0;
      for (const item of option.products) {
        if (!item.name || item.buyPrice <= 0) continue;
        db.products.push({
          id: newId(),
          businessId: business.id,
          category: option.name.slice(0, 80),
          brand: item.supplier.slice(0, 80) || "—",
          model: item.name.slice(0, 120),
          buyPriceMin: item.buyPrice,
          buyPriceMax: item.buyPrice,
          sellPriceMin: item.sellPrice,
          sellPriceMax: item.sellPrice,
          quantity: Math.max(0, item.quantity),
          condition: "new",
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
        n += 1;
      }
      return n;
    });

    await addMemory(business.id, "plan_adopted", option.name.slice(0, 120), {
      planId: plan.id,
      monthlyProfit: option.monthlyProfit,
      breakEvenMonths: option.breakEvenMonths,
    });
    await addAudit(business.id, user.id, "startup.adopt");
    return NextResponse.json({ ok: true, products: added });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
