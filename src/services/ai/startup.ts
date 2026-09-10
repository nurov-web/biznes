/**
 * Нақшаи оғози бизнес барои корбароне, ки ҳанӯз бизнес надоранд.
 * Claude + модели маҳаллӣ ҳамчун захира. Ҳамеша пешгӯӣ, на кафолат.
 */
import type { PlanOption } from "@/lib/store";
import type { Locale } from "@/lib/locale-query";
import { detectNiche, nicheLabel, type NicheId } from "@/lib/niche";
import { completeClaude, extractJsonObject } from "@/services/ai/claude";
import { businessSystemPrompt } from "@/services/ai/business-system";

export type StartupInput = {
  budget: number;
  city: string;
  goal: string;
  experience: string;
  hoursPerWeek: number;
  locale: Locale;
};

export type StartupPlan = {
  summary: string;
  options: PlanOption[];
  warnings: string[];
};

type Template = {
  key: string;
  niche: NicheId;
  name: Record<Locale, string>;
  minBudget: number;
  marginPct: number;
  turnsPerMonth: number;
  fixedCostShare: number;
  risk: Record<Locale, string>;
  items: { name: string; supplier: string; buy: number; margin: number }[];
};

const TEMPLATES: Template[] = [
  {
    key: "auto-parts",
    niche: "cars",
    name: {
      tg: "Запчаст ва равғани мошин",
      ru: "Автозапчасти и масло",
      en: "Car parts and oil",
    },
    minBudget: 4000,
    marginPct: 34,
    turnsPerMonth: 1.4,
    fixedCostShare: 0.16,
    risk: {
      tg: "Қалбакӣ зиёд. Бренди маълум гиред. Моли гарон (шинаи калон) пулро банд мекунад.",
      ru: "Много подделок. Берите известный бренд. Дорогой сток (шины) замораживает деньги.",
      en: "Fakes are common. Buy known brands. Expensive stock (tyres) freezes cash.",
    },
    items: [
      { name: "Равғани мотор 4л", supplier: "Корвон / оптом", buy: 85, margin: 0.45 },
      { name: "Филтри ҳаво", supplier: "Корвон / оптом", buy: 22, margin: 0.7 },
      { name: "Лавҳаи тормоз", supplier: "Оптом, Душанбе", buy: 140, margin: 0.5 },
      { name: "Лампа / предохранитель", supplier: "Корвон", buy: 8, margin: 0.9 },
    ],
  },
  {
    key: "car-wash",
    niche: "cars",
    name: {
      tg: "Шустани мошин / детейлинг",
      ru: "Мойка / детейлинг",
      en: "Car wash / detailing",
    },
    minBudget: 6000,
    marginPct: 55,
    turnsPerMonth: 3,
    fixedCostShare: 0.35,
    risk: {
      tg: "Ҷой ва об ҳама чизро ҳал мекунад. Иҷораи баланд фоидаро мехӯрад.",
      ru: "Локация и вода решают всё. Дорогая аренда съедает прибыль.",
      en: "Location and water decide everything. High rent eats profit.",
    },
    items: [
      { name: "Шампуни мошин (л)", supplier: "Оптом", buy: 18, margin: 2.2 },
      { name: "Муми / воск", supplier: "Оптом", buy: 35, margin: 1.4 },
      { name: "Дастмол / микрофибра", supplier: "Корвон", buy: 12, margin: 1.1 },
    ],
  },
  {
    key: "used-cars",
    niche: "cars",
    name: {
      tg: "Фурӯши мошинҳои коркардшуда",
      ru: "Продажа подержанных машин",
      en: "Used-car sales",
    },
    minBudget: 28000,
    marginPct: 12,
    turnsPerMonth: 0.4,
    fixedCostShare: 0.2,
    risk: {
      tg: "Сармояи калон, ҳуҷҷат, таъмир ва фурӯши суст. Барои буҷаи хурд тавсия намешавад.",
      ru: "Большой капитал, документы, ремонт и медленная продажа. Для малого бюджета не советуем.",
      en: "Heavy capital, paperwork, repairs and slow sale. Not for a small budget.",
    },
    items: [
      { name: "Як мошини коркардшуда (мисол)", supplier: "Бозор / шахс", buy: 22000, margin: 0.12 },
      { name: "Таъмир / ҳуҷҷат", supplier: "Маҳаллӣ", buy: 2500, margin: 0 },
    ],
  },
  {
    key: "accessories",
    niche: "phones",
    name: {
      tg: "Лавозимоти телефон ва компютер",
      ru: "Аксессуары для телефонов и компьютеров",
      en: "Phone and computer accessories",
    },
    minBudget: 3000,
    marginPct: 32,
    turnsPerMonth: 1.6,
    fixedCostShare: 0.14,
    risk: {
      tg: "Рақобат зиёд, вале маблағи вуруд хурд аст. Хатари асосӣ — моли бефурӯш.",
      ru: "Высокая конкуренция, но низкий порог входа. Главный риск — неликвид.",
      en: "Crowded, but the entry cost is low. Main risk is dead stock.",
    },
    items: [
      { name: "Powerbank 10000mAh", supplier: "Корвон / оптом", buy: 95, margin: 0.38 },
      { name: "Кабел Type-C", supplier: "Корвон / оптом", buy: 12, margin: 0.55 },
      { name: "Наушники TWS", supplier: "Дӯкони яклухт", buy: 130, margin: 0.35 },
      { name: "Шишаи муҳофизатӣ", supplier: "Корвон / оптом", buy: 6, margin: 0.7 },
    ],
  },
  {
    key: "repair",
    niche: "repair",
    name: {
      tg: "Таъмири телефон ва ноутбук",
      ru: "Ремонт телефонов и ноутбуков",
      en: "Phone and laptop repair",
    },
    minBudget: 5000,
    marginPct: 55,
    turnsPerMonth: 1,
    fixedCostShare: 0.22,
    risk: {
      tg: "Ба маҳорати шумо вобаста аст. Бе устоди хуб даромад нест.",
      ru: "Зависит от вашего навыка. Без мастера дохода не будет.",
      en: "Depends on your skill. No technician, no income.",
    },
    items: [
      { name: "Экрани иваз (Redmi)", supplier: "Оптом, Душанбе", buy: 180, margin: 0.6 },
      { name: "Батарея", supplier: "Оптом, Душанбе", buy: 90, margin: 0.65 },
      { name: "Асбоби таъмир", supplier: "Як маротиба", buy: 900, margin: 0 },
    ],
  },
  {
    key: "clothes",
    niche: "clothes",
    name: {
      tg: "Либос ва пойафзол",
      ru: "Одежда и обувь",
      en: "Clothing and footwear",
    },
    minBudget: 8000,
    marginPct: 45,
    turnsPerMonth: 0.9,
    fixedCostShare: 0.25,
    risk: {
      tg: "Андоза ва мавсим. Моли нофурӯхта пулро банд мекунад.",
      ru: "Размеры и сезон. Непроданное замораживает деньги.",
      en: "Sizes and season. Unsold stock freezes cash.",
    },
    items: [
      { name: "Куртка (мавсимӣ)", supplier: "Корвон / Хитой", buy: 220, margin: 0.5 },
      { name: "Кроссовка", supplier: "Корвон", buy: 180, margin: 0.45 },
      { name: "Футболка", supplier: "Корвон", buy: 45, margin: 0.6 },
    ],
  },
  {
    key: "food",
    niche: "food",
    name: {
      tg: "Кофе / хӯроки тез (нуқтаи хурд)",
      ru: "Кофе / быстрая еда (малая точка)",
      en: "Coffee / fast food (small spot)",
    },
    minBudget: 12000,
    marginPct: 60,
    turnsPerMonth: 4,
    fixedCostShare: 0.4,
    risk: {
      tg: "Иҷора ва ҷойгиршавӣ ҳама чизро ҳал мекунад. Хароҷоти доимӣ баланд.",
      ru: "Аренда и локация решают всё. Высокие постоянные расходы.",
      en: "Rent and location decide everything. High fixed costs.",
    },
    items: [
      { name: "Дона қаҳва (кг)", supplier: "Импорт / оптом", buy: 190, margin: 1.8 },
      { name: "Стакан + сарпӯш", supplier: "Оптом", buy: 1.2, margin: 2 },
      { name: "Шир (л)", supplier: "Маҳаллӣ", buy: 9, margin: 1.5 },
    ],
  },
  {
    key: "online",
    niche: "online",
    name: {
      tg: "Фурӯши онлайн (Instagram + расонидан)",
      ru: "Онлайн-продажи (Instagram + доставка)",
      en: "Online selling (Instagram + delivery)",
    },
    minBudget: 2000,
    marginPct: 38,
    turnsPerMonth: 2,
    fixedCostShare: 0.1,
    risk: {
      tg: "Бе реклама фурӯш нест. Баргардонидани мол хароҷот аст.",
      ru: "Без рекламы нет продаж. Возвраты — расход.",
      en: "No ads, no sales. Returns cost money.",
    },
    items: [
      { name: "Моли трендӣ (партия)", supplier: "Оптом / Хитой", buy: 60, margin: 0.5 },
      { name: "Бастабандӣ", supplier: "Оптом", buy: 2, margin: 0 },
      { name: "Реклама (моҳона)", supplier: "Instagram", buy: 300, margin: 0 },
    ],
  },
];

