/**
 * Бизнес-логикаи касса: як фурӯш = як сатри salesLines + кам шудани анбор.
 * Даромади алоҳида ба financeEntries навишта намешавад.
 */
import { newId, nowIso, withDb, type SalesLineRow } from "@/lib/store";
import { productBuyCost, productSellPrice } from "@/services/pos/price";

export type PosCheckoutResult =
  | { success: true; salesLine: SalesLineRow }
  | { success: false; error: "not_found" | "insufficient_stock" | "invalid_quantity" | "server_error" };

export async function checkoutPos(
  businessId: string,
  productId: string,
  quantity: number,
): Promise<PosCheckoutResult> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, error: "invalid_quantity" };
  }

  try {
    return await withDb((db) => {
      const product = db.products.find(
        (p) => p.id === productId && p.businessId === businessId && !p.archived,
      );
      if (!product) {
        return { success: false, error: "not_found" };
      }
      if (product.quantity < quantity) {
        throw new Error("NEGATIVE_STOCK");
      }

      product.quantity -= quantity;
      product.updatedAt = nowIso();
      db.movements.push({
        id: newId(),
        productId: product.id,
        type: "out",
        quantity,
        note: "pos",
        createdAt: nowIso(),
      });

      const buy = productBuyCost(product);
      const sell = productSellPrice(product);
      const now = nowIso();
      const salesLine: SalesLineRow = {
        id: newId(),
        businessId,
        date: now.slice(0, 10),
        sku: `${product.brand} ${product.model}`.trim(),
        quantity,
        revenue: sell * quantity,
        cost: buy * quantity,
        dealId: null,
        createdAt: now,
      };
      db.salesLines.push(salesLine);
      return { success: true, salesLine };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return { success: false, error: "insufficient_stock" };
    }
    return { success: false, error: "server_error" };
  }
}
