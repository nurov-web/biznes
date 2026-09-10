/**
 * GET/POST /api/pos — кассаи мобилӣ (POS).
 * GET: рӯйхати молҳои фаъоли бизнес.
 * POST: { productId, quantity } — фурӯш ба salesLines ва кам шудани анбор.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { listProducts } from "@/services/inventory";
import { checkoutPos } from "@/services/pos/checkout";

const postSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const products = await listProducts(business.id);
    return NextResponse.json({ products });
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
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);

    const body = await request.json().catch(() => null);
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return jsonError("validation", 400);

    const result = await checkoutPos(business.id, parsed.data.productId, parsed.data.quantity);

    if (!result.success) {
      if (result.error === "not_found") return jsonError("not_found", 404);
      if (result.error === "insufficient_stock") return jsonError("insufficient_stock", 409);
      if (result.error === "invalid_quantity") return jsonError("validation", 400);
      return jsonError("server", 500);
    }

    return NextResponse.json({ success: true, salesLine: result.salesLine });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
