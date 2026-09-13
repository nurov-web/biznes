import type {
  BusinessRow,
  CompetitorRow,
  Database,
  FinanceRow,
  ProductRow,
  SalesLineRow,
} from "@/lib/store";

import type { Locale } from "@/lib/locale-query";
import { cityId } from "@/constants/city-market";
import { detectOwnerNiche, nicheLabel, ownerFocusText } from "@/lib/niche";

export type { Locale };

export type ShockInput = {
  salesDeltaPct: number;
  costDeltaPct: number;
  supplierDeltaPct: number;
  competitorDeltaPct: number;
  demandDeltaPct: number;
  fxDeltaPct: number;
  supplyCutPct: number;
};

export type SimInput = {
  priceDeltaPct: number;
  volumeDeltaPct: number;
  marketingSpend: number;
} & ShockInput;

export type PriceRow = {
  sku: string;
  trueCost: number;
  currentSell: number;
  competitorPrice: number | null;
  recommended: number;
  marginPct: number;
  elasticity: number;
  why: string;
  monthlyImpact: number;
};

export type IntelligenceSnapshot = {
  businessName: string;
  city: string;
  businessType: string;
  focus: string;
  niche: string;
  currency: string;
  dataQuality: number;
  healthScore: number;
  revenue: number;
  profit: number;
  marginPct: number;
  cashFlow: number;
  happened: string;
  why: string;
  willHappen: string;
  shouldDo: string;
  kpis: { key: string; label: string; value: number; unit: string }[];
  market: {
    sizeNote: string;
    demand: string;
    season: string;
    productTrend: string;
    industry: string;
    customer: string;
  };
  competitors: {
    name: string;
    product: string;
    price: number;
    promo: string;
    vsUs: string;
  }[];
  prices: PriceRow[];
  inventory: {
    sku: string;
    quantity: number;
    status: "ok" | "low" | "dead" | "over";
    forecast: string;
    reorder: number;
  }[];
  alerts: {
    kind: "problem" | "opportunity";
    level: "high" | "medium" | "low";
    title: string;
    detail: string;
    impactMonthly: number;
  }[];
  disclaimer: string;
};

