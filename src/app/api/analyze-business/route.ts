/**
 * POST /api/analyze-business — профил + 4 пешниҳоди AI.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { consumeAiQuota } from "@/lib/ai-quota";
import { parseLocale } from "@/lib/locale-query";
import { PILOT_CATEGORIES, PILOT_CHANNELS, PILOT_UNITS } from "@/constants/pilot";
import { analyzeBusinessSuggestions } from "@/services/ai/pilot";
import { savePilotProfile, saveSuggestions } from "@/services/pilot";

const schema = z.object({
  locale: z.string().optional(),
  category: z.enum(PILOT_CATEGORIES),
  subcategory: z.string().trim().max(40).default(""),
  product: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(80),
  volume: z.string().trim().min(1).max(40),
  volumeUnit: z.enum(PILOT_UNITS).default("kg"),
  price: z.string().trim().min(1).max(40),
  channels: z.array(z.enum(PILOT_CHANNELS)).max(6).default([]),
  problem: z.string().trim().max(500).default(""),
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
    const profile = await savePilotProfile(user.id, {
      kind: "has_business",
      category: data.category,
      subcategory: data.subcategory,
      product: data.product,
      region: data.region,
      volume: `${data.volume} ${data.volumeUnit}`,
      price: data.price,
      channels: data.channels,
      problem: data.problem,
    });
    const items = await analyzeBusinessSuggestions({
      locale: parseLocale(data.locale),
      category: data.category,
      product: data.product,
      region: data.region,
      volume: `${data.volume} ${data.volumeUnit}`,
      price: data.price,
      channels: data.channels,
      problem: data.problem,
    });
    await saveSuggestions(user.id, profile.id, items);
    return NextResponse.json({ ok: true, profileId: profile.id, suggestions: items });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