function pickTemplates(input: StartupInput): Template[] {
  const niche = detectNiche(input.goal);
  const byNiche = TEMPLATES.filter((t) => t.niche === niche);
  let picked: Template[];
  if (niche !== "general" && byNiche.length) {
    const affordable = byNiche.filter((t) => t.minBudget <= Math.max(input.budget, 1));
    picked = (affordable.length ? affordable : byNiche).slice(0, 3);
  } else {
    const affordable = TEMPLATES.filter(
      (t) => t.niche !== "phones" && t.minBudget <= Math.max(input.budget, 1),
    );
    picked = (affordable.length ? affordable : TEMPLATES.filter((t) => t.niche === "online")).slice(0, 3);
  }
  return picked;
}

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

function optionFrom(template: Template, input: StartupInput): PlanOption {
  const working = Math.max(input.budget * 0.7, 500);
  const monthlyRevenue = Math.round(working * template.turnsPerMonth * (1 + template.marginPct / 100));
  const grossProfit = monthlyRevenue * (template.marginPct / (100 + template.marginPct));
  const fixedCost = monthlyRevenue * template.fixedCostShare;
  const monthlyProfit = Math.round(grossProfit - fixedCost);
  const breakEven = monthlyProfit > 0 ? Math.max(1, Math.ceil(input.budget / monthlyProfit)) : 0;
  const locale = input.locale;

  const products = template.items.map((item) => {
    const share = working / template.items.length;
    return {
      name: item.name,
      supplier: item.supplier,
      buyPrice: item.buy,
      sellPrice: Math.round(item.buy * (1 + item.margin)),
      quantity: item.buy > 0 ? Math.max(1, Math.floor(share / item.buy)) : 1,
    };
  });

  const firstSteps =
    locale === "en"
      ? [
          `Keep ${money(input.budget * 0.3)} as cash reserve, buy stock with the rest.`,
          "Write down every sale from day one — the engine needs real numbers.",
          "Enter 3 competitor prices in the Competitors page this week.",
          "Do not add a second product line before the first one sells out once.",
        ]
      : locale === "ru"
        ? [
            `Оставьте ${money(input.budget * 0.3)} в резерве, остальное — в товар.`,
            "С первого дня записывайте каждую продажу — движку нужны реальные цифры.",
            "На этой неделе внесите 3 цены конкурентов в раздел «Конкуренты».",
            "Не добавляйте вторую линейку, пока первая не продалась один раз полностью.",
          ]
        : [
            `${money(input.budget * 0.3)}-ро ҳамчун захира нигоҳ доред, боқӣ — ба мол.`,
            "Аз рӯзи аввал ҳар фурӯшро нависед — муҳаррик рақами воқеӣ мехоҳад.",
            "Ин ҳафта 3 нархи рақибро дар бахши «Рақибон» ворид кунед.",
            "То он даме ки моли аввал як бор тамом нашавад, хати дуюм наандозед.",
          ];

  const why =
    locale === "en"
      ? `Fits a ${money(input.budget)} budget in ${input.city}. Typical margin ${template.marginPct}%, stock turns ~${template.turnsPerMonth}×/month.`
      : locale === "ru"
        ? `Подходит под бюджет ${money(input.budget)} в ${input.city}. Типичная маржа ${template.marginPct}%, оборот ~${template.turnsPerMonth}×/мес.`
        : `Ба буҷаи ${money(input.budget)} дар ${input.city} мувофиқ аст. Маржаи маъмулӣ ${template.marginPct}%, гардиш ~${template.turnsPerMonth}×/моҳ.`;

  return {
    name: template.name[locale],
    why,
    startupCost: Math.round(input.budget),
    monthlyRevenue,
    monthlyProfit,
    breakEvenMonths: breakEven,
    risk: template.risk[locale],
    firstSteps,
    products,
  };
}

