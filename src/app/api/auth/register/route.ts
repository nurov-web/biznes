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
  stampAuthCookies,
  verifyPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/client-ip";
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
  if (!rateLimit(`register:${clientIp(request)}`, 5, 15 * 60_000)) {
    return jsonError("rate", 429);
  }
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
    const db = await readDb();
    const existing = findUserByLogin(db.users, email, phone);
    if (existing) {
      const samePassword = existing.passwordHash
        ? await verifyPassword(data.password, existing.passwordHash)
        : false;
      if (samePassword || !existing.passwordHash) {
        if (!existing.passwordHash) {
          const passwordHash = await hashPassword(data.password);
          existing.passwordHash = passwordHash;
          existing.phoneVerified = true;
          try {
            await withDb((state) => {
              const row = state.users.find((u) => u.id === existing.id);
              if (!row) return;
              row.passwordHash = passwordHash;
              row.firstName = data.firstName || row.firstName;
              row.lastName = data.lastName || row.lastName;
              row.phone = phone || row.phone;
              row.offerAccepted = true;
              row.phoneVerified = true;
              row.updatedAt = nowIso();
            });
          } catch (error) {
            if (!(error instanceof StoreWriteError)) throw error;
            console.error("[register] store", error);
          }
        }
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
      phoneVerified: true,
      offerAccepted: true,
      role: "owner",
      aiCallsDate: "",
      aiCallsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await withDb((state) => {
        const again = findUserByLogin(state.users, email, phone);
        if (again) {
          throw new Error("USER_EXISTS");
        }
        state.users.push(user);
      });
    } catch (error) {
      if (error instanceof Error && error.message === "USER_EXISTS") {
        throw error;
      }
      if (!(error instanceof StoreWriteError)) throw error;
      console.error("[register] store", error);
    }
    return signedIn(user);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return jsonError("user_exists", 409);
    }
    console.error("[register]", error);
    return registerFail(error);
  }
}
