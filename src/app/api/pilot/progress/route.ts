/**
 * POST /api/pilot/progress — модули курс гузашт.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { PILOT_MODULE_COUNT } from "@/constants/pilot";
import { completeModule } from "@/services/pilot";

const schema = z.object({
  moduleId: z.number().int().min(1).max(PILOT_MODULE_COUNT),
  score: z.number().int().min(0).max(100),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    const row = await completeModule(user.id, parsed.data.moduleId, parsed.data.score);
    if (!row) return jsonError("score", 409);
    return NextResponse.json({ ok: true, progress: row });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
