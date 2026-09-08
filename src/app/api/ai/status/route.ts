/**
 * GET /api/ai/status — оё калиди Claude воқеан кор мекунад?
 * Худи калид ҳеҷ гоҳ бармегардад — танҳо ҳолат ва хатои сервер.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { aiConfigured, completeClaude } from "@/services/ai/claude";

export async function GET() {
  try {
    await requireUser();
    if (!aiConfigured()) {
      return NextResponse.json({
        state: "missing",
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        detail: "ANTHROPIC_API_KEY is not set in .env",
      });
    }
    try {
      await completeClaude("Reply with the single word OK.", "ping");
      return NextResponse.json({
        state: "live",
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        detail: "",
      });
    } catch (error) {
      const raw = error instanceof Error ? error.message : "unknown";
      const detail = raw.includes("invalid x-api-key")
        ? "invalid_api_key"
        : raw.slice(0, 120);
      return NextResponse.json({
        state: "failed",
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        detail,
      });
    }
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
