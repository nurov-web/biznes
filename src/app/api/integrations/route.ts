/**
 * GET /api/integrations — рӯйхати калидҳо ва суроғаи webhook.
 * POST — калиди нав. DELETE — бекор кардани калид.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { addAudit } from "@/services/intelligence/persist";
import { createApiKey, listApiKeys, revokeApiKey } from "@/services/integrations/keys";

function publicKeys(businessId: string) {
  return listApiKeys(businessId).map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
  }));
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const origin = new URL(request.url).origin;
    return NextResponse.json({
      keys: publicKeys(business.id),
      webhook: `${origin}/api/ingest/sale`,
    });
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
      .object({ name: z.string().trim().max(60).default("POS") })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    if (listApiKeys(business.id).length >= 5) return jsonError("limit_reached", 409);
    const { row, raw } = createApiKey(business.id, parsed.data.name);
    addAudit(business.id, user.id, "integration.key.create");
    return NextResponse.json({ key: raw, id: row.id, prefix: row.prefix });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({ id: z.string().trim().min(1).max(80) })
      .safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    if (!revokeApiKey(business.id, parsed.data.id)) return jsonError("not_found", 404);
    addAudit(business.id, user.id, "integration.key.revoke");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
