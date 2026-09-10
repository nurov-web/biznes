import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { num, parseCsv } from "@/lib/csv";
import { tajikEquals } from "@/lib/tajik-text";
import { addAudit } from "@/services/intelligence/persist";
import { newId, nowIso, withDb } from "@/lib/store";
import { createProduct } from "@/services/inventory";

const schema = z.object({
  kind: z.enum(["sales", "competitors", "inventory"]),
  csv: z.string().min(8).max(1_500_000),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const rows = parseCsv(parsed.data.csv).slice(0, 2000);
    if (!rows.length) return jsonError("empty_csv", 400);

    if (parsed.data.kind === "sales") {
      const inserted = await withDb((db) => {
        let n = 0;
        let clients = 0;
        for (const row of rows) {
          const sku = row.sku || row.product || row.мол || "";
          const quantity = num(row.quantity || row.qty || row.дона);
          const revenue = num(row.revenue || row.даромад || row.sell);
          if (!sku || (quantity <= 0 && revenue <= 0)) continue;
          db.salesLines.push({
            id: newId(),
            businessId: business.id,
            date: row.date || row.дата || nowIso().slice(0, 10),
            sku,
            quantity: quantity || 1,
            revenue,
            cost: num(row.cost || row.хароҷот || row.buy),
            dealId: null,
            createdAt: nowIso(),
          });
          n += 1;
          const clientName = (row.customer || row.client || row.мизоҷ || row.buyer || "").trim();
          const phone = (row.phone || row.телефон || "").trim();
          if (!clientName) continue;
          const exists = db.customers.some(
            (c) =>
              c.businessId === business.id &&
              !c.archived &&
              ((phone && c.phone === phone) || (!phone && tajikEquals(c.name, clientName))),
          );
          if (exists) continue;
          const now = nowIso();
          db.customers.push({
            id: newId(),
            businessId: business.id,
            name: clientName.slice(0, 120),
            phone: phone.slice(0, 30),
            email: (row.email || "").slice(0, 120),
            tags: "regular",
            notes: sku,
            archived: false,
            createdAt: now,
            updatedAt: now,
          });
          clients += 1;
        }
        return { n, clients };
      });
      await addAudit(business.id, user.id, "import.sales");
      return NextResponse.json({
        imported: inserted.n,
        clients: inserted.clients,
        kind: "sales",
      });
    }

    if (parsed.data.kind === "competitors") {
      const inserted = await withDb((db) => {
        let n = 0;
        for (const row of rows) {
          const name = row.name || row.рақиб || "";
          if (!name) continue;
          db.competitors.push({
            id: newId(),
            businessId: business.id,
            name,
            product: row.product || row.мол || "",
            price: num(row.price || row.нарх),
            promo: row.promo || row.аксия || "",
            note: row.note || row.эзоҳ || "",
            createdAt: nowIso(),
          });
          n += 1;
        }
        return n;
      });
      await addAudit(business.id, user.id, "import.competitors");
      return NextResponse.json({ imported: inserted, kind: "competitors" });
    }

    let imported = 0;
    for (const row of rows) {
      const brand = row.brand || row.бренд || "";
      const model = row.model || row.модел || "";
      if (!brand && !model) continue;
      await createProduct(business.id, {
        category: row.category || row.категория || "Дигар",
        brand: brand || "—",
        model: model || "—",
        buyPriceMin: num(row.buymin || row.buy || row.харид),
        buyPriceMax: num(row.buymax || row.buymin || row.buy || row.харид),
        sellPriceMin: num(row.sellmin || row.sell || row.фурӯш),
        sellPriceMax: num(row.sellmax || row.sellmin || row.sell || row.фурӯш),
        quantity: Math.max(0, Math.round(num(row.qty || row.quantity || row.дона))),
        condition: row.condition === "used" ? "used" : "new",
      });
      imported += 1;
    }
    await addAudit(business.id, user.id, "import.inventory");
    return NextResponse.json({ imported, kind: "inventory" });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
