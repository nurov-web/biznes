import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types";

export function jsonError(
  error: string,
  status: number,
  fields?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error, fields },
    { status, headers: { "Cache-Control": "no-store, private" } },
  );
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}
