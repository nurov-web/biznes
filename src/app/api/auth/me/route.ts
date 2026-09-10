/**
 * GET /api/auth/me
 */
import { NextResponse } from "next/server";
import { getSessionUser, readAuthPayload } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/business";
import { jsonError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("unauthorized", 401);
  const stored = await getOwnedBusiness(user.id);
  const saved = stored ? null : await readAuthPayload();
  const business = stored
    ? {
        id: stored.id,
        name: stored.name,
        onboardingDone: stored.onboardingDone,
        city: stored.city,
        type: stored.type,
        typeNote: stored.typeNote,
        goal: stored.goal,
      }
    : saved?.bid
      ? {
          id: saved.bid,
          name: saved.bname || "",
          onboardingDone: saved.bdone ?? false,
          city: saved.bcity || "",
          type: saved.btype || "",
          typeNote: saved.bnote || "",
          goal: saved.bgoal || "",
        }
      : null;
  return NextResponse.json(
    { user, business },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
