/**
 * POST /api/pilot/progress — модули курс. Балл дар сервер ҳисоб мешавад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { isModuleOpen, PILOT_MODULE_COUNT } from "@/constants/pilot";
import { PILOT_MODULE_ANSWERS } from "@/constants/pilot-course-answers";
import { completeModule, listCompletedModules } from "@/services/pilot";

const schema = z.object({
  moduleId: z.number().int().min(1).max(PILOT_MODULE_COUNT),
  answers: z.array(z.number().int().min(0).max(2)).min(1).max(8),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    const key = PILOT_MODULE_ANSWERS[parsed.data.moduleId];
    if (!key || parsed.data.answers.length !== key.length) {
      return jsonError("validation", 400);
    }
    const done = await listCompletedModules(user.id);
    if (!isModuleOpen(parsed.data.moduleId, done)) {
      return jsonError("locked", 409);
    }
    let correct = 0;
    key.forEach((expected, i) => {
      if (parsed.data.answers[i] === expected) correct += 1;
    });
    const score = Math.round((correct / key.length) * 100);
    const row = await completeModule(user.id, parsed.data.moduleId, score);
    if (!row) return jsonError("score", 409);
    return NextResponse.json({
      ok: true,
      score,
      correct: [...key],
      progress: row,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
