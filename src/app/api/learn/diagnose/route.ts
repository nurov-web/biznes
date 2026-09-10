/**
 * POST /api/learn/diagnose — 10 ҷавоб → ташхиси мафкура бо AI.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { parseLocale } from "@/lib/locale-query";
import { addAudit } from "@/services/intelligence/persist";
import { diagnoseMind } from "@/services/ai/mind-diagnosis";
import { publicLearn, saveDiagnosis } from "@/services/learn/progress";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({
        answers: z.array(z.number().int().min(0).max(2)).length(10),
        locale: z.enum(["tg", "ru", "en"]).optional(),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const diagnosis = await diagnoseMind({
      answers: parsed.data.answers,
      locale,
      focus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
    });
    await saveDiagnosis(business.id, user.id, diagnosis);
    await addAudit(business.id, user.id, "learn.diagnose");
    return NextResponse.json(
      await publicLearn(business.id, user.id, locale, {
        goal: business.goal,
        typeNote: business.typeNote,
        name: business.name,
      }),
    );
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    console.error("[learn.diagnose]", error);
    return jsonError("server", 500);
  }
}
