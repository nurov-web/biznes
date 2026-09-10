export type RescueTone = "empty" | "quiet" | "ok" | "danger";

export type RescueSku = {
  sku: string;
  sell: number;
  buy: number;
  marginPct: number;
  quantity: number;
};

export type RescueView = {
  tone: RescueTone;
  expensive: RescueSku | null;
  cheap: RescueSku | null;
  stuck: RescueSku[];
  hasProducts: boolean;
  salesCount: number;
};

type PriceLike = {
  sku: string;
  trueCost: number;
  currentSell: number;
  marginPct: number;
};

type StockLike = {
  sku: string;
  quantity: number;
  status: "ok" | "low" | "dead" | "over";
};

/** Ташхиси маҳаллӣ: гарон, арзон, хоб — бе Claude ҳам кор мекунад. */
export function buildRescue(input: {
  prices: PriceLike[];
  inventory: StockLike[];
  salesCount: number;
  profit: number;
  marginPct: number;
}): RescueView {
  const qty = new Map(input.inventory.map((row) => [row.sku, row]));
  const rows: RescueSku[] = input.prices
    .filter((p) => p.sku)
    .map((p) => {
      const stock = qty.get(p.sku);
      return {
        sku: p.sku,
        sell: p.currentSell,
        buy: p.trueCost,
        marginPct: p.marginPct,
        quantity: stock?.quantity ?? 0,
      };
    });

  const byMargin = [...rows].sort((a, b) => a.marginPct - b.marginPct);
  const expensive = byMargin[0] ?? null;
  const cheap = byMargin[byMargin.length - 1] ?? null;
  const stuck = input.inventory
    .filter((row) => row.status === "dead" || (row.status === "over" && row.quantity > 0))
    .map((row) => {
      const price = rows.find((p) => p.sku === row.sku);
      return {
        sku: row.sku,
        sell: price?.sell ?? 0,
        buy: price?.buy ?? 0,
        marginPct: price?.marginPct ?? 0,
        quantity: row.quantity,
      };
    })
    .slice(0, 4);

  let tone: RescueTone = "ok";
  if (rows.length === 0) tone = "empty";
  else if (input.salesCount === 0) tone = "quiet";
  else if (input.profit < 0 || input.marginPct < 8 || (expensive && expensive.marginPct < 5)) {
    tone = "danger";
  }

  const sameSku = Boolean(expensive && cheap && expensive.sku === cheap.sku);

  return {
    tone,
    expensive: expensive && rows.length > 0 ? expensive : null,
    cheap: cheap && rows.length > 1 && !sameSku ? cheap : null,
    stuck,
    hasProducts: rows.length > 0,
    salesCount: input.salesCount,
  };
}
