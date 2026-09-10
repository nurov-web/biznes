/**
 * Харид ва фурӯш аз мағозаи пайваст ё POS-и офлайнӣ.
 */
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import { addFinance } from "@/services/finance";
import { createProduct, listProducts, moveStock } from "@/services/inventory";
import { matchProduct } from "@/services/inventory/match";
import { getStoreConnection } from "@/services/store/connect";

export type StoreKind = "buy" | "sell";

export type StoreLedgerItem = {
  id: string;
  kind: StoreKind;
  name: string;
  quantity: number;
  amount: number;
  createdAt: string;
};

export async function listStoreLedger(businessId: string): Promise<StoreLedgerItem[]> {
  const db = await readDb();
  const buys = db.financeEntries
    .filter((row) => row.businessId === businessId && row.category === "store_buy")
    .map((row) => {
      const qtyMatch = /×\s*(\d+)/.exec(row.note);
      return {
        id: row.id,
        kind: "buy" as const,
        name: row.note.replace(/\s*×\s*\d+\s*$/, "") || row.note || "харид",
        quantity: qtyMatch ? Number(qtyMatch[1]) : 0,
        amount: row.amount,
        createdAt: row.createdAt,
      };
    });
  const sales = db.salesLines
    .filter((row) => row.businessId === businessId)
    .map((row) => ({
      id: row.id,
      kind: "sell" as const,
      name: row.sku,
      quantity: row.quantity,
      amount: row.revenue,
      createdAt: row.createdAt,
    }));
  return [...buys, ...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);
}

export async function recordStoreLedger(
  businessId: string,
  input: { kind: StoreKind; name: string; quantity: number; unitPrice: number; sellPrice?: number },
): Promise<StoreLedgerItem> {
  const connection = await getStoreConnection(businessId);
  const storeUrl =
    connection?.status === "connected" && connection.storeUrl ? connection.storeUrl : "";

  const name = input.name.trim().slice(0, 80);
  const qty = Math.max(1, Math.round(input.quantity));
  const price = Math.max(0, Math.round(input.unitPrice));
  if (!name) throw new Error("VALIDATION");
  const amount = qty * price;

  let brand = "pos";
  if (storeUrl) {
    try {
      brand = new URL(storeUrl).hostname.replace(/^www\./, "").slice(0, 40) || "web";
    } catch {
      brand = "web";
    }
  }

  if (input.kind === "buy") {
    const products = await listProducts(businessId);
    const existing = matchProduct(products, name);
    const shelf = Math.max(price, Math.round(input.sellPrice ?? 0));
    let productId = existing?.id;
    if (!productId) {
      const created = await createProduct(businessId, {
        category: "store",
        brand,
        model: name,
        buyPriceMin: price,
        buyPriceMax: price,
        sellPriceMin: shelf || price,
        sellPriceMax: shelf || price,
        quantity: 0,
        condition: "new",
      });
      productId = created.id;
    }
    await moveStock(businessId, productId, "in", qty, storeUrl || "ingest");
    const entry = await addFinance(businessId, {
      type: "expense",
      amount,
      category: "store_buy",
      note: `${name} × ${qty}`,
    });
    return {
      id: entry.id,
      kind: "buy",
      name,
      quantity: qty,
      amount,
      createdAt: entry.createdAt,
    };
  }

  return await withDb((db) => {
    const activeProducts = db.products.filter(
      (p) => p.businessId === businessId && !p.archived,
    );
    const existing = matchProduct(activeProducts, name);

    let costEach = 0;
    if (existing) {
      if (existing.quantity < qty) {
        throw new Error("NEGATIVE_STOCK");
      }
      existing.quantity -= qty;
      existing.updatedAt = nowIso();
      db.movements.push({
        id: newId(),
        productId: existing.id,
        type: "out",
        quantity: qty,
        note: storeUrl || "pos",
        createdAt: nowIso(),
      });
      costEach = (existing.buyPriceMin + existing.buyPriceMax) / 2;
    }

    const row = {
      id: newId(),
      businessId,
      date: nowIso().slice(0, 10),
      sku: name,
      quantity: qty,
      revenue: amount,
      cost: costEach * qty,
      dealId: null,
      createdAt: nowIso(),
    };
    db.salesLines.push(row);

    return {
      id: row.id,
      kind: "sell" as const,
      name,
      quantity: qty,
      amount,
      createdAt: row.createdAt,
    };
  });
}
