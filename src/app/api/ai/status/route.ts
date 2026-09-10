/**
 * GET /api/ai/status — оё калиди Claude воқеан кор мекунад?
 * Худи калид ҳеҷ гоҳ бармегардад — танҳо ҳолат ва хатои сервер.
 * Проверяет работоспособность ключа Claude. Сам ключ никогда не возвращается.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { classifyClaudeError, completeClaude, getAiKeyStatus } from "@/services/ai/claude";

export async function GET() {
  try {
    await requireUser();
    const keyStatus = getAiKeyStatus();

    if (keyStatus === "missing") {
      return NextResponse.json({
        state: "missing",
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        detail: "no_key",
      });
    }

    if (keyStatus === "invalid_prefix") {
      return NextResponse.json({
        state: "invalid_prefix",
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        detail: "invalid_prefix",
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
      const kind = classifyClaudeError(error);
      const detail =
        kind === "bad_key" ? "invalid_api_key" : kind === "timeout" ? "timeout" : "failed";
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
