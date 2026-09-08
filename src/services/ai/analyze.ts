import { LOW_STOCK_THRESHOLD } from "@/constants";
import type { AdviceCard, AiAnalysisPayload } from "@/types";

type ProductSnap = {
  category: string;
  brand: string;
  model: string;
  buyPriceMin: number;
  buyPriceMax: number;
  sellPriceMin: number;
  sellPriceMax: number;
  quantity: number;
};

type Context = {
  locale: "tg" | "ru" | "en";
  city: string;
  type: string;
  name: string;
  competitors: string;
  audience: string;
  products: ProductSnap[];
};

function card(
  level: AdviceCard["level"],
  title: string,
  detail: string,
  action: string,
): AdviceCard {
  return { level, title, detail, action };
}

function money(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} TJS`;
}

/** Локальный анализ без Claude — прогноз, не гарантия. */
export function analyzeLocal(ctx: Context): AiAnalysisPayload {
  const ru = ctx.locale !== "tg";
  const products = ctx.products;
  const priceAdvice: AdviceCard[] = products.slice(0, 8).map((p) => {
    const buy = (p.buyPriceMin + p.buyPriceMax) / 2;
    const sell = (p.sellPriceMin + p.sellPriceMax) / 2;
    const margin = buy > 0 ? ((sell - buy) / buy) * 100 : 0;
    const recMin = Math.round(buy * 1.18);
    const recMax = Math.round(buy * 1.32);
    return card(
      margin >= 20 ? "green" : margin >= 12 ? "yellow" : "red",
      `${p.brand} ${p.model}`,
      ru
        ? `Маржа ~${Math.round(margin)}%. Рекомендуемая цена: ${money(recMin)}–${money(recMax)}. Конкуренты в ${ctx.city}: уточните на somon.tj.`
        : `Маржа ~${Math.round(margin)}%. Нархи тавсия: ${money(recMin)}–${money(recMax)}. Рақибон дар ${ctx.city}: дар somon.tj тасдиқ кунед.`,
      ru
        ? `Поставьте витрину на ${money((recMin + recMax) / 2)} и сравните с 2 конкурентами.`
        : `Нархи витринаро ${money((recMin + recMax) / 2)} гузоред ва бо 2 рақиб муқоиса кунед.`,
    );
  });

  const slow = products.filter((p) => p.quantity > 10);
  const low = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);
  const inventoryAdvice: AdviceCard[] = [
    card(
      low.length ? "yellow" : "green",
      ru ? "Запас" : "Захира",
      low.length
        ? ru
          ? `${low.length} SKU почти закончились.`
          : `${low.length} SKU қариб тамом шуд.`
        : ru
          ? "Критичного дефицита нет."
          : "Камбудии критикӣ нест.",
      ru ? "Докупите ходовые позиции до нуля." : "Молҳои зудфурӯшро то сифр нагузоред.",
    ),
    card(
      slow.length ? "yellow" : "green",
      ru ? "Оборот" : "Гардиш",
      slow.length
        ? ru
          ? `${slow[0].brand} ${slow[0].model}: много на складе — капитал может быть «заморожен».`
          : `${slow[0].brand} ${slow[0].model}: дар анбор зиёд аст — пул метавонад «банд» шавад.`
        : ru
          ? "Остатки выглядят умеренно."
          : "Боқимондаҳо мӯътадил менамоянд.",
      ru
        ? "Не закупайте медленные SKU, пока не уйдёт 40% остатка."
        : "SKU-и сустро то фурӯши 40% боқимонда нахаред.",
    ),
  ];

  const growthAdvice: AdviceCard[] = [
    card(
      "green",
      ru ? "Пакеты" : "Пакетҳо",
      ru
        ? "Свяжите ходовой товар с аксессуаром высокой маржи."
        : "Моли зудфурӯшро бо лавозимоти маржааш баланд пайваст кунед.",
      ru
        ? "Соберите 2 комплекта «товар + аксессуар» на этой неделе."
        : "Ин ҳафта 2 комплект «мол + лавозимот» созед.",
    ),
    card(
      "green",
      ru ? "Аудитория" : "Аудитория",
      ctx.audience
        ? ru
          ? `Фокус: ${ctx.audience}.`
          : `Диққат: ${ctx.audience}.`
        : ru
          ? "Укажите, кто ваш клиент — совет будет точнее."
          : "Мизоҷи асосиро нависед — маслиҳат дақиқтар мешавад.",
      ru
        ? "Сделайте одно объявление под эту аудиторию."
        : "Барои ҳамин аудитория як эълон созед.",
    ),
  ];

  const risks: AdviceCard[] = [
    card(
      products.length === 0 ? "red" : "yellow",
      ru ? "Данные рынка" : "Маълумоти бозор",
      ru
        ? `Цены somon.tj / olx.tj в MVP не парсятся автоматически. Конкуренты: ${ctx.competitors || "не указаны"}.`
        : `Нархҳои somon.tj / olx.tj дар MVP худкор гирифта намешаванд. Рақибон: ${ctx.competitors || "нишон дода нашудаанд"}.`,
      ru
        ? "Раз в неделю запишите 3 цены конкурентов вручную."
        : "Ҳар ҳафта 3 нархи рақибро дастӣ нависед.",
    ),
  ];

  return {
    priceAdvice,
    inventoryAdvice,
    growthAdvice,
    risks,
    dailyTip: ru
      ? `Сегодня: проверьте витрину ${ctx.name} в ${ctx.city} и снизьте цену только на 1 медленный SKU на 3%. Это прогноз, не гарантия.`
      : `Имрӯз: витринаи ${ctx.name}-ро дар ${ctx.city} санҷед ва нархи 1 SKU-и сустро 3% паст кунед. Ин пешгӯӣ аст, на кафолат.`,
    summary: ru
      ? `Анализ «${ctx.name}» (${ctx.type}) в ${ctx.city}: ${products.length} позиций. Рекомендации ниже — ориентир.`
      : `Таҳлили «${ctx.name}» (${ctx.type}) дар ${ctx.city}: ${products.length} мол. Тавсияҳо дар поён — самти кор.`,
  };
}

export function buildAnalyzePrompt(ctx: Context): string {
  const lang = ctx.locale === "en" ? "English" : ctx.locale === "ru" ? "Russian" : "Tajik";
  return [
    `You are BusinessPilot AI for Tajikistan shop owners.`,
    `Reply with JSON only. Human strings in ${lang}.`,
    `Business: ${ctx.name}, type ${ctx.type}, city ${ctx.city}.`,
    `Competitors: ${ctx.competitors}. Audience: ${ctx.audience}.`,
    `Products: ${JSON.stringify(ctx.products).slice(0, 5000)}`,
    `Shape: { "priceAdvice":[{"level":"green"|"yellow"|"red","title":"","detail":"","action":""}], "inventoryAdvice":[...], "growthAdvice":[...], "risks":[...], "dailyTip":"", "summary":"" }`,
    `Each advice: short → example with numbers in TJS → one action. Never guarantee profit. Do not claim live scrape of somon.tj unless data was provided.`,
  ].join("\n");
}

export function mergeAi(local: AiAnalysisPayload, raw: unknown): AiAnalysisPayload {
  if (!raw || typeof raw !== "object") return local;
  const o = raw as Partial<AiAnalysisPayload>;
  const list = (v: unknown, fallback: AdviceCard[]): AdviceCard[] =>
    Array.isArray(v) && v.length
      ? v.map((item) => {
          const c = item as AdviceCard;
          const level =
            c.level === "green" || c.level === "yellow" || c.level === "red"
              ? c.level
              : "yellow";
          return {
            level,
            title: String(c.title || ""),
            detail: String(c.detail || ""),
            action: String(c.action || ""),
          };
        })
      : fallback;
  return {
    priceAdvice: list(o.priceAdvice, local.priceAdvice),
    inventoryAdvice: list(o.inventoryAdvice, local.inventoryAdvice),
    growthAdvice: list(o.growthAdvice, local.growthAdvice),
    risks: list(o.risks, local.risks),
    dailyTip: String(o.dailyTip || local.dailyTip),
    summary: String(o.summary || local.summary),
  };
}
