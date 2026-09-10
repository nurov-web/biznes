/**
 * POST /api/startup/plan — нақшаи оғоз барои корбари бе бизнес.
 * GET  /api/startup/plan — нақшаи охирини захирашуда.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser, stampAuthCookiesByUserId } from "@/lib/auth";
import { getOwnedBusiness, requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { planStartup } from "@/services/ai/startup";
import { addAudit } from "@/services/intelligence/persist";
import { newId, nowIso, readDb, withDb, type PlanRow } from "@/lib/store";

const schema = z.object({
  locale: z.enum(["tg", "ru", "en"]).optional(),
  budget: z.number().min(0).max(100_000_000),
  city: z.string().trim().min(1).max(80),
  goal: z.string().trim().max(500).default(""),
  experience: z.string().trim().max(300).default(""),
  hoursPerWeek: z.number().int().min(1).max(120).default(40),
  name: z.string().trim().max(120).default(""),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const db = await readDb();
    const plan = db.plans
      .filter((p) => p.businessId === business.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return NextResponse.json({ plan: plan ?? null, stage: business.stage });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const data = parsed.data;
    const locale = parseLocale(data.locale);

    const generated = await planStartup({
      budget: data.budget,
      city: data.city,
      goal: data.goal,
      experience: data.experience,
      hoursPerWeek: data.hoursPerWeek,
      locale,
    });

    const existing = await getOwnedBusiness(user.id);
    const now = nowIso();
    const businessId = existing?.id ?? newId();
    const fallbackName = data.name || generated.options[0]?.name || "Business plan";

    const plan: PlanRow = {
      id: newId(),
      businessId,
      locale,
      budget: data.budget,
      city: data.city,
      goal: data.goal,
      summary: generated.summary,
      options: generated.options,
      warnings: generated.warnings,
      usedAi: generated.usedAi,
      createdAt: now,
    };

    await withDb((db) => {
      const row = db.businesses.find((b) => b.id === businessId);
      if (row) {
        Object.assign(row, {
          name: row.name || fallbackName,
          city: data.city,
          stage: "idea" as const,
          budget: data.budget,
          goal: data.goal,
          experience: data.experience,
          onboardingDone: true,
          updatedAt: now,
        });
      } else {
        db.businesses.push({
          id: businessId,
          ownerId: user.id,
          name: fallbackName,
          type: "trade",
          typeNote: data.goal,
          city: data.city,
          region: "",
          yearsOpen: 0,
          employees: 1,
          channel: "offline",
          competitors: "",
          audience: "",
          onboardingDone: true,
          stage: "idea",
          budget: data.budget,
          goal: data.goal,
          experience: data.experience,
          createdAt: now,
          updatedAt: now,
        });
      }
      db.plans.push(plan);
    });

    await addAudit(businessId, user.id, "startup.plan");
    const res = NextResponse.json({ plan, usedAi: generated.usedAi });
    await stampAuthCookiesByUserId(res, user.id);
    return res;
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    console.error("[startup.plan]", error);
    return jsonError("server", 500);
  }
}
