/**
 * POST /api/pilot/read-business — қадами 1: ИИ маҳсулот ва шаҳрро мехонад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { consumeAiQuota } from "@/lib/ai-quota";
import { parseLocale } from "@/lib/locale-query";
import { PILOT_CATEGORIES } from "@/constants/pilot";
import { readBusinessDraft } from "@/services/ai/pilot";

const schema = z.object({
  locale: z.string().optional(),
  category: z.enum(PILOT_CATEGORIES),
  subcategory: z.string().trim().max(40).default(""),
  product: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    if (!rateLimit(`ai:${user.id}`, 20, 60_000)) return jsonError("rate", 429);
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    if (!(await consumeAiQuota(user.id))) return jsonError("rate", 429);
    const data = parsed.data;
    const read = await readBusinessDraft({
      locale: parseLocale(data.locale),
      category: data.category,
      subcategory: data.subcategory,
      product: data.product,
      region: data.region,
    });
    return NextResponse.json({ ok: true, ...read });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
