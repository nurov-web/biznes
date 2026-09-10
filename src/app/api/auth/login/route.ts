/**
 * POST /api/auth/login — email или телефон + пароль.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import {
  assertAuthConfigured,
  JWT_NOT_CONFIGURED,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { normalizePhone } from "@/lib/phone";
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
  const raw = parsed.data.login.trim();
  const email = raw.toLowerCase();
  const phone = normalizePhone(raw);
  const user = readDb().users.find(
    (u) => u.email === email || (phone.length >= 10 && normalizePhone(u.phone) === phone),
  );
  if (!user) return jsonError("invalid_credentials", 401);
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("invalid_credentials", 401);
  try {
    assertAuthConfigured();
    await setSessionCookie(user.id, user.role as Role, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error("[login]", error);
    if (error instanceof Error && error.message === JWT_NOT_CONFIGURED) {
      return jsonError("config", 503);
    }
    return jsonError("server", 500);
  }
  return NextResponse.json({
    ok: true,
    phoneVerified: user.phoneVerified,
  });
}
