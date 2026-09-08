import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { addAudit } from "@/services/intelligence/persist";
import { nowIso, readDb, withDb } from "@/lib/store";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "done"]),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const actions = readDb()
      .actions.filter((a) => a.businessId === business.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ actions });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const action = withDb((db) => {
      const row = db.actions.find(
        (a) => a.id === parsed.data.id && a.businessId === business.id,
      );
      if (!row) return null;
      row.status = parsed.data.status;
      row.updatedAt = nowIso();
      return row;
    });
    if (!action) return jsonError("not_found", 404);
    addAudit(business.id, user.id, `action.${parsed.data.status}`);
    return NextResponse.json({ action });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
