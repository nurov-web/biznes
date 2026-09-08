/**
 * POST /api/auth/verify — подтверждение телефона по SMS-коду.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { verifySmsCode } from "@/lib/sms";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { nowIso, withDb } from "@/lib/store";

const schema = z.object({
  code: z.string().trim().min(4).max(8),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return jsonError("validation", 400);
    const ok = await verifySmsCode(user.phone, parsed.data.code);
    if (!ok) return jsonError("bad_code", 400);
    withDb((db) => {
      const row = db.users.find((u) => u.id === user.id);
      if (row) {
        row.phoneVerified = true;
        row.updatedAt = nowIso();
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
