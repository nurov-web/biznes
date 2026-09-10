/**
 * GET /api/dashboard — KPI, задачи, дефицит склада.
 */
import { NextResponse } from "next/server";
import { LOW_STOCK_THRESHOLD } from "@/constants";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { financeTotals, incomeInRange } from "@/services/finance";
import { isEphemeralStore, readDb } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const db = await readDb();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const tomorrow = new Date(start);
    tomorrow.setDate(start.getDate() + 1);
    const todaySales = await incomeInRange(business.id, start, tomorrow);
    const totals = await financeTotals(business.id);
    const newClients = db.customers.filter(
      (c) =>
        c.businessId === business.id &&
        !c.archived &&
        new Date(c.createdAt).getTime() >= start.getTime(),
    ).length;
    const products = db.products.filter((p) => p.businessId === business.id && !p.archived);
    const tasks = db.tasks
      .filter((t) => t.businessId === business.id && !t.archived && !t.done)
      .slice(0, 5);
    const lastAi = db.aiReports
      .filter((r) => r.businessId === business.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const week: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      week.push({
        day: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        value: await incomeInRange(business.id, d, next),
      });
    }
    return NextResponse.json({
      stats: {
        todaySales,
        profit: totals.profit,
        newClients,
        lowStock: products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).length,
      },
      week,
      tasks,
      lowProducts: products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD),
      dailyTip: lastAi
        ? (JSON.parse(lastAi.payload) as { dailyTip?: string }).dailyTip
        : null,
      businessName: business.name,
      ephemeralStore: isEphemeralStore(),
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
