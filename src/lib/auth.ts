import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE, type Role } from "@/constants";
import { GENERATED_SESSION_SECRET } from "@/lib/generated-session-secret";
import { readDb } from "@/lib/store";
import type { SessionPayload, SessionProfile, SessionUser } from "@/types";

const SALT_ROUNDS = 12;

export const JWT_NOT_CONFIGURED = "JWT_SECRET is not configured";

function jwtSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim() || GENERATED_SESSION_SECRET.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(JWT_NOT_CONFIGURED);
    }
    return new TextEncoder().encode("dev-only-not-for-production");
  }
  return new TextEncoder().encode(raw);
}

/** Пеш аз сабти ҳисоб — то ятим намонад. */
export function assertAuthConfigured(): void {
  jwtSecret();
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

function claimString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    firstName: payload.firstName ?? "",
    lastName: payload.lastName ?? "",
    email: payload.email ?? "",
    phone: payload.phone ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const role = payload.role;
    if (!sub || (role !== "owner" && role !== "manager" && role !== "cashier")) {
      return null;
    }
    return {
      sub,
      role,
      firstName: claimString(payload.firstName),
      lastName: claimString(payload.lastName),
      email: claimString(payload.email),
      phone: claimString(payload.phone),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  userId: string,
  role: Role,
  profile?: SessionProfile,
): Promise<void> {
  const token = await signSession({
    sub: userId,
    role,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    email: profile?.email,
    phone: profile?.phone,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await readSessionToken(token);
  if (!payload) return null;
  const user = (await readDb()).users.find((u) => u.id === payload.sub);
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role as Role,
    phoneVerified: user.phoneVerified,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
