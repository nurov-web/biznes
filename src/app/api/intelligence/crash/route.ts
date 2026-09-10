import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { buildIntelligence, crashTest, CRASH_PRESETS, defaultShock } from "@/services/intelligence/engine";
import { addAudit, addMemory } from "@/services/intelligence/persist";
import { readDb } from "@/lib/store";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  preset: z
    .enum(["sales_down", "costs_up", "supplier_up", "competitor_down", "demand_down", "fx", "supply"])
    .optional(),
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
    const { locale: loc, preset: presetKey, ...rest } = parsed.data;
    const locale = parseLocale(loc);
    const preset = presetKey ? CRASH_PRESETS[presetKey] : undefined;
    const shock = {
      ...defaultShock(),
      ...(preset ?? {}),
      ...Object.fromEntries(
        Object.entries(rest).filter(([, value]) => typeof value === "number"),
      ),
    };
    const db = await readDb();
    const snap = buildIntelligence(db, business, locale);
    const result = crashTest(snap, shock, locale);
    await addMemory(business.id, "crash", `Crash ${presetKey || "custom"}`, result);
    await addAudit(business.id, user.id, "intelligence.crash");
    return NextResponse.json({ result, shock });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
