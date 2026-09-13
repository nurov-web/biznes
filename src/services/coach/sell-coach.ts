import { SELL_COACH, type CoachLines } from "@/constants/sell-coach";
import type { Locale } from "@/lib/locale-query";
import { NICHES, detectNiche, nicheLabel, textMentionsOwnerGoal, type NicheId } from "@/lib/niche";

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

/** Ҳадафи навишта аз SKU-и қолаби хато (равған) қавитар аст. */
export function resolveShopNiche(input: {
  storedNiche?: string;
  focus?: string;
  productNames: string[];
}): NicheId {
  const fromStore = isNicheId(input.storedNiche) ? input.storedNiche : null;
  if (fromStore && fromStore !== "general") return fromStore;
  const intent = input.focus?.split("·")[0]?.trim();
  const fromIntent = detectNiche(intent);
  if (fromIntent !== "general") return fromIntent;
  const fromProducts = detectNiche(...input.productNames);
  if (fromProducts !== "general") return fromProducts;
  return detectNiche(input.focus, ...input.productNames);
}

function namesForCoach(names: string[], _niche: NicheId, focus?: string): string[] {
  const intent = focus?.split("·")[0]?.trim() ?? "";
  const matching = intent
    ? names.filter((name) => textMentionsOwnerGoal(intent, name) || textMentionsOwnerGoal(name, intent))
    : [];
  if (matching.length) return matching.slice(0, 8);
  if (intent) return [intent.slice(0, 80)];
  return names.slice(0, 8);
}

function withGoods(lines: CoachLines, sku: string, locale: Locale): CoachLines {
  const lead =
    locale === "en"
      ? `Ask about «${sku}»: how many, and for whom — then give the price.`
      : locale === "ru"
        ? `Спросите про «${sku}»: сколько и для кого — потом цену.`
        : `Пурсед дар бораи «${sku}»: чандто ва барои кӣ — баъд нархро гӯед.`;
  const sellLead =
    locale === "en"
      ? `Remind 5 people today that you have «${sku}».`
      : locale === "ru"
        ? `Сегодня напомните 5 людям, что у вас есть «${sku}».`
        : `Имрӯз 5 касро ёдрас кунед, ки «${sku}» ҳаст.`;
  const second = lines.talk[1] ?? lines.talk[0] ?? lead;
  const third = lines.talk[2] ?? lines.talk[0] ?? lead;
  const sellTwo = lines.sell[1] ?? lines.sell[0] ?? sellLead;
  const sellThree = lines.sell[2] ?? lines.sell[0] ?? sellLead;
  return {
    talk: [lead, second, third],
    sell: [sellLead, sellTwo, sellThree],
  };
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
  const catalogNames = input.prices.map((p) => p.sku).filter(Boolean);
  const niche = resolveShopNiche({
    storedNiche: input.storedNiche,
    focus: input.focus,
    productNames: catalogNames,
  });
  const productNames = namesForCoach(catalogNames, niche, input.focus);
  const base = coachLinesFor(niche, input.locale);
  const sku = productNames[0] ?? "";
  const lines = sku ? withGoods(base, sku, input.locale) : base;
  const allowed = new Set(productNames);
  const lowSkus = input.inventory
    .filter((row) => row.status === "low" || row.status === "dead")
    .map((row) => row.sku)
    .filter((name) => allowed.has(name) || (sku ? textMentionsOwnerGoal(sku, name) : detectNiche(name) === niche))
    .slice(0, 4);

  return {
    niche,
    nicheName: nicheLabel(niche, input.locale),
    productNames,
    talk: lines.talk,
    sell: lines.sell,
    lowSkus,
    hasProducts: catalogNames.length > 0 || productNames.length > 0,
  };
}
