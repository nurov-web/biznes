import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { addAudit } from "@/services/intelligence/persist";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  product: z.string().trim().max(160).default(""),
  price: z.number().nonnegative().max(10_000_000),
  promo: z.string().trim().max(200).default(""),
  note: z.string().trim().max(300).default(""),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const db = await readDb();
    const competitors = db.competitors.filter((c) => c.businessId === business.id);
    return NextResponse.json({ competitors });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const competitor = await withDb((db) => {
      const row = {
        id: newId(),
        businessId: business.id,
        ...parsed.data,
        createdAt: nowIso(),
      };
      db.competitors.push(row);
      return row;
    });
    await addAudit(business.id, user.id, "competitor.create");
    return NextResponse.json({ competitor });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z.object({ id: z.string().trim().min(1).max(80) }).safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const { id } = parsed.data;
    await withDb((db) => {
      db.competitors = db.competitors.filter(
        (c) => !(c.id === id && c.businessId === business.id),
      );
    });
    await addAudit(business.id, user.id, "competitor.delete");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
