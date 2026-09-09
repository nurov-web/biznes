/**
 * Нақшаи оғози бизнес барои корбароне, ки ҳанӯз бизнес надоранд.
 * Claude + модели маҳаллӣ ҳамчун захира. Ҳамеша пешгӯӣ, на кафолат.
 */
import type { PlanOption } from "@/lib/store";
import type { Locale } from "@/lib/locale-query";
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
  name: Record<Locale, string>;
  minBudget: number;
  marginPct: number;
  turnsPerMonth: number;
  fixedCostShare: number;
  risk: Record<Locale, string>;
  items: { name: string; supplier: string; buy: number; margin: number }[];
  match: string[];
};

const TEMPLATES: Template[] = [
  {
    key: "accessories",
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
    match: ["телефон", "аксессуар", "лавозимот", "phone", "accessor", "гаджет"],
  },
  {
    key: "repair",
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
    match: ["таъмир", "ремонт", "repair", "сервис", "service"],
  },
  {
    key: "clothes",
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
    match: ["либос", "одежд", "cloth", "обув", "пойафзол", "shoe"],
  },
  {
    key: "food",
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
    match: ["кофе", "қаҳва", "хӯрок", "еда", "food", "coffee", "кафе"],
  },
  {
    key: "online",
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
    match: ["онлайн", "online", "инстаграм", "instagram", "доставк", "интернет"],
  },
];

function pickTemplates(input: StartupInput): Template[] {
  const goal = input.goal.toLowerCase();
  const affordable = TEMPLATES.filter((t) => t.minBudget <= Math.max(input.budget, 1));
  const pool = affordable.length ? affordable : [TEMPLATES[4], TEMPLATES[0]];
  const matched = pool.filter((t) => t.match.some((m) => goal.includes(m)));
  const rest = pool.filter((t) => !matched.includes(t));
  return [...matched, ...rest].slice(0, 3);
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
  const summary =
    locale === "en"
      ? `With ${money(input.budget)} in ${input.city} these three directions are realistic. Numbers are a model based on typical local margins, not measured market data.`
      : locale === "ru"
        ? `С ${money(input.budget)} в ${input.city} реалистичны эти три направления. Цифры — модель по типичной местной марже, не замеры рынка.`
        : `Бо ${money(input.budget)} дар ${input.city} ин се самт воқеӣ аст. Рақамҳо модел аз рӯи маржаи маъмулии маҳаллӣ мебошанд, на ченкунии бозор.`;
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
  return [
    `Budget: ${input.budget} TJS. City: ${input.city}, Tajikistan.`,
    `What the person wants: ${input.goal || "not specified"}.`,
    `Experience: ${input.experience || "none"}. Time available: ${input.hoursPerWeek} hours/week.`,
    "Return JSON only, no prose outside JSON.",
    'Shape: {"summary":"","warnings":["",""],"options":[{"name":"","why":"","startupCost":0,"monthlyRevenue":0,"monthlyProfit":0,"breakEvenMonths":0,"risk":"","firstSteps":["",""],"products":[{"name":"","supplier":"","buyPrice":0,"sellPrice":0,"quantity":0}]}]}',
    "Exactly 3 options. All money in TJS. startupCost must fit the budget.",
    "Suppliers must be realistic for Tajikistan (Korvon market, Sultoni Kabir, local wholesale, China/Turkey import, Kyrgyz Dordoi).",
    "Be conservative: subtract rent, transport, spoilage and tax from monthlyProfit.",
    "Never promise guaranteed profit. No motivational filler. Numbers and steps only.",
  ].join("\n");
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
        role: "You plan a first shop or stall for someone who may have no business yet.",
        format:
          "Conservative. startupCost must fit the budget. Subtract rent, transport, spoilage and a tax buffer from monthlyProfit. Exactly 3 options.",
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
