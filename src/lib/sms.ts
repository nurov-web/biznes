import { hash, compare } from "bcryptjs";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const CODE_TTL_MS = 10 * 60 * 1000;

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** SMS-шлюз — этап 5 ТЗ. В MVP код возвращается для демо. */
export async function sendSmsCode(phone: string): Promise<{ devCode?: string }> {
  const code = randomCode();
  const codeHash = await hash(code, 10);
  await withDb((db) => {
    db.smsCodes.push({
      id: newId(),
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      used: false,
      createdAt: nowIso(),
    });
  });
  console.info("[sms-demo]", phone, process.env.NODE_ENV === "production" ? "(hidden)" : code);
  return process.env.NODE_ENV === "production" ? {} : { devCode: code };
}

export async function verifySmsCode(phone: string, code: string): Promise<boolean> {
  const now = Date.now();
  const db = await readDb();
  const rows = db.smsCodes
    .filter((r) => r.phone === phone && !r.used)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);
  for (const row of rows) {
    if (new Date(row.expiresAt).getTime() < now) continue;
    const ok = await compare(code, row.codeHash);
    if (ok) {
      await withDb((db) => {
        const found = db.smsCodes.find((r) => r.id === row.id);
        if (found) found.used = true;
      });
      return true;
    }
  }
  return false;
}