export function planLocally(input: StartupInput): StartupPlan {
  const options = pickTemplates(input).map((t) => optionFrom(t, input));
  const locale = input.locale;
  const label = nicheLabel(detectNiche(input.goal), locale);
  const summary =
    locale === "en"
      ? `You asked for «${input.goal || label}». With ${money(input.budget)} in ${input.city} these options stay in that niche. Numbers are a model, not measured market data.`
      : locale === "ru"
        ? `Вы написали «${input.goal || label}». С ${money(input.budget)} в ${input.city} варианты в этом направлении. Цифры — модель, не замеры рынка.`
        : `Шумо «${input.goal || label}» навиштед. Бо ${money(input.budget)} дар ${input.city} вариантҳо ҳамин самтанд. Рақамҳо модел аст, на ченкунии бозор.`;
  const warnings =
    locale === "en"
      ? [
          "These are forecasts, not guaranteed profit.",
          "Verify supplier prices at Korvon/Sultoni Kabir yourself before buying.",
          "Rent, tax and transport in your district can change the result by 20–40%.",
        ]
      : locale === "ru"
        ? [
            "Это прогноз, а не гарантия прибыли.",
            "Цены поставщиков на Корвоне / Султони Кабир проверьте сами перед закупкой.",
            "Аренда, налог и транспорт в вашем районе меняют результат на 20–40%.",
          ]
        : [
            "Ин пешгӯӣ аст, на кафолати фоида.",
            "Нархи таъминкунандаро дар Корвон / Султони Кабир пеш аз харид худатон санҷед.",
            "Иҷора, андоз ва нақлиёти маҳаллаи шумо натиҷаро 20–40% тағйир медиҳад.",
          ];
  return { summary, options, warnings };
}

