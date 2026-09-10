/**
 * GET /api/learn — роҳ ва пешрафт.
 * POST — ҷавоби дарс (тест).
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { localeFromRequest, parseLocale } from "@/lib/locale-query";
import { addAudit } from "@/services/intelligence/persist";
import { checkLesson, publicLearn } from "@/services/learn/progress";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const locale = localeFromRequest(request);
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
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({
        lessonId: z.string().trim().min(1).max(40),
        answerIndex: z.number().int().min(0).max(2),
        locale: z.enum(["tg", "ru", "en"]).optional(),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    const locale = parseLocale(parsed.data.locale);
    const result = await checkLesson(
      business.id,
      user.id,
      parsed.data.lessonId,
      parsed.data.answerIndex,
      locale,
    );
    if (!result.ok) {
      if (result.error === "not_found") return jsonError("not_found", 404);
      if (result.error === "locked") return jsonError("locked", 409);
      return jsonError("validation", 400);
    }
    if (result.correct && !result.already) {
      await addAudit(business.id, user.id, `learn.${parsed.data.lessonId}`);
    }
    return NextResponse.json(result);
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    console.error("[learn.check]", error);
    return jsonError("server", 500);
  }
}
