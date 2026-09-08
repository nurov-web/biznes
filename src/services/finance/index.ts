import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { FinanceRow } from "@/lib/store";

export async function listFinance(businessId: string): Promise<FinanceRow[]> {
  return readDb()
    .financeEntries.filter((e) => e.businessId === businessId)
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
    .slice(0, 200);
}

export async function addFinance(
  businessId: string,
  data: { type: "income" | "expense"; amount: number; category: string; note: string },
): Promise<FinanceRow> {
  const now = nowIso();
  const entry: FinanceRow = {
    id: newId(),
    businessId,
    ...data,
    entryDate: now,
    createdAt: now,
  };
  withDb((db) => {
    db.financeEntries.push(entry);
  });
  return entry;
}

export async function financeTotals(businessId: string) {
  const rows = readDb().financeEntries.filter((e) => e.businessId === businessId);
  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  return { income, expense, profit: income - expense };
}
