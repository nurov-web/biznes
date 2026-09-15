/**
 * POST /api/auth/logout — сессияро мебандад. Куки bp_account мемонад, то ҳисобро аз нав накушоед.
 */
import { NextResponse } from "next/server";
import { clearSessionCookie, clearSessionOnResponse } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  const res = NextResponse.json({ ok: true });
  clearSessionOnResponse(res);
  return res;
}
