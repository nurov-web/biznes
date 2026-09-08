/**
 * «Кадомаш мувофиқ аст» — интихоби тавсияшуда ва вақти мувофиқ.
 * Функсияҳои тоза: ҳам дар сервер, ҳам дар клиент кор мекунанд.
 */
import type { Locale } from "@/lib/locale-query";

export type AdviceHref = "/pricing" | "/inventory" | "/actions" | "/simulator" | "/plan";

export type Suggestion = {
  /** Кадом сатр/вариант тавсия мешавад. */
  key: string;
  index: number;
  /** Чаро маҳз ҳамин. */
  reason: string;
  /** Кай беҳтар аст. Метавонад холӣ бошад. */
  timing: string;
  /** Саҳифае, ки аз он сар кардан лозим аст. */
  href?: AdviceHref;
};

type PriceLike = {
  sku: string;
  trueCost: number;
  currentSell: number;
  recommended: number;
  marginPct: number;
  monthlyImpact: number;
};

type StockLike = {
  sku: string;
  quantity: number;
  status: "ok" | "low" | "dead" | "over";
  reorder: number;
};

type PlanOptionLike = {
  name: string;
  startupCost: number;
  monthlyProfit: number;
  breakEvenMonths: number;
};

type ActionLike = { id: string; title: string; impactMonthly: number; status: string };

function txt(locale: Locale, ru: string, tg: string, en: string): string {
  if (locale === "en") return en;
  return locale === "ru" ? ru : tg;
}

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

/** Мавсим: кай нархро бардоштан хатари камтар дорад. */
function seasonWindow(locale: Locale, date = new Date()): string {
  const m = date.getMonth();
  if (m === 1 || m === 2) {
    return txt(
      locale,
      "Лучшее окно — до Навруза, спрос растёт.",
      "Тирезаи беҳтар — пеш аз Наврӯз, талабот меафзояд.",
      "Best window is before Navruz, demand is rising.",
    );
  }
  if (m === 6 || m === 7) {
    return txt(
      locale,
      "Лучшее окно — до школьного сезона.",
      "Тирезаи беҳтар — пеш аз мавсими мактаб.",
      "Best window is before the school season.",
    );
  }
  if (m === 0) {
    return txt(
      locale,
      "Январь тихий — поднимать цену рискованно, подождите февраля.",
      "Январ ором аст — бардоштани нарх хатар дорад, то феврал сабр кунед.",
      "January is quiet — raising the price is risky, wait for February.",
    );
  }
  return txt(
    locale,
    "Обычный сезон — меняйте цену в начале недели и смотрите 7 дней.",
    "Мавсими муқаррарӣ — нархро аввали ҳафта иваз кунед ва 7 рӯз бинед.",
    "Regular season — change the price early in the week and watch for 7 days.",
  );
}

