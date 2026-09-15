/**
 * POST /api/pilot/refresh-suggestions — пешниҳодҳоро аз профил бо ИИ аз нав месозад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { consumeAiQuota } from "@/lib/ai-quota";
import { parseLocale } from "@/lib/locale-query";
import { suggestionsFromProfile } from "@/services/ai/pilot";
import { getPilotProfile, saveSuggestions } from "@/services/pilot";
import { latestShopPulse } from "@/services/shop-pulse";

const schema = z.object({
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    if (!rateLimit(`ai:${user.id}`, 20, 60_000)) return jsonError("rate", 429);
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    const locale = parseLocale(parsed.success ? parsed.data.locale : "tg");
    const profile = await getPilotProfile(user.id);
    if (!profile) return jsonError("no_business", 409);
    if (!(await consumeAiQuota(user.id))) return jsonError("rate", 429);
    const batch = await suggestionsFromProfile(locale, profile, await latestShopPulse(user.id));
    await saveSuggestions(user.id, profile.id, batch.items);
    return NextResponse.json({
      ok: true,
      suggestions: batch.items,
      usedAi: batch.usedAi,
      product: profile.product,
      region: profile.region,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
