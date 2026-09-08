/**
 * POST /api/auth/login — email или телефон + пароль.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { readDb } from "@/lib/store";
import type { Role } from "@/constants";

const schema = z.object({
  login: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("invalid_json", 400);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return jsonError("validation", 400);
  const login = parsed.data.login.toLowerCase();
  const user = readDb().users.find(
    (u) => u.email === login || u.phone === parsed.data.login,
  );
  if (!user) return jsonError("invalid_credentials", 401);
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("invalid_credentials", 401);
  await setSessionCookie(user.id, user.role as Role);
  return NextResponse.json({
    ok: true,
    phoneVerified: user.phoneVerified,
  });
}
