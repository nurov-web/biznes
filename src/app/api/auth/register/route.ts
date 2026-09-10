/**
 * POST /api/auth/register
 * Регистрация: имя, телефон, email, пароль, оферта.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { assertAuthConfigured, hashPassword, JWT_NOT_CONFIGURED, setSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { normalizePhone } from "@/lib/phone";
import { newId, nowIso, readDb, StoreWriteError, withDb } from "@/lib/store";

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
  const db = await readDb();
  const existing = db.users.find(
    (u) => u.email === email || normalizePhone(u.phone) === phone,
  );
  if (existing) {
    return jsonError("user_exists", 409);
  }
  try {
    assertAuthConfigured();
    const now = nowIso();
    const user = {
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
    await withDb((db) => {
      db.users.push(user);
    });
    await setSessionCookie(user.id, "owner", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("[register]", error);
    return registerFail(error);
  }
}
