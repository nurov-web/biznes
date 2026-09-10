/**
 * GET /api/store/audit — ҳисоби охирин.
 * POST — ҳисоби нав аз саҳифаи кушода + AI.
 * PATCH — молҳои ҳисобро ба анбор гирифтан.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { localeFromRequest, parseLocale } from "@/lib/locale-query";
import { addAudit } from "@/services/intelligence/persist";
import { createProduct, listProducts } from "@/services/inventory";
import { auditStoreSite } from "@/services/ai/store-audit";
import { getStoreConnection } from "@/services/store/connect";
import {
  latestStoreAudit,
  markAuditImported,
  publicAudit,
  saveStoreAudit,
} from "@/services/store/audit";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const row = await latestStoreAudit(business.id);
    return NextResponse.json({ audit: row ? publicAudit(row) : null });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({ locale: z.enum(["tg", "ru", "en"]).optional() })
      .safeParse(await request.json().catch(() => ({})));
    const locale = parsed.success
      ? parseLocale(parsed.data.locale)
      : localeFromRequest(request);
    const connection = await getStoreConnection(business.id);
    if (!connection || connection.status !== "connected" || !connection.storeUrl) {
      return jsonError("no_store", 409);
    }
    const result = await auditStoreSite({
      storeUrl: connection.storeUrl,
      locale,
      focus: [business.goal, business.typeNote, business.name].filter(Boolean).join(" · "),
    });
    const row = await saveStoreAudit(business.id, connection.storeUrl, result);
    await addAudit(business.id, user.id, "store.audit");
    return NextResponse.json({ audit: publicAudit(row) });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    console.error("[store.audit]", error);
    return jsonError("server", 500);
  }
}

export async function PATCH() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const row = await latestStoreAudit(business.id);
    if (!row || row.products.length === 0) return jsonError("not_found", 404);
    const existing = await listProducts(business.id);
    const names = new Set(existing.map((p) => p.model.toLowerCase()));
    let imported = 0;
    for (const sku of row.products) {
      const key = sku.name.toLowerCase();
      if (names.has(key)) continue;
      await createProduct(business.id, {
        category: sku.category || "online",
        brand: "web",
        model: sku.name,
        buyPriceMin: sku.estimatedBuy,
        buyPriceMax: sku.estimatedBuy,
        sellPriceMin: sku.sellPrice,
        sellPriceMax: sku.sellPrice,
        quantity: sku.monthlyQty,
        condition: "new",
      });
      names.add(key);
      imported += 1;
    }
    await markAuditImported(business.id, row.id);
    await addAudit(business.id, user.id, "store.audit.import");
    return NextResponse.json({ ok: true, imported });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
