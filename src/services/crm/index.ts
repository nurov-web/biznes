import type { DealStage } from "@/constants";
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { CustomerRow, DealRow } from "@/lib/store";

export async function listCustomers(businessId: string): Promise<CustomerRow[]> {
  return readDb()
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
  withDb((db) => {
    db.customers.push(customer);
  });
  return customer;
}

export async function archiveCustomer(businessId: string, id: string): Promise<CustomerRow | null> {
  return withDb((db) => {
    const row = db.customers.find((c) => c.id === id && c.businessId === businessId && !c.archived);
    if (!row) return null;
    row.archived = true;
    row.updatedAt = nowIso();
    return row;
  });
}

export async function listDeals(businessId: string): Promise<DealRow[]> {
  return readDb()
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
  withDb((db) => {
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
  return withDb((db) => {
    const row = db.deals.find((d) => d.id === id && d.businessId === businessId && !d.archived);
    if (!row) return null;
    row.stage = stage;
    row.lostReason = stage === "lost" ? lostReason : "";
    row.updatedAt = nowIso();
    return row;
  });
}
