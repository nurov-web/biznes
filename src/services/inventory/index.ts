import type { ProductDraft } from "@/types";
import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { ProductRow } from "@/lib/store";

export async function listMovements(businessId: string, limit = 12) {
  const db = await readDb();
  const catalog = db.products.filter((p) => p.businessId === businessId);
  const ids = new Set(catalog.map((p) => p.id));
  return db.movements
    .filter((m) => ids.has(m.productId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((m) => {
      const product = catalog.find((p) => p.id === m.productId);
      return {
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        note: m.note,
        createdAt: m.createdAt,
        sku: product ? `${product.brand} ${product.model}`.trim() : m.productId,
      };
    });
}

export async function listProducts(businessId: string): Promise<ProductRow[]> {
  return (await readDb())
    .products.filter((p) => p.businessId === businessId && !p.archived)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createProduct(businessId: string, data: ProductDraft): Promise<ProductRow> {
  const now = nowIso();
  const product: ProductRow = {
    id: newId(),
    businessId,
    ...data,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await withDb((db) => {
    db.products.push(product);
  });
  return product;
}

export async function updateProduct(
  businessId: string,
  id: string,
  data: Partial<ProductDraft>,
): Promise<ProductRow | null> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === id && p.businessId === businessId && !p.archived);
    if (!product) return null;
    Object.assign(product, data, { updatedAt: nowIso() });
    return product;
  });
}

export async function archiveProduct(businessId: string, id: string): Promise<ProductRow | null> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === id && p.businessId === businessId && !p.archived);
    if (!product) return null;
    product.archived = true;
    product.updatedAt = nowIso();
    return product;
  });
}

export async function moveStock(
  businessId: string,
  productId: string,
  type: "in" | "out",
  quantity: number,
  note: string,
): Promise<ProductRow | null> {
  return withDb((db) => {
    const product = db.products.find(
      (p) => p.id === productId && p.businessId === businessId && !p.archived,
    );
    if (!product) return null;
    const nextQty = type === "in" ? product.quantity + quantity : product.quantity - quantity;
    if (nextQty < 0) {
      throw new Error("NEGATIVE_STOCK");
    }
    db.movements.push({
      id: newId(),
      productId,
      type,
      quantity,
      note,
      createdAt: nowIso(),
    });
    product.quantity = nextQty;
    product.updatedAt = nowIso();
    return product;
  });
}
