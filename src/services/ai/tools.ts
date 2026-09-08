/**
 * Асбобҳое, ки Claude метавонад даъват кунад (тарҳи MCP).
 * Ҳар асбоб маълумоти воқеии ҳамин бизнесро бармегардонад — бе тахмин.
 */
import { readDb, type BusinessRow } from "@/lib/store";
import type { ToolSpec } from "@/services/ai/claude";
import {
  buildIntelligence,
  crashTest,
  CRASH_PRESETS,
  defaultShock,
  defaultSim,
  simulate,
} from "@/services/intelligence/engine";
import type { Locale } from "@/lib/locale-query";
import { addAction } from "@/services/intelligence/persist";

export const BUSINESS_TOOLS: ToolSpec[] = [
  {
    name: "get_business_snapshot",
    description:
      "Health score, revenue, profit, margin, cash-flow, KPIs, market estimate and active alerts for this business. Call this first.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_inventory",
    description:
      "Every SKU with quantity, true cost, current shelf price, recommended price, margin and stock status (ok/low/dead/over).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_competitors",
    description: "Competitor rows the owner entered (name, product, price, promo).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "simulate_scenario",
    description:
      "What-if on the digital twin. Returns revenue, profit and cash-flow for the given deltas in percent.",
    input_schema: {
      type: "object",
      properties: {
        priceDeltaPct: { type: "number", description: "Shelf price change, percent" },
        volumeDeltaPct: { type: "number", description: "Unit volume change, percent" },
        marketingSpend: { type: "number", description: "Extra marketing spend in TJS" },
        costDeltaPct: { type: "number", description: "Cost change, percent" },
      },
    },
  },
  {
    name: "crash_test",
    description:
      "Stress the business with a shock and get a Survival Score plus a defense plan. Presets: sales_down, costs_up, supplier_up, competitor_down, demand_down, fx, supply.",
    input_schema: {
      type: "object",
      properties: { preset: { type: "string", description: "One of the preset names" } },
      required: ["preset"],
    },
  },
  {
    name: "propose_action",
    description:
      "Put a concrete recommendation into the Action Center for the owner to approve. Never executes anything by itself.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short action, max 140 chars" },
        detail: { type: "string", description: "Why, with numbers in TJS" },
        impactMonthly: { type: "number", description: "Estimated TJS per month, may be negative" },
      },
      required: ["title", "detail"],
    },
  },
];

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function numberOf(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function makeToolRunner(business: BusinessRow, locale: Locale) {
  return async function runTool(name: string, rawInput: unknown): Promise<unknown> {
    const input = asRecord(rawInput);
    const db = readDb();
    const snap = buildIntelligence(db, business, locale);

    if (name === "get_business_snapshot") {
      return {
        name: snap.businessName,
        city: snap.city,
        stage: business.stage,
        budget: business.budget,
        currency: snap.currency,
        healthScore: snap.healthScore,
        dataQuality: snap.dataQuality,
        revenue: snap.revenue,
        profit: snap.profit,
        marginPct: snap.marginPct,
        cashFlow: snap.cashFlow,
        kpis: snap.kpis,
        market: snap.market,
        alerts: snap.alerts,
      };
    }

    if (name === "get_inventory") {
      return {
        prices: snap.prices,
        stock: snap.inventory,
      };
    }

    if (name === "get_competitors") {
      return {
        entered: db.competitors
          .filter((c) => c.businessId === business.id)
          .map((c) => ({ name: c.name, product: c.product, price: c.price, promo: c.promo })),
        note: "Only what the owner entered. No marketplace scraping.",
      };
    }

    if (name === "simulate_scenario") {
      return simulate(
        snap,
        {
          ...defaultSim(),
          priceDeltaPct: numberOf(input.priceDeltaPct),
          volumeDeltaPct: numberOf(input.volumeDeltaPct),
          marketingSpend: Math.max(0, numberOf(input.marketingSpend)),
          costDeltaPct: numberOf(input.costDeltaPct),
        },
        locale,
      );
    }

    if (name === "crash_test") {
      const preset = typeof input.preset === "string" ? CRASH_PRESETS[input.preset] : undefined;
      return crashTest(snap, preset ?? defaultShock(), locale);
    }

    if (name === "propose_action") {
      const title = String(input.title ?? "").slice(0, 140);
      if (!title) return { error: "title_required" };
      const action = addAction(
        business.id,
        title,
        String(input.detail ?? "").slice(0, 800),
        Math.round(numberOf(input.impactMonthly)),
      );
      return { id: action.id, status: action.status, needsHumanApproval: true };
    }

    return { error: "unknown_tool" };
  };
}
