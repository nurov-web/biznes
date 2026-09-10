/**
 * GET /api/channels — Telegram, Instagram, сайт.
 * POST — сабти силка. DELETE — нест кардан.
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { originForbidden } from "@/lib/origin";
import { CHANNEL_KINDS } from "@/constants/channels";
import { addAudit } from "@/services/intelligence/persist";
import { listChannels, removeChannel, upsertChannel } from "@/services/channels";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const channels = await listChannels(business.id);
    return NextResponse.json({ channels });
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
        kind: z.enum(CHANNEL_KINDS),
        url: z.string().max(300),
      })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    const result = await upsertChannel(business.id, parsed.data.kind, parsed.data.url);
    if (!result.ok) return jsonError("bad_url", 400);
    await addAudit(business.id, user.id, `channel.${parsed.data.kind}`);
    return NextResponse.json({ ok: true, channel: result.row });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (originForbidden(request)) return jsonError("forbidden", 403);
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = z
      .object({ id: z.string().min(4).max(80) })
      .safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return jsonError("validation", 400);
    if (!(await removeChannel(business.id, parsed.data.id))) return jsonError("not_found", 404);
    await addAudit(business.id, user.id, "channel.remove");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
