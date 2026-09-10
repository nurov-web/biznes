/**
 * POST /api/auth/login — email или телефон + пароль.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import {
  assertAuthConfigured,
  findUserByLogin,
  JWT_NOT_CONFIGURED,
  readAuthPayload,
  restoreAccountFromPayload,
  stampAuthCookies,
  verifyPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { clientIp } from "@/lib/client-ip";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/phone";
import { nowIso, readDb, type UserRow } from "@/lib/store";
import type { Role } from "@/constants";

export const dynamic = "force-dynamic";

const schema = z.object({
  login: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(100),
});

async function signedIn(user: UserRow): Promise<NextResponse> {
  const db = await readDb();
  const business =
    db.businesses
      .filter((b) => b.ownerId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  const res = NextResponse.json({
    ok: true,
    phoneVerified: user.phoneVerified,
  });
  await stampAuthCookies(res, user, business);
  return res;
}

export async function POST(request: Request) {
  if (originForbidden(request)) return jsonError("forbidden", 403);
  if (!rateLimit(`login:${clientIp(request)}`, 8, 60_000)) {
    return jsonError("rate", 429);
  }
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

  try {
    assertAuthConfigured();
    const db = await readDb();
    let user = findUserByLogin(db.users, email, phone);

    if (!user) {
      const saved = await readAuthPayload();
      const loginMatches =
        saved &&
        ((saved.email && saved.email === email) ||
          (phone.length >= 10 && saved.phone === phone));
      if (loginMatches && saved.ph && (await verifyPassword(parsed.data.password, saved.ph))) {
        user =
          (await restoreAccountFromPayload(saved)) ??
          ({
            id: saved.sub,
            firstName: saved.firstName || "",
            lastName: saved.lastName || "",
            email: saved.email || email,
            phone: saved.phone || phone,
            passwordHash: saved.ph,
            phoneVerified: false,
            offerAccepted: true,
            role: saved.role as Role,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          } satisfies UserRow);
      }
    }

    if (!user) return jsonError("invalid_credentials", 401);
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return jsonError("invalid_credentials", 401);
    return signedIn(user);
  } catch (error) {
    console.error("[login]", error);
    if (error instanceof Error && error.message === JWT_NOT_CONFIGURED) {
      return jsonError("config", 503);
    }
    return jsonError("server", 500);
  }
}
