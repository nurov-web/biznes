/**
 * POST /api/pilot/week — қадами ҳафта иҷро шуд / не.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { listWeekMarks, setWeekMark } from "@/services/pilot";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  done: z.boolean(),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    await setWeekMark(user.id, parsed.data.date, parsed.data.done);
    const weekDone = await listWeekMarks(user.id);
    return NextResponse.json({ ok: true, weekDone });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
