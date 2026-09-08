/**
 * POST /api/ingest/sale — қабули фурӯш аз POS ё системаи беруна.
 * Аутентификатсия: сарлавҳаи x-bp-key.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { resolveApiKey } from "@/services/integrations/keys";
import { newId, nowIso, withDb } from "@/lib/store";

const schema = z.object({
  sku: z.string().trim().min(1).max(160),
  quantity: z.number().min(0).max(1_000_000).default(1),
  revenue: z.number().min(0).max(100_000_000),
  cost: z.number().min(0).max(100_000_000).default(0),
  date: z.string().trim().max(30).optional(),
});

export async function POST(request: Request) {
  const businessId = resolveApiKey(request.headers.get("x-bp-key"));
  if (!businessId) return jsonError("unauthorized", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("validation", 400);
  const data = parsed.data;

  const id = withDb((db) => {
    const row = {
      id: newId(),
      businessId,
      date: (data.date || nowIso()).slice(0, 10),
      sku: data.sku,
      quantity: data.quantity || 1,
      revenue: data.revenue,
      cost: data.cost,
      createdAt: nowIso(),
    };
    db.salesLines.push(row);
    return row.id;
  });

  return NextResponse.json({ ok: true, id });
}
