/**
 * POST /api/ingest/buy — қабули харид аз POS (намунаи SyncJob аз Business Hub).
 * Аутентификатсия: сарлавҳаи x-bp-key.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { resolveApiKey } from "@/services/integrations/keys";
import { addAudit } from "@/services/intelligence/persist";
import { recordStoreLedger } from "@/services/store/ledger";

const schema = z.object({
  sku: z.string().trim().min(1).max(160),
  quantity: z.number().int().min(1).max(1_000_000).default(1),
  cost: z.number().min(0).max(100_000_000),
  sellPrice: z.number().min(0).max(100_000_000).optional(),
});

export async function POST(request: Request) {
  if (!rateLimit(`ingest-ip:${clientIp(request)}`, 40, 60_000)) {
    return jsonError("rate", 429);
  }
  const businessId = await resolveApiKey(request.headers.get("x-bp-key"));
  if (!businessId) return jsonError("unauthorized", 401);
  if (!rateLimit(`ingest:${businessId}`, 40, 60_000)) {
    return jsonError("rate", 429);
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("validation", 400);
  const data = parsed.data;
  const qty = data.quantity || 1;
  const unitPrice = Math.round(data.cost / qty);

  try {
    const item = await recordStoreLedger(businessId, {
      kind: "buy",
      name: data.sku,
      quantity: qty,
      unitPrice,
      sellPrice: data.sellPrice,
    });
    await addAudit(businessId, "ingest", "ingest.buy");
    return NextResponse.json({ ok: true, id: item.id });
  } catch (error) {
    if (error instanceof Error && error.message === "VALIDATION") {
      return jsonError("validation", 400);
    }
    console.error("[ingest.buy]", error);
    return jsonError("server", 500);
  }
}
