/**
 * POST /api/auth/register
 * Регистрация: имя, телефон, email, пароль, оферта.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api-error";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(9).max(20),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(100),
  offerAccepted: z.literal(true),
});

export async function POST(request: Request) {
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
  const existing = readDb().users.find((u) => u.email === email || u.phone === data.phone);
  if (existing) {
    return jsonError("user_exists", 409);
  }
  try {
    const now = nowIso();
    const user = {
      id: newId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      phoneVerified: true,
      offerAccepted: true,
      role: "owner",
      createdAt: now,
      updatedAt: now,
    };
    withDb((db) => {
      db.users.push(user);
    });
    await setSessionCookie(user.id, "owner");
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("[register]", error);
    return jsonError("server", 500);
  }
}
