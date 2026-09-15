/**
 * GET /api/pilot/shop — охирин хониши витрина.
 * POST /api/pilot/shop — силкаро мехонад (рақами саҳифа, на демо).
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { latestShopPulse, readShopPulse, saveShopPulse } from "@/services/shop-pulse";

const count = z.number().int().min(0).max(50_000_000).nullable().optional();

const schema = z.object({
  url: z.string().trim().min(3).max(400),
  sold: count,
  refused: count,
  complaints: count,
  save: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const pulse = await latestShopPulse(user.id);
    return NextResponse.json({ pulse });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    if (!rateLimit(`shop:${user.id}`, 8, 60_000)) return jsonError("rate", 429);
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    const pulse = await readShopPulse(parsed.data.url, {
      sold: parsed.data.sold,
      refused: parsed.data.refused,
      complaints: parsed.data.complaints,
    });
    if (parsed.data.save !== false) {
      await saveShopPulse(user.id, pulse);
    }
    return NextResponse.json({ pulse });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
