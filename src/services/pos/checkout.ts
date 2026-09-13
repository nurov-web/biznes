/**
 * Бизнес-логикаи касса: як фурӯш = анбор кам + сатри фурӯш + (ихтиёрӣ) мизоҷи CRM.
 */
import { newId, nowIso, withDb, type SalesLineRow } from "@/lib/store";
import { productBuyCost, productSellPrice } from "@/services/pos/price";

export type CheckoutCustomer = {
  id?: string | null;
  name?: string;
  phone?: string;
};

export type PosCheckoutResult =
  | {
      success: true;
      salesLine: SalesLineRow;
      remaining: number;
      customerName: string | null;
    }
  | {
      success: false;
      error: "not_found" | "insufficient_stock" | "invalid_quantity" | "server_error";
    };

export async function checkoutPos(
  businessId: string,
  productId: string,
  quantity: number,
  customer?: CheckoutCustomer,
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

      let customerId: string | null = null;
      let customerName: string | null = null;
      const givenId = customer?.id?.trim();
      const givenName = customer?.name?.trim() ?? "";

      if (givenId) {
        const row = db.customers.find(
          (c) => c.id === givenId && c.businessId === businessId && !c.archived,
        );
        if (!row) {
          return { success: false, error: "not_found" };
        }
        customerId = row.id;
        customerName = row.name;
        row.updatedAt = nowIso();
      } else if (givenName) {
        const now = nowIso();
        const row = {
          id: newId(),
          businessId,
          name: givenName,
          phone: customer?.phone?.trim() ?? "",
          email: "",
          tags: "once",
          notes: "",
          archived: false,
          createdAt: now,
          updatedAt: now,
        };
        db.customers.push(row);
        customerId = row.id;
        customerName = row.name;
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
      const sku = `${product.brand} ${product.model}`.trim();
      let dealId: string | null = null;

      if (customerId) {
        dealId = newId();
        db.deals.push({
          id: dealId,
          businessId,
          customerId,
          productId: product.id,
          title: sku,
          stage: "won",
          amount: sell * quantity,
          lostReason: "",
          archived: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const salesLine: SalesLineRow = {
        id: newId(),
        businessId,
        date: now.slice(0, 10),
        sku,
        quantity,
        revenue: sell * quantity,
        cost: buy * quantity,
        dealId,
        customerId,
        createdAt: now,
      };
      db.salesLines.push(salesLine);
      return {
        success: true,
        salesLine,
        remaining: product.quantity,
        customerName,
      };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return { success: false, error: "insufficient_stock" };
    }
    return { success: false, error: "server_error" };
  }
}
