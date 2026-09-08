/**
 * POST /api/onboarding — шаги 2–5 ТЗ.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BUSINESS_TYPES, CHANNELS } from "@/constants";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const productSchema = z.object({
  category: z.string().trim().min(1).max(80),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(120),
  buyPriceMin: z.number().nonnegative(),
  buyPriceMax: z.number().nonnegative(),
  sellPriceMin: z.number().nonnegative(),
  sellPriceMax: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  condition: z.enum(["new", "used"]),
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(BUSINESS_TYPES),
  typeNote: z.string().max(500).default(""),
  city: z.string().trim().min(1).max(80),
  region: z.string().max(80).default(""),
  yearsOpen: z.number().int().min(0).max(80),
  employees: z.number().int().min(1).max(5000),
  channel: z.enum(CHANNELS),
  competitors: z.string().max(1000).default(""),
  audience: z.string().max(200).default(""),
  products: z.array(productSchema).max(50).default([]),
  monthlyRevenue: z.number().min(0).max(100_000_000).default(0),
  monthlyCost: z.number().min(0).max(100_000_000).default(0),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user.phoneVerified) return jsonError("phone_unverified", 403);
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return jsonError("validation", 400);
    const data = parsed.data;
    const now = nowIso();
    const existing = readDb().businesses.find((b) => b.ownerId === user.id);
    const businessId = existing?.id ?? newId();
    withDb((db) => {
      if (existing) {
        const row = db.businesses.find((b) => b.id === existing.id);
        if (row) {
          Object.assign(row, {
            name: data.name,
            type: data.type,
            typeNote: data.typeNote,
            city: data.city,
            region: data.region,
            yearsOpen: data.yearsOpen,
            employees: data.employees,
            channel: data.channel,
            competitors: data.competitors,
            audience: data.audience,
            onboardingDone: true,
            stage: "running" as const,
            updatedAt: now,
          });
        }
      } else {
        db.businesses.push({
          id: businessId,
          ownerId: user.id,
          name: data.name,
          type: data.type,
          typeNote: data.typeNote,
          city: data.city,
          region: data.region,
          yearsOpen: data.yearsOpen,
          employees: data.employees,
          channel: data.channel,
          competitors: data.competitors,
          audience: data.audience,
          onboardingDone: true,
          stage: "running",
          budget: 0,
          goal: "",
          experience: "",
          createdAt: now,
          updatedAt: now,
        });
      }
      for (const p of data.products) {
        db.products.push({
          id: newId(),
          businessId,
          ...p,
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      // Даромад/хароҷоти моҳона ҳамчун нуқтаи оғоз барои муҳаррик.
      const monthly: [string, number][] = [
        ["income", data.monthlyRevenue],
        ["expense", data.monthlyCost],
      ];
      for (const [type, amount] of monthly) {
        if (amount <= 0) continue;
        db.financeEntries.push({
          id: newId(),
          businessId,
          type,
          amount,
          category: "onboarding",
          note: "onboarding baseline",
          entryDate: now,
          createdAt: now,
        });
      }
    });
    return NextResponse.json({ ok: true, businessId });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    console.error("[onboarding]", error);
    return jsonError("server", 500);
  }
}
