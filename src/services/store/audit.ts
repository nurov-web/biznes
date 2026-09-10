/**
 * Нигоҳдории ҳисоби охирини мағоза.
 */
import { newId, nowIso, readDb, withDb, type StoreAuditRow } from "@/lib/store";
import type { StoreAuditResult } from "@/services/ai/store-audit";

export async function latestStoreAudit(businessId: string): Promise<StoreAuditRow | null> {
  const db = await readDb();
  return (
    db.storeAudits
      .filter((row) => row.businessId === businessId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

export async function saveStoreAudit(
  businessId: string,
  storeUrl: string,
  result: StoreAuditResult,
): Promise<StoreAuditRow> {
  const now = nowIso();
  const row: StoreAuditRow = {
    id: newId(),
    businessId,
    storeUrl,
    summary: result.summary,
    products: result.products,
    revenueMonthly: result.revenueMonthly,
    costMonthly: result.costMonthly,
    profitMonthly: result.profitMonthly,
    hoursMonthly: result.hoursMonthly,
    risks: result.risks,
    actions: result.actions,
    disclaimer: result.disclaimer,
    usedAi: result.usedAi,
    usedWeb: result.usedWeb,
    aiError: result.aiError,
    pagesRead: result.pagesRead,
    importedAt: null,
    createdAt: now,
  };
  return withDb((db) => {
    db.storeAudits = db.storeAudits.filter((item) => item.businessId !== businessId);
    db.storeAudits.push(row);
    return row;
  });
}

export async function markAuditImported(businessId: string, auditId: string): Promise<StoreAuditRow | null> {
  return withDb((db) => {
    const row = db.storeAudits.find((item) => item.id === auditId && item.businessId === businessId);
    if (!row) return null;
    row.importedAt = nowIso();
    return row;
  });
}

export function publicAudit(row: StoreAuditRow) {
  return {
    id: row.id,
    storeUrl: row.storeUrl,
    summary: row.summary,
    products: row.products,
    revenueMonthly: row.revenueMonthly,
    costMonthly: row.costMonthly,
    profitMonthly: row.profitMonthly,
    hoursMonthly: row.hoursMonthly,
    risks: row.risks,
    actions: row.actions,
    disclaimer: row.disclaimer,
    usedAi: row.usedAi,
    usedWeb: row.usedWeb,
    aiError: row.aiError,
    pagesRead: row.pagesRead,
    importedAt: row.importedAt,
    createdAt: row.createdAt,
  };
}
