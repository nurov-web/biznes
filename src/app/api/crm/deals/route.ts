/**
 * GET/POST/PATCH /api/crm/deals — pipeline продаж.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { DEAL_STAGES } from "@/constants";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { addAudit } from "@/services/intelligence/persist";
import { createDeal, listDeals, updateDealStage } from "@/services/crm";

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  amount: z.number().nonnegative().default(0),
  customerId: z.string().optional().nullable(),
});

const stageSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(DEAL_STAGES),
  lostReason: z.string().max(300).default(""),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    return NextResponse.json({ deals: await listDeals(business.id) });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const deal = await createDeal(business.id, parsed.data);
    return NextResponse.json({ deal });
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
    const parsed = stageSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const deal = await updateDealStage(
      business.id,
      parsed.data.id,
      parsed.data.stage,
      parsed.data.lostReason,
    );
    if (!deal) return jsonError("not_found", 404);
    if (parsed.data.stage === "won") await addAudit(business.id, user.id, "crm.deal.won");
    return NextResponse.json({ deal });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