const CITY_K: Record<ReturnType<typeof cityId>, number> = {
  dushanbe: 1,
  khujand: 0.45,
  bokhtar: 0.28,
  kulob: 0.22,
  other: 0.25,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function avg(a: number, b: number): number {
  return (a + b) / 2;
}

function txt(locale: Locale, ru: string, tg: string, en = ru): string {
  if (locale === "en") return en;
  return locale === "ru" ? ru : tg;
}

function monthFactor(d = new Date()): {
  factor: number;
  nameTg: string;
  nameRu: string;
  nameEn: string;
} {
  const m = d.getMonth();
  if (m === 2 || m === 3) {
    return { factor: 1.18, nameTg: "Наврӯз / баҳор", nameRu: "Навруз / весна", nameEn: "Navruz / spring" };
  }
  if (m === 7 || m === 8) {
    return { factor: 1.12, nameTg: "Мавсими мактаб", nameRu: "Школьный сезон", nameEn: "Back-to-school" };
  }
  if (m === 11) {
    return { factor: 1.15, nameTg: "Охири сол", nameRu: "Конец года", nameEn: "Year-end" };
  }
  if (m === 0) {
    return { factor: 0.88, nameTg: "Январ (ором)", nameRu: "Январь (тихий)", nameEn: "January (quiet)" };
  }
  return { factor: 1, nameTg: "Мавсими муқаррарӣ", nameRu: "Обычный сезон", nameEn: "Regular season" };
}

function typeBase(type: string, niche: string): number {
  if (niche === "cars") return 280000;
  if (niche === "phones") return 180000;
  if (type === "trade") return 420000;
  if (type === "it") return 180000;
  if (type === "service") return 90000;
  if (type === "construction") return 250000;
  return 120000;
}

export function defaultShock(): ShockInput {
  return {
    salesDeltaPct: 0,
    costDeltaPct: 0,
    supplierDeltaPct: 0,
    competitorDeltaPct: 0,
    demandDeltaPct: 0,
    fxDeltaPct: 0,
    supplyCutPct: 0,
  };
}

export function defaultSim(): SimInput {
  return { priceDeltaPct: 0, volumeDeltaPct: 0, marketingSpend: 0, ...defaultShock() };
}

export const CRASH_PRESETS: Record<string, ShockInput> = {
  sales_down: { ...defaultShock(), salesDeltaPct: -25 },
  costs_up: { ...defaultShock(), costDeltaPct: 18 },
  supplier_up: { ...defaultShock(), supplierDeltaPct: 20 },
  competitor_down: { ...defaultShock(), competitorDeltaPct: -12, salesDeltaPct: -8 },
  demand_down: { ...defaultShock(), demandDeltaPct: -20 },
  fx: { ...defaultShock(), fxDeltaPct: 12, costDeltaPct: 6 },
  supply: { ...defaultShock(), supplyCutPct: 40, salesDeltaPct: -15 },
};

export function recommendedSim(snap: IntelligenceSnapshot): SimInput {
  const sim = defaultSim();
  if (snap.marginPct < 15) sim.priceDeltaPct = 4;
  else sim.volumeDeltaPct = 8;
  return sim;
}

export function buildIntelligence(
  db: Database,
  business: BusinessRow,
  locale: Locale,
): IntelligenceSnapshot {
  const products = db.products.filter((p) => p.businessId === business.id && !p.archived);
  const finance = db.financeEntries.filter((e) => e.businessId === business.id);
  const sales = db.salesLines.filter((s) => s.businessId === business.id);
  const competitors = db.competitors.filter((c) => c.businessId === business.id);
  const season = monthFactor();
  const cityK = CITY_K[cityId(business.city)];
  const focus = ownerFocusText({
    goal: business.goal,
    typeNote: business.typeNote,
    name: business.name,
  });
  const catalogText = products
    .map((p) => `${p.category} ${p.brand} ${p.model}`)
    .join(" ");
  const niche = detectOwnerNiche({
    goal: business.goal,
    typeNote: business.typeNote,
    name: business.name,
    catalog: catalogText,
  });
  const marketSize = Math.round(typeBase(business.type, niche) * cityK * season.factor);
  const nicheName = nicheLabel(niche, locale);

  const income = sumFinance(finance, "income") + sales.reduce((s, r) => s + r.revenue, 0);
  const expense = sumFinance(finance, "expense") + sales.reduce((s, r) => s + r.cost, 0);
  const stockValue = products.reduce((s, p) => s + avg(p.buyPriceMin, p.buyPriceMax) * p.quantity, 0);
  const profit = income - expense;
  const hasRealSales = income > 0;
  const marginPct = hasRealSales ? (profit / income) * 100 : 0;
  const cashFlow = profit;
  const dataQuality = dataScore(products, finance, sales, competitors);

  const prices = products.map((p) => priceFor(p, competitors, locale, business.city));
  const inventory = products.map((p) => inventoryFor(p, sales, locale));

  const okShare =
    products.length === 0
      ? 0
      : inventory.filter((i) => i.status === "ok").length / products.length;
  const healthScore = Math.round(
    clamp(
      dataQuality * 20 +
        (hasRealSales ? clamp(marginPct / 30, 0, 1) * 25 : 0) +
        okShare * 20 +
        (hasRealSales ? (cashFlow >= 0 ? 20 : 8) : 0) +
        (competitors.length > 0 ? 10 : 0),
      0,
      100,
    ),
  );

  const alerts = buildAlerts(prices, inventory, marginPct, dataQuality, locale);
  const narrative = narrativeOf({
    locale,
    business,
    healthScore,
    income,
    profit,
    marginPct,
    alerts,
    season,
    marketSize,
    dataQuality,
  });

  return {
    businessName: business.name,
    city: business.city,
    businessType: business.type,
    focus,
    niche,
    currency: "TJS",
    dataQuality: Math.round(dataQuality * 100),
    healthScore,
    revenue: round(income),
    profit: round(profit),
    marginPct: round(marginPct),
    cashFlow: round(cashFlow),
    ...narrative,
    kpis: [
      { key: "health", label: txt(locale, "Здоровье", "Саломатӣ", "Health"), value: healthScore, unit: "/100" },
      { key: "rev", label: txt(locale, "Выручка", "Даромад", "Revenue"), value: round(income), unit: "TJS" },
      { key: "profit", label: txt(locale, "Прибыль", "Фоида", "Profit"), value: round(profit), unit: "TJS" },
      { key: "margin", label: txt(locale, "Маржа", "Маржа", "Margin"), value: round(marginPct), unit: "%" },
      { key: "cash", label: txt(locale, "Денежный поток", "Ҷараёни пул", "Cash-flow"), value: round(cashFlow), unit: "TJS" },
      { key: "stock", label: txt(locale, "Склад", "Анбор", "Stock"), value: round(stockValue), unit: "TJS" },
    ],
    market: {
      sizeNote: txt(
        locale,
        `Оценка ёмкости «${nicheName}» в ${business.city}: ~${marketSize.toLocaleString("ru-RU")} TJS/мес. Это модель, не перепись рынка.`,
        `Ҳаҷми тахминии бозори «${nicheName}» дар ${business.city}: ~${marketSize.toLocaleString("ru-RU")} TJS/моҳ. Ин модел аст, на барӯйхатгирии бозор.`,
        `Capacity estimate for «${nicheName}» in ${business.city}: ~${marketSize.toLocaleString("ru-RU")} TJS/month. Model, not a census.`,
      ),
      demand: txt(
        locale,
        `Спрос сейчас ${season.factor >= 1 ? "выше" : "ниже"} среднего (коэф. ${season.factor}).`,
        `Талабот ҳоло ${season.factor >= 1 ? "аз миёна баландтар" : "аз миёна пасттар"} (коэф. ${season.factor}).`,
        `Demand is now ${season.factor >= 1 ? "above" : "below"} average (factor ${season.factor}).`,
      ),
      season: txt(locale, season.nameRu, season.nameTg, season.nameEn),
      productTrend: txt(
        locale,
        products[0]
          ? `В каталоге лидирует ${products[0].brand} ${products[0].model}.`
          : "Добавьте SKU, чтобы увидеть тренд товара.",
        products[0]
          ? `Дар каталог пешсаф ${products[0].brand} ${products[0].model}.`
          : "SKU илова кунед, то тамоюли молро бинед.",
        products[0]
          ? `Catalog lead: ${products[0].brand} ${products[0].model}.`
          : "Add SKUs to see a product trend.",
      ),
      industry: txt(
        locale,
        "Розница в Таджикистане чувствительна к курсу, доставке и сезону школ/праздников.",
        "Чакана дар Тоҷикистон ба қурб, доставка ва мавсими мактаб/идҳо ҳассос аст.",
        "Tajikistan retail is sensitive to FX, freight, school season and holidays.",
      ),
      customer: business.audience
        ? txt(locale, `Сегмент: ${business.audience}.`, `Қисм: ${business.audience}.`, `Segment: ${business.audience}.`)
        : txt(
            locale,
            "Сегмент клиентов не указан.",
            "Қисми мизоҷон навишта нашудааст.",
            "Customer segment is not set.",
          ),
    },
    competitors: mapCompetitors(competitors, locale),
    prices,
    inventory,
    alerts,
    disclaimer: txt(
      locale,
      "Прогноз на основе ваших данных и модели. Не гарантия прибыли. Живые цены маркетплейсов не парсятся.",
      "Пешгӯӣ аз рӯи маълумоти шумо ва модел. Кафолати фоида нест. Нархҳои зиндаи бозор худкор гирифта намешаванд.",
      "Forecast from your data and the model. Not a profit guarantee. Live marketplace prices are not scraped.",
    ),
  };
}

export function simulate(
  snap: IntelligenceSnapshot,
  sim: SimInput,
  locale: Locale,
): { revenue: number; profit: number; cashFlow: number; note: string } {
  const priceK = 1 + sim.priceDeltaPct / 100;
  const volK = 1 + sim.volumeDeltaPct / 100 + sim.demandDeltaPct / 100 - sim.supplyCutPct / 200;
  const elasticityHit = 1 - Math.abs(sim.priceDeltaPct) * 0.008;
  const salesK = (1 + sim.salesDeltaPct / 100) * volK * elasticityHit;
  const costK = 1 + sim.costDeltaPct / 100 + sim.supplierDeltaPct / 100 + sim.fxDeltaPct / 200;
  const revenue = round(snap.revenue * priceK * salesK);
  const baseCost = snap.revenue - snap.profit;
  const profit = round(revenue - baseCost * costK - sim.marketingSpend);
  const cashFlow = round(profit);
  const note = txt(
    locale,
    `Симуляция: выручка ${revenue.toLocaleString("ru-RU")} TJS, прибыль ${profit.toLocaleString("ru-RU")} TJS. Ориентир, не факт.`,
    `Симуляция: даромад ${revenue.toLocaleString("ru-RU")} TJS, фоида ${profit.toLocaleString("ru-RU")} TJS. Самт аст, на факт.`,
    `Simulation: revenue ${revenue.toLocaleString("ru-RU")} TJS, profit ${profit.toLocaleString("ru-RU")} TJS. Orienting, not a fact.`,
  );
  return { revenue, profit, cashFlow, note };
}

export function crashTest(snap: IntelligenceSnapshot, shock: ShockInput, locale: Locale) {
  const sim = simulate(snap, { ...defaultSim(), ...shock }, locale);
  const stress = Math.abs(shock.salesDeltaPct) + Math.abs(shock.costDeltaPct) + Math.abs(shock.demandDeltaPct);
  const survival = Math.round(
    clamp(snap.healthScore * 0.5 + (sim.profit >= 0 ? 30 : 8) + (sim.cashFlow >= 0 ? 20 : 5) - stress * 0.3, 8, 95),
  );
  const defense = [
    txt(locale, "Заморозьте закуп медленных SKU на 14 дней.", "Хариди SKU-и сустро 14 рӯз қатъ кунед."),
    txt(locale, "Поднимите долю аксессуаров с маржой >25%.", "Ҳиссаи лавозимоти маржаашон >25%-ро зиёд кунед."),
    txt(locale, "Держите резерв 10–15% капитала в кэше.", "10–15% сармояро дар нақд нигоҳ доред."),
    txt(locale, "Сверьте 3 цены конкурентов на этой неделе.", "Ин ҳафта 3 нархи рақибро санҷед."),
    txt(locale, "Не режьте витрину сразу больше чем на 5%.", "Нархи витринаро якбора беш аз 5% паст накунед."),
  ];
  return { ...sim, survivalScore: survival, defense };
}

function sumFinance(rows: FinanceRow[], type: string): number {
  return rows.filter((r) => r.type === type).reduce((s, r) => s + r.amount, 0);
}

function dataScore(
  products: ProductRow[],
  finance: FinanceRow[],
  sales: SalesLineRow[],
  competitors: CompetitorRow[],
): number {
  let s = 0.15;
  if (products.length) s += 0.25;
  if (finance.length || sales.length) s += 0.3;
  if (competitors.length) s += 0.2;
  if (products.some((p) => p.sellPriceMax > 0)) s += 0.1;
  return clamp(s, 0.1, 1);
}

function priceFor(
  p: ProductRow,
  competitors: CompetitorRow[],
  locale: Locale,
  city: string,
): PriceRow {
  const buy = avg(p.buyPriceMin, p.buyPriceMax);
  const sell = avg(p.sellPriceMin, p.sellPriceMax);
  const freight = buy * 0.08;
  const trueCost = round(buy + freight);
  const name = `${p.brand} ${p.model}`.trim();
  const match = competitors.find((c) =>
    name && c.product.toLowerCase().includes(p.model.toLowerCase().slice(0, 8) || "___"),
  );
  const competitorPrice = match?.price ?? null;
  const floor = trueCost * 1.16;
  const recommended = round(
    competitorPrice && competitorPrice > 0
      ? Math.max(floor, Math.min(competitorPrice * 0.98, competitorPrice * 1.04))
      : trueCost * 1.24,
  );
  const current = sell > 0 ? sell : recommended;
  const marginPct = trueCost > 0 ? round(((recommended - trueCost) / trueCost) * 100) : 0;
  const elasticity = -0.8;
  const monthlyImpact = round((recommended - current) * Math.max(p.quantity * 0.35, 1));
  const why = txt(
    locale,
    `Себестоимость ${trueCost} TJS = закуп ${round(buy)} + доставка/риск ${round(freight)}. Витрина ${recommended} TJS даёт маржу ${marginPct}% в ${city}. Эластичность модели −0.8: +10% цены ≈ −8% штук.`,
    `Арзиши воқеӣ ${trueCost} TJS = харид ${round(buy)} + доставка/хатар ${round(freight)}. Витрина ${recommended} TJS маржа ${marginPct}% дар ${city}. Эластикӣ −0.8: +10% нарх ≈ −8% адад.`,
    `True cost ${trueCost} TJS = buy ${round(buy)} + freight/risk ${round(freight)}. Shelf ${recommended} TJS is ${marginPct}% margin in ${city}. Model elasticity −0.8: +10% price ≈ −8% units.`,
  );
  return {
    sku: name || p.category,
    trueCost,
    currentSell: round(current),
    competitorPrice,
    recommended,
    marginPct,
    elasticity,
    why,
    monthlyImpact,
  };
}

function inventoryFor(p: ProductRow, sales: SalesLineRow[], locale: Locale) {
  const sku = `${p.brand} ${p.model}`.trim() || p.category;
  const sold = sales
    .filter((s) => s.sku.toLowerCase().includes(p.model.toLowerCase()) || s.sku === sku)
    .reduce((n, s) => n + s.quantity, 0);
  const velocity = sold || Math.max(1, Math.round(p.quantity * 0.2));
  let status: "ok" | "low" | "dead" | "over" = "ok";
  if (p.quantity <= 3) status = "low";
  else if (p.quantity > 40 && velocity < 3) status = "dead";
  else if (p.quantity > 25) status = "over";
  const days = velocity > 0 ? Math.round((p.quantity / velocity) * 30) : 90;
  const reorder = status === "low" ? Math.max(8, velocity) : 0;
  const forecast = txt(
    locale,
    `~${days} дн. запаса при текущем темпе. Перезаказ: ${reorder || "не срочно"}.`,
    `~${days} рӯз захира бо суръати ҳозира. Хариди нав: ${reorder || "ҳоло зарур нест"}.`,
    `~${days} days of cover at current pace. Reorder: ${reorder || "not urgent"}.`,
  );
  return { sku, quantity: p.quantity, status, forecast, reorder };
}

function mapCompetitors(
  rows: CompetitorRow[],
  locale: Locale,
) {
  if (rows.length === 0) {
    return [];
  }
  return rows.map((c) => ({
    name: c.name,
    product: c.product || "—",
    price: c.price,
    promo: c.promo || "—",
    vsUs:
      c.price > 0
        ? c.note || txt(locale, "Сверьте с вашей витриной.", "Бо витринаи худ муқоиса кунед.")
        : txt(locale, "Цена конкурента ещё не введена.", "Нархи рақиб ҳанӯз ворид нашудааст."),
  }));
}

function buildAlerts(
  prices: PriceRow[],
  inventory: IntelligenceSnapshot["inventory"],
  marginPct: number,
  dataQuality: number,
  locale: Locale,
): IntelligenceSnapshot["alerts"] {
  const alerts: IntelligenceSnapshot["alerts"] = [];
  const dead = inventory.filter((i) => i.status === "dead");
  const low = inventory.filter((i) => i.status === "low");
  const best = [...prices].sort((a, b) => b.marginPct - a.marginPct)[0];
  if (low.length) {
    alerts.push({
      kind: "problem",
      level: "high",
      title: txt(locale, "Риск stock-out", "Хатари тамом шудани мол"),
      detail: txt(locale, `${low.length} SKU близки к нулю.`, `${low.length} SKU ба сифр наздик аст.`),
      impactMonthly: -Math.round(low.length * 400),
    });
  }
  if (dead.length) {
    alerts.push({
      kind: "problem",
      level: "medium",
      title: txt(locale, "Dead stock", "Моли бефурӯш"),
      detail: txt(locale, `${dead[0].sku}: капитал заморожен.`, `${dead[0].sku}: сармоя банд аст.`),
      impactMonthly: -Math.round(dead.length * 250),
    });
  }
  if (best && best.marginPct >= 22) {
    alerts.push({
      kind: "opportunity",
      level: "medium",
      title: txt(locale, "Маржа выше среднего", "Маржа аз миёна беҳтар"),
      detail: txt(
        locale,
        `${best.sku}: увеличьте долю. Оценка влияния ~${best.monthlyImpact} TJS/мес.`,
        `${best.sku}: ҳиссаашро зиёд кунед. Таъсири тахминӣ ~${best.monthlyImpact} TJS/моҳ.`,
      ),
      impactMonthly: Math.round(Math.abs(best.monthlyImpact) || 400),
    });
  }
  if (marginPct < 12 && prices.length) {
    alerts.push({
      kind: "problem",
      level: "high",
      title: txt(locale, "Маржа слишком тонкая", "Маржа хеле борик аст"),
      detail: txt(locale, `Средняя маржа ${round(marginPct)}%.`, `Маржаи миёна ${round(marginPct)}%.`),
      impactMonthly: -800,
    });
  }
  if (dataQuality < 0.45) {
    alerts.push({
      kind: "opportunity",
      level: "low",
      title: txt(locale, "Мало фактов", "Кам далел"),
      detail: txt(
        locale,
        "Импортируйте CSV продаж — симулятор станет точнее.",
        "CSV-и фурӯшро ворид кунед — симулятор дақиқтар мешавад.",
      ),
      impactMonthly: 0,
    });
  }
  return alerts;
}

function narrativeOf(input: {
  locale: Locale;
  business: BusinessRow;
  healthScore: number;
  income: number;
  profit: number;
  marginPct: number;
  alerts: IntelligenceSnapshot["alerts"];
  season: { factor: number; nameTg: string; nameRu: string };
  marketSize: number;
  dataQuality: number;
}) {
  const { locale } = input;
  const problem = input.alerts.find((a) => a.kind === "problem");
  const opp = input.alerts.find((a) => a.kind === "opportunity");
  return {
    happened: txt(
      locale,
      `${input.business.name}: выручка ${round(input.income)} TJS, прибыль ${round(input.profit)} TJS, маржа ${round(input.marginPct)}%. Health ${input.healthScore}/100.`,
      `${input.business.name}: даромад ${round(input.income)} TJS, фоида ${round(input.profit)} TJS, маржа ${round(input.marginPct)}%. Health ${input.healthScore}/100.`,
    ),
    why: txt(
      locale,
      problem
        ? problem.detail
        : `Сезон «${input.season.nameRu}» и полнота данных ${Math.round(input.dataQuality * 100)}% объясняют картину.`,
      problem
        ? problem.detail
        : `Мавсим «${input.season.nameTg}» ва пуррагии маълумот ${Math.round(input.dataQuality * 100)}% манзараро шарҳ медиҳанд.`,
    ),
    willHappen: txt(
      locale,
      `При текущем темпе и сезоне ёмкость рядом ~${input.marketSize.toLocaleString("ru-RU")} TJS/мес. Без действия Health сдвинется слабо.`,
      `Бо суръати ҳозира ва мавсим ҳаҷми наздик ~${input.marketSize.toLocaleString("ru-RU")} TJS/моҳ. Бе амал Health кам тағйир меёбад.`,
    ),
    shouldDo: txt(
      locale,
      opp?.detail || "Сверьте 3 цены и закройте 1 SKU с нулевым оборотом.",
      opp?.detail || "3 нархро санҷед ва 1 SKU-и бегардишро банд кунед.",
    ),
  };
}

export const AGENTS = [
  "ceo",
  "cfo",
  "marketing",
  "sales",
  "inventory",
  "market",
  "risk",
] as const;

export type AgentId = (typeof AGENTS)[number];
