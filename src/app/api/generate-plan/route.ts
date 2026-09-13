/**
 * POST /api/generate-plan — нақшаи фурӯш аз профил.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { parseLocale } from "@/lib/locale-query";
import { generateSalesPlan } from "@/services/ai/pilot";
import { getPilotProfile, savePlan } from "@/services/pilot";

const schema = z.object({
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    const locale = parseLocale(parsed.success ? parsed.data.locale : "tg");
    const profile = await getPilotProfile(user.id);
    if (!profile) return jsonError("no_business", 409);
    const plan = await generateSalesPlan({
      locale,
      product: profile.product,
      region: profile.region,
      volume: profile.volume,
      price: profile.price,
    });
    await savePlan(user.id, plan);
    return NextResponse.json({ plan });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
