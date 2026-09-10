import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { FinanceRow, SalesLineRow } from "@/lib/store";

function salesAsFinance(sales: SalesLineRow[]): FinanceRow[] {
  const rows: FinanceRow[] = [];
  for (const sale of sales) {
    const day = sale.date.slice(0, 10);
    const stamp = /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T12:00:00.000Z` : sale.createdAt;
    rows.push({
      id: `sale:${sale.id}`,
      businessId: sale.businessId,
      type: "income",
      amount: sale.revenue,
      category: "sales",
      note: sale.sku,
      entryDate: stamp,
      createdAt: sale.createdAt,
    });
    if (sale.cost > 0) {
      rows.push({
        id: `cogs:${sale.id}`,
        businessId: sale.businessId,
        type: "expense",
        amount: sale.cost,
        category: "cogs",
        note: sale.sku,
        entryDate: stamp,
        createdAt: sale.createdAt,
      });
    }
  }
  return rows;
}

export async function listFinance(businessId: string): Promise<FinanceRow[]> {
  const db = await readDb();
  const manual = db.financeEntries.filter((e) => e.businessId === businessId);
  const fromSales = salesAsFinance(db.salesLines.filter((s) => s.businessId === businessId));
  return [...manual, ...fromSales]
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
  await withDb((db) => {
    db.financeEntries.push(entry);
  });
  return entry;
}

export async function financeTotals(businessId: string) {
  const db = await readDb();
  const rows = db.financeEntries.filter((e) => e.businessId === businessId);
  const sales = db.salesLines.filter((s) => s.businessId === businessId);
  const income =
    rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0) +
    sales.reduce((s, r) => s + r.revenue, 0);
  const expense =
    rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0) +
    sales.reduce((s, r) => s + r.cost, 0);
  return { income, expense, profit: income - expense };
}

function inRange(isoOrDay: string, start: number, end: number): boolean {
  const raw = isoOrDay.length <= 10 ? `${isoOrDay}T12:00:00` : isoOrDay;
  const t = new Date(raw).getTime();
  return t >= start && t < end;
}

/** Даромади рӯз: касса + сатрҳои фурӯш (бе дуборанависӣ). */
export async function incomeInRange(businessId: string, start: Date, end: Date): Promise<number> {
  const db = await readDb();
  const from = start.getTime();
  const to = end.getTime();
  const cash = db.financeEntries
    .filter((e) => e.businessId === businessId && e.type === "income" && inRange(e.entryDate, from, to))
    .reduce((s, e) => s + e.amount, 0);
  const sold = db.salesLines
    .filter((e) => e.businessId === businessId && inRange(e.date, from, to))
    .reduce((s, e) => s + e.revenue, 0);
  return cash + sold;
}
