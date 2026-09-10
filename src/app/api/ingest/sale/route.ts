/**
 * POST /api/ingest/sale — қабули фурӯш аз POS ё системаи беруна.
 * Аутентификатсия: сарлавҳаи x-bp-key.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { resolveApiKey } from "@/services/integrations/keys";
import { addAudit } from "@/services/intelligence/persist";
import { matchProduct } from "@/services/inventory/match";
import { newId, nowIso, withDb } from "@/lib/store";

const schema = z.object({
  sku: z.string().trim().min(1).max(160),
  quantity: z.number().int().min(1).max(1_000_000).default(1),
  revenue: z.number().min(0).max(100_000_000),
  cost: z.number().min(0).max(100_000_000).default(0),
  date: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(`ingest-ip:${clientIp(request)}`, 40, 60_000)) {
    return jsonError("rate", 429);
  }
  const businessId = await resolveApiKey(request.headers.get("x-bp-key"));
  if (!businessId) return jsonError("unauthorized", 401);
  if (!rateLimit(`ingest:${businessId}`, 40, 60_000)) {
    return jsonError("rate", 429);
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("validation", 400);
  const data = parsed.data;
  const qty = data.quantity || 1;

  try {
    const result = await withDb((db) => {
      const activeProducts = db.products.filter(
        (p) => p.businessId === businessId && !p.archived,
      );
      const matched = matchProduct(activeProducts, data.sku);

      let stockStatus: "unmatched" | "updated" = "unmatched";

      if (matched) {
        if (matched.quantity < qty) {
          throw new Error("NEGATIVE_STOCK");
        }
        matched.quantity -= qty;
        matched.updatedAt = nowIso();
        db.movements.push({
          id: newId(),
          productId: matched.id,
          type: "out",
          quantity: qty,
          note: "ingest.sale",
          createdAt: nowIso(),
        });
        stockStatus = "updated";
      }

      const finalCost =
        data.cost > 0
          ? data.cost
          : matched
            ? ((matched.buyPriceMin + matched.buyPriceMax) / 2) * qty
            : 0;

      const row = {
        id: newId(),
        businessId,
        date: (data.date || nowIso()).slice(0, 10),
        sku: data.sku,
        quantity: qty,
        revenue: data.revenue,
        cost: finalCost,
        dealId: null,
        createdAt: nowIso(),
      };
      db.salesLines.push(row);

      return { id: row.id, stock: stockStatus };
    });

    await addAudit(businessId, "ingest", "ingest.sale");

    return NextResponse.json({ ok: true, id: result.id, stock: result.stock });
  } catch (error) {
    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return jsonError("negative_stock", 409);
    }
    return jsonError("server", 500);
  }
}
