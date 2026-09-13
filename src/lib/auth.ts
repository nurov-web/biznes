import { createHash } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCOUNT_COOKIE, LOGIN_HINT_COOKIE, SESSION_COOKIE, type Role } from "@/constants";
import { GENERATED_SESSION_SECRET } from "@/lib/generated-session-secret";
import { normalizePhone } from "@/lib/phone";
import {
  nowIso,
  readDb,
  withDb,
  type BusinessRow,
  type UserRow,
} from "@/lib/store";
import type { SessionPayload, SessionProfile, SessionUser } from "@/types";

const SALT_ROUNDS = 12;
const SESSION_MAX_AGE = 60 * 60 * 24 * 180;
const ACCOUNT_MAX_AGE = 60 * 60 * 24 * 180;

export const JWT_NOT_CONFIGURED = "JWT_SECRET is not configured";

function encodeSecret(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function jwtSecrets(): Uint8Array[] {
  const seen = new Set<string>();
  const list: Uint8Array[] = [];
  const add = (value: string | undefined) => {
    const raw = value?.trim();
    if (!raw || seen.has(raw)) return;
    seen.add(raw);
    list.push(encodeSecret(raw));
  };
  add(process.env.JWT_SECRET);
  const project = process.env.VERCEL_PROJECT_ID?.trim();
  if (project) {
    add(createHash("sha256").update(`bp.session.v1:${project}`).digest("hex"));
  }
  add(GENERATED_SESSION_SECRET);
  if (process.env.NODE_ENV !== "production") {
    add("dev-only-not-for-production");
  }
  return list;
}

function jwtSecret(): Uint8Array {
  const first = jwtSecrets()[0];
  if (!first) {
    throw new Error(JWT_NOT_CONFIGURED);
  }
  return first;
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
  if (!passwordHash) return false;
  return compare(password, passwordHash);
}

function claimString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function claimBool(value: unknown): boolean {
  return value === true || value === "true";
}

function cookieBase(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
  };
}

/** Ҳамон path/secure, ки ҳангоми сабт — вагарна браузер кукиро намепошад. */
function cookieExpire(httpOnly = true) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };
}

function expireAuthCookiesOnStore(store: Awaited<ReturnType<typeof cookies>>): void {
  store.set(SESSION_COOKIE, "", cookieExpire());
  store.set(ACCOUNT_COOKIE, "", cookieExpire());
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    firstName: payload.firstName ?? "",
    lastName: payload.lastName ?? "",
    email: payload.email ?? "",
    phone: payload.phone ?? "",
    ph: payload.ph ?? "",
    bid: payload.bid ?? "",
    bname: payload.bname ?? "",
    bcity: payload.bcity ?? "",
    bdone: payload.bdone ?? false,
    btype: payload.btype ?? "",
    bnote: payload.bnote ?? "",
    bgoal: payload.bgoal ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("180d")
    .sign(jwtSecret());
}

export async function readSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  for (const secret of jwtSecrets()) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const sub = typeof payload.sub === "string" ? payload.sub : "";
      const role = payload.role;
      if (!sub || (role !== "owner" && role !== "manager" && role !== "cashier")) {
        continue;
      }
      return {
        sub,
        role,
        firstName: claimString(payload.firstName),
        lastName: claimString(payload.lastName),
        email: claimString(payload.email),
        phone: claimString(payload.phone),
        ph: claimString(payload.ph),
        bid: claimString(payload.bid),
        bname: claimString(payload.bname),
        bcity: claimString(payload.bcity),
        bdone: claimBool(payload.bdone),
        btype: claimString(payload.btype),
        bnote: claimString(payload.bnote),
        bgoal: claimString(payload.bgoal),
      };
    } catch {
      /* калиди дигар */
    }
  }
  return null;
}

function payloadFromUser(user: UserRow, business: BusinessRow | null): SessionPayload {
  return {
    sub: user.id,
    role: user.role as Role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    ph: user.passwordHash,
    bid: business?.id ?? "",
    bname: business?.name ?? "",
    bcity: business?.city ?? "",
    bdone: business?.onboardingDone ?? false,
    btype: business?.type ?? "",
    bnote: business?.typeNote ?? "",
    bgoal: business?.goal ?? "",
  };
}

function applyCookiesToResponse(res: NextResponse, token: string, loginHint: string): void {
  res.cookies.set(SESSION_COOKIE, token, cookieBase(SESSION_MAX_AGE));
  res.cookies.set(ACCOUNT_COOKIE, token, cookieBase(ACCOUNT_MAX_AGE));
  const hint = loginHint.trim().slice(0, 120);
  if (hint) {
    res.cookies.set(LOGIN_HINT_COOKIE, hint, cookieBase(ACCOUNT_MAX_AGE, false));
  }
}

