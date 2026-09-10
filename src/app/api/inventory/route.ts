/**
 * GET/POST /api/inventory — каталог склада.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import {
  archiveProduct,
  createProduct,
  listMovements,
  listProducts,
  updateProduct,
} from "@/services/inventory";

const schema = z.object({
  category: z.string().trim().min(1).max(80),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(120),
  buyPriceMin: z.number().nonnegative(),
  buyPriceMax: z.number().nonnegative(),
  sellPriceMin: z.number().nonnegative(),
  sellPriceMax: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  condition: z.enum(["new", "used"]),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const products = await listProducts(business.id);
    const movements = await listMovements(business.id);
    return NextResponse.json({ products, movements });
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
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const product = await createProduct(business.id, parsed.data);
    return NextResponse.json({ product });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const body = (await request.json()) as { id?: string } & Record<string, unknown>;
    if (!body.id || typeof body.id !== "string") return jsonError("validation", 400);
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) return jsonError("validation", 400);
    const product = await updateProduct(business.id, body.id, parsed.data);
    if (!product) return jsonError("not_found", 404);
    return NextResponse.json({ product });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const { id } = (await request.json()) as { id?: string };
    if (!id) return jsonError("validation", 400);
    const product = await archiveProduct(business.id, id);
    if (!product) return jsonError("not_found", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
