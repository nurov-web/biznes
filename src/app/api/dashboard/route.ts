/**
 * GET /api/dashboard — KPI, задачи, дефицит склада.
 */
import { NextResponse } from "next/server";
import { LOW_STOCK_THRESHOLD } from "@/constants";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { financeTotals } from "@/services/finance";
import { readDb } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const db = readDb();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todaySales = db.financeEntries
      .filter(
        (e) =>
          e.businessId === business.id &&
          e.type === "income" &&
          new Date(e.entryDate).getTime() >= start.getTime(),
      )
      .reduce((s, e) => s + e.amount, 0);
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
      const value = db.financeEntries
        .filter((e) => {
          if (e.businessId !== business.id || e.type !== "income") return false;
          const t = new Date(e.entryDate).getTime();
          return t >= d.getTime() && t < next.getTime();
        })
        .reduce((s, e) => s + e.amount, 0);
      week.push({ day: d.toISOString().slice(5, 10), value });
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
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    if (error instanceof Error && error.message === "NO_BUSINESS") {
      return jsonError("no_business", 409);
    }
    return jsonError("server", 500);
  }
}