function buildPrompt(input: StartupInput): string {
  const niche = detectNiche(input.goal);
  return [
    `Budget: ${input.budget} TJS. City: ${input.city}, Tajikistan.`,
    `What the person wants (follow exactly): ${input.goal || "not specified"}.`,
    `Detected niche: ${niche}. All 3 options MUST stay in this niche.`,
    niche !== "phones"
      ? "Do not propose a phone, laptop or gadget shop unless the owner asked for that."
      : "",
    `Experience: ${input.experience || "none"}. Time available: ${input.hoursPerWeek} hours/week.`,
    "Return JSON only, no prose outside JSON.",
    'Shape: {"summary":"","warnings":["",""],"options":[{"name":"","why":"","startupCost":0,"monthlyRevenue":0,"monthlyProfit":0,"breakEvenMonths":0,"risk":"","firstSteps":["",""],"products":[{"name":"","supplier":"","buyPrice":0,"sellPrice":0,"quantity":0}]}]}',
    "Exactly 3 options. All money in TJS. startupCost must fit the budget.",
    "Suppliers must be realistic for Tajikistan (Korvon market, Sultoni Kabir, local wholesale, China/Turkey import, Kyrgyz Dordoi).",
    "Be conservative: subtract rent, transport, spoilage and tax from monthlyProfit.",
    "Never promise guaranteed profit. No motivational filler. Numbers and steps only.",
  ]
    .filter(Boolean)
    .join("\n");
}

function toOption(raw: unknown, fallback: PlanOption): PlanOption {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, d: number): number =>
    typeof v === "number" && Number.isFinite(v) ? Math.round(v) : d;
  const strList = (v: unknown, d: string[]): string[] =>
    Array.isArray(v) && v.length ? v.map((x) => String(x)).slice(0, 6) : d;
  const products = Array.isArray(o.products)
    ? o.products.slice(0, 8).map((p) => {
        const item = (p ?? {}) as Record<string, unknown>;
        return {
          name: String(item.name ?? ""),
          supplier: String(item.supplier ?? ""),
          buyPrice: num(item.buyPrice, 0),
          sellPrice: num(item.sellPrice, 0),
          quantity: num(item.quantity, 0),
        };
      })
    : fallback.products;
  return {
    name: String(o.name || fallback.name),
    why: String(o.why || fallback.why),
    startupCost: num(o.startupCost, fallback.startupCost),
    monthlyRevenue: num(o.monthlyRevenue, fallback.monthlyRevenue),
    monthlyProfit: num(o.monthlyProfit, fallback.monthlyProfit),
    breakEvenMonths: num(o.breakEvenMonths, fallback.breakEvenMonths),
    risk: String(o.risk || fallback.risk),
    firstSteps: strList(o.firstSteps, fallback.firstSteps),
    products: products.filter((p) => p.name),
  };
}

export async function planStartup(
  input: StartupInput,
): Promise<StartupPlan & { usedAi: boolean }> {
  const local = planLocally(input);
  try {
    const text = await completeClaude(
      businessSystemPrompt({
        locale: input.locale,
        jsonOnly: true,
        ownerFocus: input.goal,
        ownerMessage: input.goal,
        role: "You plan a first shop or stall for someone who may have no business yet. Follow their written niche only.",
        format:
          "Conservative. startupCost must fit the budget. Subtract rent, transport, spoilage and a tax buffer from monthlyProfit. Exactly 3 options in the owner's niche.",
      }),
      buildPrompt(input),
    );
    const raw = extractJsonObject(text) as Record<string, unknown>;
    const rawOptions = Array.isArray(raw.options) ? raw.options : [];
    const options = rawOptions
      .slice(0, 3)
      .map((o, i) => toOption(o, local.options[i] ?? local.options[0]));
    return {
      summary: String(raw.summary || local.summary),
      warnings: Array.isArray(raw.warnings) && raw.warnings.length
        ? raw.warnings.map((w) => String(w)).slice(0, 5)
        : local.warnings,
      options: options.length ? options : local.options,
      usedAi: true,
    };
  } catch (error) {
    console.warn("[startup.plan] fallback", error);
    return { ...local, usedAi: false };
  }
}
