/**
 * POST /api/pilot/choose — интихоби пешниҳод.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { chooseSuggestion } from "@/services/pilot";
import { stampAuthCookiesByUserId } from "@/lib/auth";

const schema = z.object({ index: z.number().int().min(0).max(20) });

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    const row = await chooseSuggestion(user.id, parsed.data.index);
    if (!row) return jsonError("not_found", 404);
    const res = NextResponse.json({ ok: true });
    await stampAuthCookiesByUserId(res, user.id);
    return res;
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
