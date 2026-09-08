/**
 * POST /api/inventory/move — приход / расход склада.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { moveStock } from "@/services/inventory";

const schema = z.object({
  productId: z.string().min(1),
  type: z.enum(["in", "out"]),
  quantity: z.number().int().positive(),
  note: z.string().max(200).default(""),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const product = await moveStock(
      business.id,
      parsed.data.productId,
      parsed.data.type,
      parsed.data.quantity,
      parsed.data.note,
    );
    if (!product) return jsonError("not_found", 404);
    return NextResponse.json({ product });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return jsonError("negative_stock", 400);
    }
    return jsonError("server", 500);
  }
}
