/**
 * POST /api/auth/register
 * Регистрация: имя, телефон, email, пароль, оферта.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import {
  assertAuthConfigured,
  findUserByLogin,
  hashPassword,
  JWT_NOT_CONFIGURED,
  readAuthPayload,
  restoreAccountFromPayload,
  stampAuthCookies,
  verifyPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { normalizePhone } from "@/lib/phone";
import { newId, nowIso, readDb, StoreWriteError, withDb, type UserRow } from "@/lib/store";

export const dynamic = "force-dynamic";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .transform(normalizePhone)
    .pipe(z.string().min(10).max(20)),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(100),
  offerAccepted: z.literal(true),
});

function registerFail(error: unknown): ReturnType<typeof jsonError> {
  if (error instanceof StoreWriteError) return jsonError("storage", 503);
  if (error instanceof Error && error.message === JWT_NOT_CONFIGURED) {
    return jsonError("config", 503);
  }
  return jsonError("server", 500);
}

async function signedIn(user: UserRow): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  const db = await readDb();
  const business =
    db.businesses
      .filter((b) => b.ownerId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  await stampAuthCookies(res, user, business);
  return res;
}

export async function POST(request: Request) {
  if (originForbidden(request)) return jsonError("forbidden", 403);
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("invalid_json", 400);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fields[key]) fields[key] = issue.message;
    }
    return jsonError("validation", 400, fields);
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();
  const phone = data.phone;

  try {
    assertAuthConfigured();
    const saved = await readAuthPayload();
    if (saved && (saved.email === email || saved.phone === phone)) {
      if (saved.ph && (await verifyPassword(data.password, saved.ph))) {
        const user = (await restoreAccountFromPayload(saved)) ?? {
          id: saved.sub,
          firstName: saved.firstName || data.firstName,
          lastName: saved.lastName || data.lastName,
          email,
          phone,
          passwordHash: saved.ph,
          phoneVerified: false,
          offerAccepted: true,
          role: saved.role,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        return signedIn(user);
      }
      return jsonError("user_exists", 409);
    }

    const db = await readDb();
    const existing = findUserByLogin(db.users, email, phone);
    if (existing) {
      if (await verifyPassword(data.password, existing.passwordHash)) {
        return signedIn(existing);
      }
      return jsonError("user_exists", 409);
    }

    const now = nowIso();
    const user: UserRow = {
      id: newId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      phone,
      passwordHash: await hashPassword(data.password),
      phoneVerified: false,
      offerAccepted: true,
      role: "owner",
      createdAt: now,
      updatedAt: now,
    };
    await withDb((state) => {
      const again = findUserByLogin(state.users, email, phone);
      if (again) {
        throw new Error("USER_EXISTS");
      }
      state.users.push(user);
    });
    return signedIn(user);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return jsonError("user_exists", 409);
    }
    console.error("[register]", error);
    return registerFail(error);
  }
}
