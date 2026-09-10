/**
 * GET /api/store/ledger — харид/фурӯшҳои сабтшуда аз мағоза.
 * POST — сабти харид ё фурӯш (фармоиши зинда худкор намеояд).
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { addAudit } from "@/services/intelligence/persist";
import { listStoreLedger, recordStoreLedger } from "@/services/store/ledger";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const items = await listStoreLedger(business.id);
    return NextResponse.json({ items });
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
      .object({
        kind: z.enum(["buy", "sell"]),
        name: z.string().trim().min(1).max(80),
        quantity: z.number().int().min(1).max(100_000),
        unitPrice: z.number().min(0).max(10_000_000),
        sellPrice: z.number().min(0).max(10_000_000).optional(),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    const item = await recordStoreLedger(business.id, parsed.data);
    await addAudit(business.id, user.id, `store.${parsed.data.kind}`);
    return NextResponse.json({ item });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    if (error instanceof Error && error.message === "NO_STORE") {
      return jsonError("no_store", 409);
    }
    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return jsonError("stock", 409);
    }
    console.error("[store.ledger]", error);
    return jsonError("server", 500);
  }
}
