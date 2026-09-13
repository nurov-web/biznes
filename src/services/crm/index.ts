import type { DealStage } from "@/constants";
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { CustomerRow, DealRow, SalesLineRow } from "@/lib/store";
import { matchProduct } from "@/services/inventory/match";
import { productBuyCost } from "@/services/pos/price";

export type CustomerStats = {
  purchases: number;
  spent: number;
  lastSku: string;
};

export type CustomerWithStats = CustomerRow & CustomerStats;

function uniqueSales(rows: SalesLineRow[]): SalesLineRow[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

function statsForCustomer(
  customerId: string,
  sales: SalesLineRow[],
  deals: DealRow[],
): CustomerStats {
  const wonDealIds = new Set(
    deals.filter((d) => d.customerId === customerId && d.stage === "won").map((d) => d.id),
  );
  const lines = uniqueSales(
    sales.filter(
      (s) => s.customerId === customerId || (s.dealId !== null && wonDealIds.has(s.dealId)),
    ),
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    purchases: lines.reduce((sum, line) => sum + line.quantity, 0),
    spent: lines.reduce((sum, line) => sum + line.revenue, 0),
    lastSku: lines[0]?.sku ?? "",
  };
}

export async function listCustomers(businessId: string): Promise<CustomerWithStats[]> {
  const db = await readDb();
  const sales = db.salesLines.filter((s) => s.businessId === businessId);
  const deals = db.deals.filter((d) => d.businessId === businessId && !d.archived);
  return db.customers
    .filter((c) => c.businessId === businessId && !c.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((c) => ({ ...c, ...statsForCustomer(c.id, sales, deals) }));
}

export async function createCustomer(
  businessId: string,
  data: { name: string; phone: string; email: string; tags: string; notes: string },
): Promise<CustomerRow> {
  const now = nowIso();
  const customer: CustomerRow = {
    id: newId(),
    businessId,
    ...data,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await withDb((db) => {
    db.customers.push(customer);
  });
  return customer;
}

export async function archiveCustomer(businessId: string, id: string): Promise<CustomerRow | null> {
  return await withDb((db) => {
    const row = db.customers.find((c) => c.id === id && c.businessId === businessId && !c.archived);
    if (!row) return null;
    row.archived = true;
    row.updatedAt = nowIso();
    return row;
  });
}

export async function listDeals(businessId: string): Promise<DealRow[]> {
  return (await readDb())
    .deals.filter((d) => d.businessId === businessId && !d.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createDeal(
  businessId: string,
  data: { title: string; amount: number; customerId?: string | null; productId?: string | null },
): Promise<DealRow> {
  const now = nowIso();
  const deal: DealRow = {
    id: newId(),
    businessId,
    customerId: data.customerId || null,
    productId: data.productId || null,
    title: data.title,
    stage: "lead",
    amount: data.amount,
    lostReason: "",
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await withDb((db) => {
    db.deals.push(deal);
  });
  return deal;
}

export async function updateDealStage(
  businessId: string,
  id: string,
  stage: DealStage,
  lostReason = "",
): Promise<DealRow | null> {
  return await withDb((db) => {
    const row = db.deals.find((d) => d.id === id && d.businessId === businessId && !d.archived);
    if (!row) return null;
    const previous = row.stage;
    row.stage = stage;
    row.lostReason = stage === "lost" ? lostReason : "";
    row.updatedAt = nowIso();
    if (stage === "won" && previous !== "won") {
      const already = db.salesLines.some((line) => line.dealId === row.id);
      if (!already) {
        const activeProducts = db.products.filter(
          (p) => p.businessId === businessId && !p.archived,
        );
        const product = row.productId
          ? activeProducts.find((p) => p.id === row.productId) ?? matchProduct(activeProducts, row.title)
          : matchProduct(activeProducts, row.title);
        const cost = product ? productBuyCost(product) : 0;

        if (product) {
          if (product.quantity < 1) {
            throw new Error("NEGATIVE_STOCK");
          }
          product.quantity -= 1;
          product.updatedAt = nowIso();
          db.movements.push({
            id: newId(),
            productId: product.id,
            type: "out",
            quantity: 1,
            note: `crm.won:${row.id}`,
            createdAt: nowIso(),
          });
        }

        db.salesLines.push({
          id: newId(),
          businessId,
          date: nowIso().slice(0, 10),
          sku: product ? `${product.brand} ${product.model}`.trim() : row.title,
          quantity: 1,
          revenue: row.amount,
          cost,
          dealId: row.id,
          customerId: row.customerId,
          createdAt: nowIso(),
        });
      }
    }
    return row;
  });
}
