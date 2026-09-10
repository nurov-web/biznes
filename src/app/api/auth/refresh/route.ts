/**
 * POST /api/auth/refresh — кукиҳои вурудро нав мекунад, то Gmail аз нав напурсед.
 */
import { NextResponse } from "next/server";
import { getSessionUser, stampAuthCookiesByUserId } from "@/lib/auth";
import { jsonError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return jsonError("unauthorized", 401);
  const res = NextResponse.json({ ok: true });
  await stampAuthCookiesByUserId(res, user.id);
  return res;
}
