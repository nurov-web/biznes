/**
 * GET /api/store — ҳолати пайвасти мағоза.
 * POST — пайваст ё гузаштан. DELETE — ҷудо кардан.
 * Парол ҳеҷ гоҳ ба клиент барнамегардад.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { STORE_PLATFORMS } from "@/constants/store";
import { addAudit } from "@/services/intelligence/persist";
import {
  connectStore,
  disconnectStore,
  publicStoreOf,
  skipStore,
} from "@/services/store/connect";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const origin = new URL(request.url).origin;
    const connection = await publicStoreOf(business.id);
    return NextResponse.json({
      connection,
      skipped: connection?.status === "skipped",
      channel: business.channel,
      webhook: `${origin}/api/ingest/sale`,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({
        skip: z.boolean().optional(),
        storeUrl: z.string().max(300).optional(),
        login: z.string().max(80).optional(),
        password: z.string().max(200).optional(),
        platform: z.enum(STORE_PLATFORMS).optional(),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    if (parsed.data.skip) {
      const connection = await skipStore(business.id);
      await addAudit(business.id, user.id, "store.skip");
      return NextResponse.json({ ok: true, connection, key: null });
    }
    const result = await connectStore(business.id, {
      storeUrl: parsed.data.storeUrl ?? "",
      login: parsed.data.login ?? "",
      password: parsed.data.password ?? "",
      platform: parsed.data.platform,
    });
    if (!result.ok) {
      return jsonError(result.error, 400, result.fields);
    }
    await addAudit(business.id, user.id, "store.connect");
    return NextResponse.json({
      ok: true,
      connection: result.connection,
      key: result.key,
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    console.error("[store.connect]", error);
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    if (!(await disconnectStore(business.id))) return jsonError("not_found", 404);
    await addAudit(business.id, user.id, "store.disconnect");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
