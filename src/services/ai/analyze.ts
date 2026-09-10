import { LOW_STOCK_THRESHOLD } from "@/constants";
import type { AdviceCard, AiAnalysisPayload } from "@/types";
import type { Locale } from "@/lib/locale-query";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { wrapOwnerMessage } from "@/lib/tajik-text";

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
  locale: Locale;
  city: string;
  type: string;
  name: string;
  typeNote?: string;
  goal?: string;
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

function t(locale: Locale, ru: string, tg: string, en: string): string {
  if (locale === "en") return en;
  return locale === "ru" ? ru : tg;
}

/** Таҳлили маҳаллӣ бе Claude — пешгӯӣ, на кафолат. */
export function analyzeLocal(ctx: Context): AiAnalysisPayload {
  const products = ctx.products;
  const priceAdvice: AdviceCard[] = products.slice(0, 8).map((p) => {
    const buy = (p.buyPriceMin + p.buyPriceMax) / 2;
    const freight = buy * 0.08;
    const trueCost = buy + freight;
    const sell = (p.sellPriceMin + p.sellPriceMax) / 2;
    const margin = trueCost > 0 ? ((sell - trueCost) / trueCost) * 100 : 0;
    const recMin = Math.round(trueCost * 1.18);
    const recMax = Math.round(trueCost * 1.28);
    const mid = Math.round((recMin + recMax) / 2);
    return card(
      margin >= 20 ? "green" : margin >= 12 ? "yellow" : "red",
      `${p.brand} ${p.model}`,
      t(
        ctx.locale,
        `Себестоимость ~${money(trueCost)} (закуп + доставка 8%). Маржа с текущей витрины ~${Math.round(margin)}%. Рекомендуемая витрина ${money(recMin)}–${money(recMax)}.`,
        `Арзиши воқеӣ ~${money(trueCost)} (харид + доставка 8%). Маржа бо витринаи ҳозира ~${Math.round(margin)}%. Витринаи тавсия ${money(recMin)}–${money(recMax)}.`,
        `True cost ~${money(trueCost)} (buy + 8% freight). Margin vs current shelf ~${Math.round(margin)}%. Suggested shelf ${money(recMin)}–${money(recMax)}.`,
      ),
      t(
        ctx.locale,
        `Поставьте витрину на ${money(mid)} и внесите 2 цены конкурентов вручную.`,
        `Нархи витринаро ${money(mid)} гузоред ва 2 нархи рақибро дастӣ нависед.`,
        `Set the shelf at ${money(mid)} and type in 2 competitor prices by hand.`,
      ),
    );
  });

  const slow = products.filter((p) => p.quantity > 10);
  const low = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);
  const inventoryAdvice: AdviceCard[] = [
    card(
      low.length ? "yellow" : "green",
      t(ctx.locale, "Запас", "Захира", "Stock"),
      low.length
        ? t(
            ctx.locale,
            `${low.length} SKU почти закончились — риск упущенной выручки.`,
            `${low.length} SKU қариб тамом шуд — хатари даромади аз даст.`,
            `${low.length} SKU almost empty — stock-out risk.`,
          )
        : t(
            ctx.locale,
            "Критичного дефицита нет.",
            "Камбудии критикӣ нест.",
            "No critical stock-out.",
          ),
      t(
        ctx.locale,
        "Докупите только ходовые SKU до нуля, медленные не трогайте.",
        "Танҳо молҳои зудфурӯшро то сифр нагузоред, сустро нахаред.",
        "Restock movers before zero. Do not restock slow SKUs.",
      ),
    ),
    card(
      slow.length ? "yellow" : "green",
      t(ctx.locale, "Оборот", "Гардиш", "Turns"),
      slow.length
        ? t(
            ctx.locale,
            `${slow[0].brand} ${slow[0].model}: много на складе — капитал может быть заморожен.`,
            `${slow[0].brand} ${slow[0].model}: дар анбор зиёд аст — пул метавонад банд шавад.`,
            `${slow[0].brand} ${slow[0].model}: heavy stock — cash may be frozen.`,
          )
        : t(
            ctx.locale,
            "Остатки выглядят умеренно.",
            "Боқимондаҳо мӯътадил менамоянд.",
            "Stock looks moderate.",
          ),
      t(
        ctx.locale,
        "Не закупайте медленные SKU, пока не уйдёт 40% остатка.",
        "SKU-и сустро то фурӯши 40% боқимонда нахаред.",
        "Do not buy slow SKUs until 40% of stock has sold.",
      ),
    ),
  ];

  const growthAdvice: AdviceCard[] = [
    card(
      "green",
      t(ctx.locale, "Пакеты", "Пакетҳо", "Bundles"),
      t(
        ctx.locale,
        "Свяжите ходовой товар с аксессуаром высокой маржи — это поднимает средний чек без демпинга витрины.",
        "Моли зудфурӯшро бо лавозимоти маржааш баланд пайваст кунед — чеки миёна мебарояд бе паст кардани витрина.",
        "Bundle a mover with a high-margin accessory to lift ticket size without dumping the shelf.",
      ),
      t(
        ctx.locale,
        "Соберите 2 комплекта «товар + аксессуар» на этой неделе.",
        "Ин ҳафта 2 комплект «мол + лавозимот» созед.",
        "Build 2 bundles (item + accessory) this week.",
      ),
    ),
    card(
      "green",
      t(ctx.locale, "Аудитория", "Аудитория", "Audience"),
      ctx.audience
        ? t(ctx.locale, `Фокус: ${ctx.audience}.`, `Диққат: ${ctx.audience}.`, `Focus: ${ctx.audience}.`)
        : t(
            ctx.locale,
            "Укажите, кто ваш клиент — совет будет точнее.",
            "Мизоҷи асосиро нависед — маслиҳат дақиқтар мешавад.",
            "Name the customer — advice gets sharper.",
          ),
      t(
        ctx.locale,
        "Сделайте одно объявление под эту аудиторию.",
        "Барои ҳамин аудитория як эълон созед.",
        "Make one ad for that audience.",
      ),
    ),
  ];

  const risks: AdviceCard[] = [
    card(
      products.length === 0 ? "red" : "yellow",
      t(ctx.locale, "Данные рынка", "Маълумоти бозор", "Market data"),
      t(
        ctx.locale,
        `Живые цены маркетплейсов не снимаются. Конкуренты в карточке: ${ctx.competitors || "не указаны"}. Без 3 цен совет по витрине общий.`,
        `Нархҳои зиндаи бозор гирифта намешаванд. Рақибон: ${ctx.competitors || "нишон дода нашудаанд"}. Бе 3 нарх маслиҳати витрина умумӣ аст.`,
        `Live marketplace prices are not scraped. Competitors on file: ${ctx.competitors || "none"}. Without 3 prices, shelf advice stays generic.`,
      ),
      t(
        ctx.locale,
        "Раз в неделю запишите 3 цены конкурентов вручную или CSV.",
        "Ҳар ҳафта 3 нархи рақибро дастӣ ё CSV нависед.",
        "Once a week enter 3 competitor prices by hand or CSV.",
      ),
    ),
  ];

  return {
    priceAdvice,
    inventoryAdvice,
    growthAdvice,
    risks,
    dailyTip: t(
      ctx.locale,
      `Сегодня: проверьте витрину «${ctx.name}» в ${ctx.city} и снизьте цену только на 1 медленный SKU не больше чем на 3%. Прогноз, не гарантия.`,
      `Имрӯз: витринаи «${ctx.name}»-ро дар ${ctx.city} санҷед ва нархи 1 SKU-и сустро на зиёда аз 3% паст кунед. Пешгӯӣ, на кафолат.`,
      `Today: check the shelf of «${ctx.name}» in ${ctx.city} and cut only 1 slow SKU by at most 3%. Forecast, not a guarantee.`,
    ),
    summary: t(
      ctx.locale,
      `Анализ «${ctx.name}» (${ctx.type}) в ${ctx.city}: ${products.length} позиций. Рекомендации ниже — ориентир.`,
      `Таҳлили «${ctx.name}» (${ctx.type}) дар ${ctx.city}: ${products.length} мол. Тавсияҳо дар поён — самти кор.`,
      `Analysis of «${ctx.name}» (${ctx.type}) in ${ctx.city}: ${products.length} SKUs. Guidance below is a model.`,
    ),
  };
}

export function buildAnalyzePrompt(ctx: Context): string {
  return [
    businessSystemPrompt({
      locale: ctx.locale,
      jsonOnly: true,
      format:
        'Shape: { "priceAdvice":[{"level":"green"|"yellow"|"red","title":"","detail":"","action":""}], "inventoryAdvice":[...], "growthAdvice":[...], "risks":[...], "dailyTip":"", "summary":"" }. Each advice: short → TJS → one action.',
    }),
    `Business: ${ctx.name}, type ${ctx.type}, city ${ctx.city}.`,
    wrapOwnerMessage(ctx.goal || ctx.typeNote || "not specified"),
    "Stay on this niche. Do not switch to phones unless they asked.",
    `Competitors (owner text): ${ctx.competitors || "none"}. Audience: ${ctx.audience || "none"}.`,
    `Products: ${JSON.stringify(ctx.products).slice(0, 5000)}`,
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