/** Аз кадом SKU сар кардан лозим аст. */
export function suggestPrice(prices: PriceLike[], locale: Locale): Suggestion | null {
  if (!prices.length) return null;
  const scored = prices
    .map((p, index) => {
      const gap = p.recommended - p.currentSell;
      const score = Math.abs(p.monthlyImpact) + Math.abs(gap) * 2 + Math.max(0, 20 - p.marginPct) * 8;
      return { p, index, score, gap };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  const up = best.gap >= 0;
  return {
    key: best.p.sku,
    index: best.index,
    reason: txt(
      locale,
      `${best.p.sku}: витрина ${money(best.p.currentSell)}, рекомендация ${money(best.p.recommended)}. Это ${up ? "самый недооценённый" : "самый переоценённый"} SKU, эффект ~${money(Math.abs(best.p.monthlyImpact))}/мес.`,
      `${best.p.sku}: витрина ${money(best.p.currentSell)}, тавсия ${money(best.p.recommended)}. Ин SKU-и ${up ? "аз ҳама арзонфурӯхта" : "аз ҳама қиматфурӯхта"} аст, таъсир ~${money(Math.abs(best.p.monthlyImpact))}/моҳ.`,
      `${best.p.sku}: shelf ${money(best.p.currentSell)}, recommended ${money(best.p.recommended)}. This is the most ${up ? "underpriced" : "overpriced"} SKU, impact ~${money(Math.abs(best.p.monthlyImpact))}/month.`,
    ),
    timing: seasonWindow(locale),
  };
}

/** Кадом молро аввал харидан ва кай. */
export function suggestReorder(stock: StockLike[], locale: Locale): Suggestion | null {
  const low = stock.filter((s) => s.status === "low");
  const dead = stock.filter((s) => s.status === "dead");

  if (low.length) {
    const first = low[0];
    const index = stock.indexOf(first);
    return {
      key: first.sku,
      index,
      reason: txt(
        locale,
        `${first.sku}: осталось ${first.quantity} шт. Докупите ${first.reorder || 8} шт., иначе потеряете продажи.`,
        `${first.sku}: ${first.quantity} дона мондааст. ${first.reorder || 8} дона харед, вагарна фурӯшро аз даст медиҳед.`,
        `${first.sku}: ${first.quantity} left. Reorder ${first.reorder || 8} units or you lose sales.`,
      ),
      timing: txt(
        locale,
        "Подходящий момент — эта неделя, до полного нуля.",
        "Вақти мувофиқ — ҳамин ҳафта, пеш аз тамом шудан.",
        "Right moment is this week, before it hits zero.",
      ),
    };
  }

  if (dead.length) {
    const first = dead[0];
    const index = stock.indexOf(first);
    return {
      key: first.sku,
      index,
      reason: txt(
        locale,
        `${first.sku}: ${first.quantity} шт. не двигаются. Не докупайте — сначала распродайте со скидкой до 10%.`,
        `${first.sku}: ${first.quantity} дона намеравад. Нахаред — аввал бо тахфифи то 10% фурӯшед.`,
        `${first.sku}: ${first.quantity} units are not moving. Do not restock — clear it first with up to 10% off.`,
      ),
      timing: txt(
        locale,
        "Начните распродажу в ближайшие выходные.",
        "Фурӯши тахфифро рӯзҳои истироҳати наздик сар кунед.",
        "Start the clearance this coming weekend.",
      ),
    };
  }

  return null;
}

/** Кадом санҷиши хатар барои ҳамин бизнес муҳимтар аст. */
export function suggestCrash(
  input: { marginPct: number; hasCompetitorPrices: boolean; deadStock: number; cashFlow: number },
  locale: Locale,
): { preset: string; reason: string } {
  if (input.marginPct < 15) {
    return {
      preset: "costs_up",
      reason: txt(
        locale,
        `Маржа ${Math.round(input.marginPct)}% — тонкая. Сначала проверьте рост затрат: он бьёт по вам сильнее всего.`,
        `Маржа ${Math.round(input.marginPct)}% — борик аст. Аввал баланд шудани хароҷотро санҷед: он ба шумо аз ҳама сахттар мезанад.`,
        `Margin is ${Math.round(input.marginPct)}% — thin. Test rising costs first: that is what hurts you most.`,
      ),
    };
  }
  if (input.cashFlow < 0) {
    return {
      preset: "sales_down",
      reason: txt(
        locale,
        "Денежный поток отрицательный. Проверьте падение продаж — это ваш ближайший риск.",
        "Ҷараёни пул манфӣ аст. Паст шудани фурӯшро санҷед — ин хатари наздиктарини шумост.",
        "Cash-flow is negative. Test a sales drop — that is your nearest risk.",
      ),
    };
  }
  if (input.hasCompetitorPrices) {
    return {
      preset: "competitor_down",
      reason: txt(
        locale,
        "У вас есть цены конкурентов. Проверьте, что будет, если сосед опустит цену на 12%.",
        "Шумо нархи рақибро доред. Санҷед, ки агар ҳамсоя нархро 12% паст кунад, чӣ мешавад.",
        "You have competitor prices. Test what happens if the shop next door cuts price by 12%.",
      ),
    };
  }
  if (input.deadStock > 0) {
    return {
      preset: "demand_down",
      reason: txt(
        locale,
        "На складе есть неликвид. Проверьте падение спроса — капитал может застрять.",
        "Дар анбор моли бефурӯш ҳаст. Паст шудани талаботро санҷед — сармоя банд мешавад.",
        "You have dead stock. Test a demand drop — capital can get stuck.",
      ),
    };
  }
  return {
    preset: "supplier_up",
    reason: txt(
      locale,
      "Базовый риск для торговли — подорожание закупа. Начните с него.",
      "Хатари асосии тиҷорат — гарон шудани харид. Аз ҳамин сар кунед.",
      "The base retail risk is a supplier price hike. Start there.",
    ),
  };
}

/** Кадом варианти нақша ба буҷа ва хатар беҳтар мувофиқ аст. */
export function suggestPlanOption(
  options: PlanOptionLike[],
  budget: number,
  locale: Locale,
): Suggestion | null {
  if (!options.length) return null;
  const scored = options
    .map((option, index) => {
      const fits = option.startupCost <= budget * 1.05 ? 1 : 0.55;
      const payback = option.breakEvenMonths > 0 ? 1 / option.breakEvenMonths : 0;
      return { option, index, score: option.monthlyProfit * fits * (1 + payback) };
    })
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  const months = best.option.breakEvenMonths;
  return {
    key: best.option.name,
    index: best.index,
    reason: txt(
      locale,
      `Лучший баланс прибыли и срока: ${money(best.option.monthlyProfit)}/мес${months ? `, окупаемость ~${months} мес.` : ""} при вашем бюджете.`,
      `Тавозуни беҳтарини фоида ва мӯҳлат: ${money(best.option.monthlyProfit)}/моҳ${months ? `, баргашти сармоя ~${months} моҳ` : ""} бо буҷаи шумо.`,
      `Best balance of profit and payback: ${money(best.option.monthlyProfit)}/month${months ? `, payback ~${months} months` : ""} for your budget.`,
    ),
    timing: txt(
      locale,
      "Начинайте с одной линейки — вторую добавляйте после первой полной распродажи.",
      "Аз як хати мол сар кунед — хати дуюмро баъд аз фурӯши пурраи аввал илова кунед.",
      "Start with one product line — add the second only after the first sells out once.",
    ),
  };
}

export type NextMoveInput = {
  prices: PriceLike[];
  inventory: StockLike[];
  actions: ActionLike[];
  marginPct: number;
  cashFlow: number;
  healthScore: number;
  hasCompetitorPrices: boolean;
};

type Ranked = { suggestion: Suggestion; score: number };

/** Як қадами навбатӣ барои панел: кадом вариант ва кай. */
export function suggestNextMove(input: NextMoveInput, locale: Locale): Suggestion | null {
  const ranked: Ranked[] = [];

  const stock = suggestReorder(input.inventory, locale);
  if (stock) {
    const row = input.inventory.find((s) => s.sku === stock.key);
    ranked.push({
      suggestion: { ...stock, href: "/inventory" },
      score: row?.status === "low" ? 100 : 58,
    });
  }

  const action = suggestAction(input.actions, locale);
  if (action) {
    const impact = Math.abs(input.actions.find((a) => a.id === action.key)?.impactMonthly ?? 0);
    ranked.push({
      suggestion: { ...action, href: "/actions" },
      score: 72 + Math.min(20, impact / 2000),
    });
  }

  const price = suggestPrice(input.prices, locale);
  if (price) {
    const row = input.prices.find((p) => p.sku === price.key);
    const impact = Math.abs(row?.monthlyImpact ?? 0);
    const under = (row?.recommended ?? 0) >= (row?.currentSell ?? 0);
    ranked.push({
      suggestion: { ...price, href: "/pricing" },
      score: (under ? 66 : 52) + Math.min(24, impact / 1500),
    });
  }

  const stressed = input.cashFlow < 0 || input.marginPct < 12 || input.healthScore < 45;
  if (stressed) {
    const crash = suggestCrash(
      {
        marginPct: input.marginPct,
        hasCompetitorPrices: input.hasCompetitorPrices,
        deadStock: input.inventory.filter((i) => i.status === "dead").length,
        cashFlow: input.cashFlow,
      },
      locale,
    );
    ranked.push({
      suggestion: {
        key: crash.preset,
        index: 0,
        reason: crash.reason,
        href: "/simulator",
        timing: txt(
          locale,
          "Прогоните этот сценарий сегодня — до того, как менять витрину.",
          "Ин сенарияро имрӯз санҷед — пеш аз иваз кардани витрина.",
          "Run this scenario today — before you change the shelf price.",
        ),
      },
      score: input.cashFlow < 0 ? 88 : input.healthScore < 45 ? 70 : 62,
    });
  }

  if (!ranked.length) return null;
  const top = [...ranked].sort((a, b) => b.score - a.score)[0];
  return top ? top.suggestion : null;
}

/** Кадом амалро аввал иҷро кардан. */
export function suggestAction(actions: ActionLike[], locale: Locale): Suggestion | null {
  const pending = actions.filter((a) => a.status === "pending" || a.status === "approved");
  if (!pending.length) return null;
  const best = [...pending].sort(
    (a, b) => Math.abs(b.impactMonthly) - Math.abs(a.impactMonthly),
  )[0];
  const index = actions.indexOf(best);
  return {
    key: best.id,
    index,
    reason: txt(
      locale,
      `Начните отсюда: наибольший эффект среди открытых, ~${money(Math.abs(best.impactMonthly))}/мес.`,
      `Аз ҳамин сар кунед: дар байни кушодаҳо таъсири аз ҳама калон, ~${money(Math.abs(best.impactMonthly))}/моҳ.`,
      `Start here: the largest impact among open items, ~${money(Math.abs(best.impactMonthly))}/month.`,
    ),
    timing: txt(
      locale,
      "Одно действие за раз — иначе не поймёте, что сработало.",
      "Дар як вақт як амал — вагарна намефаҳмед, ки кадомаш кор кард.",
      "One action at a time — otherwise you cannot tell what worked.",
    ),
  };
}
