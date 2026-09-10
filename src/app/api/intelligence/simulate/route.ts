import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { buildIntelligence, defaultSim, simulate } from "@/services/intelligence/engine";
import { addAudit, addMemory } from "@/services/intelligence/persist";
import { readDb } from "@/lib/store";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  save: z.boolean().optional(),
  priceDeltaPct: z.number().min(-80).max(200).optional(),
  volumeDeltaPct: z.number().min(-80).max(200).optional(),
  marketingSpend: z.number().min(0).max(1_000_000).optional(),
  salesDeltaPct: z.number().min(-90).max(200).optional(),
  costDeltaPct: z.number().min(-50).max(200).optional(),
  supplierDeltaPct: z.number().min(-50).max(200).optional(),
  competitorDeltaPct: z.number().min(-80).max(80).optional(),
  demandDeltaPct: z.number().min(-90).max(200).optional(),
  fxDeltaPct: z.number().min(-50).max(80).optional(),
  supplyCutPct: z.number().min(0).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const db = await readDb();
    const snap = buildIntelligence(db, business, locale);
    const sim = simulate(
      snap,
      {
        ...defaultSim(),
        priceDeltaPct: parsed.data.priceDeltaPct ?? 0,
        volumeDeltaPct: parsed.data.volumeDeltaPct ?? 0,
        marketingSpend: parsed.data.marketingSpend ?? 0,
        salesDeltaPct: parsed.data.salesDeltaPct ?? 0,
        costDeltaPct: parsed.data.costDeltaPct ?? 0,
        supplierDeltaPct: parsed.data.supplierDeltaPct ?? 0,
        competitorDeltaPct: parsed.data.competitorDeltaPct ?? 0,
        demandDeltaPct: parsed.data.demandDeltaPct ?? 0,
        fxDeltaPct: parsed.data.fxDeltaPct ?? 0,
        supplyCutPct: parsed.data.supplyCutPct ?? 0,
      },
      locale,
    );
    if (parsed.data.save) {
      await addMemory(business.id, "twin", "Simulation", sim);
      await addAudit(business.id, user.id, "intelligence.simulate");
    }
    return NextResponse.json({ sim, baseline: { revenue: snap.revenue, profit: snap.profit } });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
