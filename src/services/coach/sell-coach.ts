import { SELL_COACH, type CoachLines } from "@/constants/sell-coach";
import type { Locale } from "@/lib/locale-query";
import { NICHES, detectNiche, nicheLabel, type NicheId } from "@/lib/niche";

export type StockLike = {
  sku: string;
  status: "ok" | "low" | "dead" | "over";
};

export type PriceLike = {
  sku: string;
};

export type SellCoachView = {
  niche: NicheId;
  nicheName: string;
  productNames: string[];
  talk: readonly string[];
  sell: readonly string[];
  lowSkus: string[];
  hasProducts: boolean;
};

function isNicheId(value: string | undefined): value is NicheId {
  return Boolean(value && (NICHES as readonly string[]).includes(value));
}

/** Нишаро аз молҳо мегирем — на танҳо аз номи бизнес. */
export function resolveShopNiche(input: {
  storedNiche?: string;
  focus?: string;
  productNames: string[];
}): NicheId {
  const fromProducts = detectNiche(...input.productNames);
  if (fromProducts !== "general") return fromProducts;
  const fromStore = isNicheId(input.storedNiche) ? input.storedNiche : null;
  if (fromStore && fromStore !== "general") return fromStore;
  return detectNiche(input.focus, ...input.productNames);
}

export function coachLinesFor(niche: NicheId, locale: Locale): CoachLines {
  return SELL_COACH[niche][locale];
}

export function buildSellCoach(input: {
  locale: Locale;
  storedNiche?: string;
  focus?: string;
  prices: PriceLike[];
  inventory: StockLike[];
}): SellCoachView {
  const productNames = input.prices.map((p) => p.sku).filter(Boolean);
  const niche = resolveShopNiche({
    storedNiche: input.storedNiche,
    focus: input.focus,
    productNames,
  });
  const lines = coachLinesFor(niche, input.locale);
  const lowSkus = input.inventory
    .filter((row) => row.status === "low" || row.status === "dead")
    .map((row) => row.sku)
    .slice(0, 4);

  return {
    niche,
    nicheName: nicheLabel(niche, input.locale),
    productNames: productNames.slice(0, 8),
    talk: lines.talk,
    sell: lines.sell,
    lowSkus,
    hasProducts: productNames.length > 0,
  };
}
