import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { readDb } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const db = await readDb();
    const logs = db.auditLogs
      .filter((a) => a.businessId === business.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30);
    return NextResponse.json({ logs, role: user.role });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
