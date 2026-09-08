/**
 * Калидҳои API барои POS ва системаҳои беруна.
 * Калиди пурра танҳо як бор нишон дода мешавад; дар база — танҳо hash.
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { newId, nowIso, readDb, withDb, type ApiKeyRow } from "@/lib/store";

const PREFIX = "bp_live_";

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function createApiKey(businessId: string, name: string): { row: ApiKeyRow; raw: string } {
  const secret = randomBytes(24).toString("base64url");
  const raw = `${PREFIX}${secret}`;
  const row: ApiKeyRow = {
    id: newId(),
    businessId,
    name: name.slice(0, 60) || "POS",
    prefix: raw.slice(0, PREFIX.length + 4),
    keyHash: hashKey(raw),
    createdAt: nowIso(),
    lastUsedAt: null,
  };
  withDb((db) => {
    db.apiKeys.push(row);
  });
  return { row, raw };
}

export function listApiKeys(businessId: string): ApiKeyRow[] {
  return readDb()
    .apiKeys.filter((k) => k.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function revokeApiKey(businessId: string, id: string): boolean {
  return withDb((db) => {
    const before = db.apiKeys.length;
    db.apiKeys = db.apiKeys.filter((k) => !(k.id === id && k.businessId === businessId));
    return db.apiKeys.length < before;
  });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Калидро месанҷад ва businessId-ро бармегардонад. */
export function resolveApiKey(raw: string | null): string | null {
  if (!raw || !raw.startsWith(PREFIX)) return null;
  const hash = hashKey(raw);
  return withDb((db) => {
    const row = db.apiKeys.find((k) => safeEqual(k.keyHash, hash));
    if (!row) return null;
    row.lastUsedAt = nowIso();
    return row.businessId;
  });
}
