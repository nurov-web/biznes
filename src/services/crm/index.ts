import type { DealStage } from "@/constants";
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { CustomerRow, DealRow } from "@/lib/store";
import { matchProduct } from "@/services/inventory/match";

export async function listCustomers(businessId: string): Promise<CustomerRow[]> {
  return (await readDb())
    .customers.filter((c) => c.businessId === businessId && !c.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  data: { title: string; amount: number; customerId?: string | null },
): Promise<DealRow> {
  const now = nowIso();
  const deal: DealRow = {
    id: newId(),
    businessId,
    customerId: data.customerId || null,
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
        const product = matchProduct(activeProducts, row.title);
        const cost = product ? (product.buyPriceMin + product.buyPriceMax) / 2 : 0;

        if (product && product.quantity >= 1) {
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
          sku: row.title,
          quantity: 1,
          revenue: row.amount,
          cost,
          dealId: row.id,
          createdAt: nowIso(),
        });
      }
    }
    return row;
  });
}
