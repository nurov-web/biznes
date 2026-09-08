/**
 * GET /api/auth/me
 */
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/business";
import { jsonError } from "@/lib/api-error";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("unauthorized", 401);
  const business = await getOwnedBusiness(user.id);
  return NextResponse.json({
    user,
    business: business
      ? {
          id: business.id,
          name: business.name,
          onboardingDone: business.onboardingDone,
          city: business.city,
        }
      : null,
  });
}
