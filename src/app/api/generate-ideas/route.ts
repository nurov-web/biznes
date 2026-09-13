/**
 * POST /api/generate-ideas — профили оғоз + 4 идея.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { parseLocale } from "@/lib/locale-query";
import { PILOT_INTERESTS, PILOT_TIME } from "@/constants/pilot";
import { generateStartIdeas } from "@/services/ai/pilot";
import { savePilotProfile, saveSuggestions } from "@/services/pilot";

const schema = z.object({
  locale: z.string().optional(),
  interests: z.array(z.enum(PILOT_INTERESTS)).min(1).max(8),
  budget: z.number().int().min(500).max(50_000),
  time: z.enum(PILOT_TIME),
  skills: z.string().trim().max(200).default(""),
  region: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("validation", 400);
    const data = parsed.data;
    const profile = await savePilotProfile(user.id, {
      kind: "starting",
      category: data.interests.join(","),
      product: data.interests[0] ?? "",
      region: data.region,
      volume: String(data.budget),
      price: "",
      problem: `time:${data.time}; skills:${data.skills}`,
    });
    const items = await generateStartIdeas({
      locale: parseLocale(data.locale),
      interests: data.interests,
      budget: data.budget,
      time: data.time,
      skills: data.skills,
      region: data.region,
    });
    await saveSuggestions(user.id, profile.id, items);
    return NextResponse.json({ ok: true, profileId: profile.id, suggestions: items });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