export async function stampAuthCookies(
  res: NextResponse,
  user: UserRow,
  business?: BusinessRow | null,
): Promise<void> {
  const token = await signSession(payloadFromUser(user, business ?? null));
  applyCookiesToResponse(res, token, user.email || user.phone);
}

export async function stampAuthCookiesByUserId(res: NextResponse, userId: string): Promise<void> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;
  const business =
    db.businesses
      .filter((b) => b.ownerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  await stampAuthCookies(res, user, business);
}

export async function setSessionCookie(
  userId: string,
  role: Role,
  profile?: SessionProfile,
): Promise<void> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  const business =
    db.businesses
      .filter((b) => b.ownerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  const token = await signSession(
    user
      ? payloadFromUser(user, business)
      : {
          sub: userId,
          role,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          email: profile?.email,
          phone: profile?.phone,
        },
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieBase(SESSION_MAX_AGE));
  store.set(ACCOUNT_COOKIE, token, cookieBase(ACCOUNT_MAX_AGE));
  const hint = (user?.email || profile?.email || user?.phone || profile?.phone || "").trim().slice(0, 120);
  if (hint) {
    store.set(LOGIN_HINT_COOKIE, hint, cookieBase(ACCOUNT_MAX_AGE, false));
  }
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  expireAuthCookiesOnStore(store);
}

export function clearSessionOnResponse(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", cookieExpire());
  res.cookies.set(ACCOUNT_COOKIE, "", cookieExpire());
}

export async function readAuthPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value || store.get(ACCOUNT_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

function sessionUserFromRow(user: UserRow): SessionUser {
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

function sessionUserFromPayload(payload: SessionPayload): SessionUser | null {
  if (!payload.email && !payload.phone) return null;
  return {
    id: payload.sub,
    firstName: payload.firstName || "",
    lastName: payload.lastName || "",
    email: payload.email || "",
    phone: payload.phone || "",
    role: payload.role,
    phoneVerified: false,
  };
}

/** Ҳисобро аз куки ба снапшоти холӣ бармегардонад (Gmail як бор). */
export async function restoreAccountFromPayload(payload: SessionPayload): Promise<UserRow | null> {
  if (!payload.email && !payload.phone) return null;
  try {
    return await withDb((db) => {
      const email = payload.email?.toLowerCase() ?? "";
      const byId = db.users.find((u) => u.id === payload.sub);
      const byEmail = email ? db.users.find((u) => u.email === email) : undefined;
      let user = byId ?? byEmail;
      const now = nowIso();
      if (!user) {
        user = {
          id: payload.sub,
          firstName: payload.firstName || "",
          lastName: payload.lastName || "",
          email,
          phone: payload.phone || "",
          passwordHash: payload.ph || "",
          phoneVerified: false,
          offerAccepted: true,
          role: payload.role,
          createdAt: now,
          updatedAt: now,
        };
        db.users.push(user);
      } else if (!user.passwordHash && payload.ph) {
        user.passwordHash = payload.ph;
        user.updatedAt = now;
      }
      const ownerId = user.id;
      const hasBiz = db.businesses.some((b) => b.ownerId === ownerId || (payload.bid && b.id === payload.bid));
      if (!hasBiz && payload.bid) {
        db.businesses.push({
          id: payload.bid,
          ownerId,
          name: payload.bname || "",
          type: payload.btype || "trade",
          typeNote: payload.bnote || "",
          city: payload.bcity || "",
          region: "",
          yearsOpen: 0,
          employees: 1,
          channel: "offline",
          competitors: "",
          audience: "",
          onboardingDone: payload.bdone ?? false,
          stage: "running",
          budget: 0,
          goal: payload.bgoal || "",
          experience: "",
          createdAt: now,
          updatedAt: now,
        });
      }
      return user;
    });
  } catch (error) {
    console.error("[auth] барқарории ҳисоб", error);
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await readAuthPayload();
  if (!payload) return null;
  const db = await readDb();
  const email = payload.email?.toLowerCase() ?? "";
  const row =
    db.users.find((u) => u.id === payload.sub) ??
    (email ? db.users.find((u) => u.email === email) : undefined);
  if (row) {
    const hasBiz = db.businesses.some((b) => b.ownerId === row.id);
    if (!hasBiz && payload.bid) {
      await restoreAccountFromPayload(payload);
    }
    return sessionUserFromRow(row);
  }
  const restored = await restoreAccountFromPayload(payload);
  if (restored) return sessionUserFromRow(restored);
  return sessionUserFromPayload(payload);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function findUserByLogin(
  users: UserRow[],
  email: string,
  phone: string,
): UserRow | undefined {
  return users.find(
    (u) =>
      u.email === email ||
      (phone.length >= 10 && normalizePhone(u.phone) === phone),
  );
}
