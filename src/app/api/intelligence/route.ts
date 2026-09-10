import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { localeFromRequest } from "@/lib/locale-query";
import { CRASH_PRESETS } from "@/services/intelligence/engine";
import { syncIntelligence } from "@/services/intelligence/persist";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const locale = localeFromRequest(request);
    const data = await syncIntelligence(business.id, locale, user.id);
    return NextResponse.json({
      data,
      crashPresets: Object.keys(CRASH_PRESETS),
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
