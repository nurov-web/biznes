/**
 * Пайвасти мағозаи интернетӣ.
 * Парол bcrypt мешавад. Ба панели админи бегона ворид намешавем.
 */
import { hashPassword } from "@/lib/auth";
import { probeStoreReachable } from "@/lib/fetch-public-html";
import { detectStorePlatform, isStorePlatform, normalizeStoreUrl } from "@/lib/store-url";
import {
  newId,
  nowIso,
  readDb,
  withDb,
  type Database,
  type StoreConnectionRow,
  type StorePlatform,
} from "@/lib/store";
import { makeApiKey } from "@/services/integrations/keys";

export type PublicStore = {
  id: string;
  storeUrl: string;
  platform: StorePlatform;
  login: string;
  status: StoreConnectionRow["status"];
  reachable: boolean;
  ordersSync: boolean;
  lastCheckAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConnectOk = {
  ok: true;
  connection: PublicStore;
  key: string | null;
};

export type ConnectFail = {
  ok: false;
  error: string;
  fields?: Record<string, string>;
};

function toPublic(row: StoreConnectionRow, db: Database): PublicStore {
  const webhookSale = db.auditLogs.some(
    (a) => a.businessId === row.businessId && a.action === "ingest.sale",
  );
  return {
    id: row.id,
    storeUrl: row.storeUrl,
    platform: row.platform,
    login: row.login,
    status: row.status,
    reachable: row.reachable,
    // Фурӯши касса/CRM ин ҷо ҳисоб намешавад — танҳо POST /api/ingest/sale.
    ordersSync: webhookSale,
    lastCheckAt: row.lastCheckAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getStoreConnection(businessId: string): Promise<StoreConnectionRow | null> {
  const db = await readDb();
  return db.storeConnections.find((row) => row.businessId === businessId) ?? null;
}

export async function publicStoreOf(businessId: string): Promise<PublicStore | null> {
  const db = await readDb();
  const row = db.storeConnections.find((item) => item.businessId === businessId) ?? null;
  return row ? toPublic(row, db) : null;
}

export async function skipStore(businessId: string): Promise<PublicStore> {
  const now = nowIso();
  return withDb(async (db) => {
    const existing = db.storeConnections.find((row) => row.businessId === businessId);
    if (existing) {
      existing.status = "skipped";
      existing.updatedAt = now;
      existing.lastCheckAt = now;
      return toPublic(existing, db);
    }
    const row: StoreConnectionRow = {
      id: newId(),
      businessId,
      storeUrl: "",
      platform: "custom",
      login: "",
      passwordHash: "",
      status: "skipped",
      reachable: false,
      lastCheckAt: now,
      apiKeyId: null,
      createdAt: now,
      updatedAt: now,
    };
    db.storeConnections.push(row);
    return toPublic(row, db);
  });
}

export async function disconnectStore(businessId: string): Promise<boolean> {
  return withDb((db) => {
    const before = db.storeConnections.length;
    db.storeConnections = db.storeConnections.filter((row) => row.businessId !== businessId);
    return db.storeConnections.length < before;
  });
}

export async function connectStore(
  businessId: string,
  input: { storeUrl: string; login: string; password: string; platform?: string },
): Promise<ConnectOk | ConnectFail> {
  const storeUrl = normalizeStoreUrl(input.storeUrl);
  if (!storeUrl) {
    return { ok: false, error: "validation", fields: { storeUrl: "bad_url" } };
  }
  const login = input.login.trim();
  if (login.length < 2 || login.length > 80) {
    return { ok: false, error: "validation", fields: { login: "short" } };
  }
  if (input.password.length < 4 || input.password.length > 200) {
    return { ok: false, error: "validation", fields: { password: "short" } };
  }
  const platform: StorePlatform =
    input.platform && isStorePlatform(input.platform)
      ? input.platform
      : detectStorePlatform(storeUrl);
  const passwordHash = await hashPassword(input.password);
  const now = nowIso();
  const host = new URL(storeUrl).hostname.replace(/^www\./, "");
  const reachable = await probeStoreReachable(storeUrl);

  return withDb(async (db) => {
    const existing = db.storeConnections.find((row) => row.businessId === businessId);
    let rawKey: string | null = null;
    let apiKeyId = existing?.apiKeyId ?? null;
    if (!apiKeyId) {
      const made = makeApiKey(businessId, host.slice(0, 60) || "Store");
      db.apiKeys.push(made.row);
      apiKeyId = made.row.id;
      rawKey = made.raw;
    }
    if (existing) {
      existing.storeUrl = storeUrl;
      existing.platform = platform;
      existing.login = login;
      existing.passwordHash = passwordHash;
      existing.status = "connected";
      existing.reachable = reachable;
      existing.lastCheckAt = now;
      existing.apiKeyId = apiKeyId;
      existing.updatedAt = now;
      return { ok: true, connection: toPublic(existing, db), key: rawKey };
    }
    const row: StoreConnectionRow = {
      id: newId(),
      businessId,
      storeUrl,
      platform,
      login,
      passwordHash,
      status: "connected",
      reachable: reachable,
      lastCheckAt: now,
      apiKeyId,
      createdAt: now,
      updatedAt: now,
    };
    db.storeConnections.push(row);
    return { ok: true, connection: toPublic(row, db), key: rawKey };
  });
}
