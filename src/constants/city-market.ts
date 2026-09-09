/**
 * Досьеҳои шаҳр — дониши маҳсулот, на парсинги эълонҳо.
 * Рақамҳо ориентир барои модели пешгӯӣ ҳастанд.
 */
import type { MarketBrief, MarketSkuHint } from "@/types";
import type { Locale } from "@/lib/locale-query";

type CityId = "dushanbe" | "khujand" | "bokhtar" | "kulob" | "other";

export function cityId(city: string): CityId {
  const n = city.toLowerCase();
  if (n.includes("душан") || n.includes("dushan")) return "dushanbe";
  if (n.includes("хуҷанд") || n.includes("худжанд") || n.includes("khujand")) return "khujand";
  if (n.includes("бохтар") || n.includes("bokhtar") || n.includes("қурғон")) return "bokhtar";
  if (n.includes("кӯлоб") || n.includes("кулоб") || n.includes("kulob")) return "kulob";
  return "other";
}

const TRADE_SKUS: Record<CityId, MarketSkuHint[]> = {
  dushanbe: [
    {
      name: "Xiaomi Redmi Note",
      category: "Телефон",
      typicalBuy: 1650,
      typicalSell: 2050,
      verdict: "good",
      why: "Дар Душанбе гардиш баланд аст, агар захира аз 2 ҳафта зиёд нашавад.",
    },
    {
      name: "Powerbank 10000",
      category: "Лавозимот",
      typicalBuy: 95,
      typicalSell: 135,
      verdict: "good",
      why: "Маржа хуб, хавфи кӯҳнашавӣ кам — барои Корвон/бозор мувофиқ.",
    },
    {
      name: "Lenovo IdeaPad 3",
      category: "Ноутбук",
      typicalBuy: 4300,
      typicalSell: 5200,
      verdict: "watch",
      why: "Талабот ҳаст, вале рақобат ва хавфи моли бефурӯш баланд аст.",
    },
    {
      name: "AirPods-клон",
      category: "Лавозимот",
      typicalBuy: 45,
      typicalSell: 90,
      verdict: "avoid",
      why: "Нархи паст ҷанг мешавад, бозгашт зиёд, брендро вайрон мекунад.",
    },
  ],
  khujand: [
    {
      name: "Кабел Type-C",
      category: "Лавозимот",
      typicalBuy: 11,
      typicalSell: 18,
      verdict: "good",
      why: "Гардиши зуд, хароҷоти интиқол аз Душанберо дар нарх ҳисоб кунед.",
    },
    {
      name: "Xiaomi Redmi",
      category: "Телефон",
      typicalBuy: 1600,
      typicalSell: 1980,
      verdict: "watch",
      why: "Бозори дуюм хурдтар аст — миқдори калон хавфнок.",
    },
  ],
  bokhtar: [
    {
      name: "Шишаи муҳофизатӣ",
      category: "Лавозимот",
      typicalBuy: 6,
      typicalSell: 15,
      verdict: "good",
      why: "Нархи пасти вуруд, талаботи рӯзмарра.",
    },
  ],
  kulob: [
    {
      name: "Наушники TWS",
      category: "Лавозимот",
      typicalBuy: 120,
      typicalSell: 170,
      verdict: "watch",
      why: "Талабот ҳаст, аммо қудрати харид пасттар аз пойтахт.",
    },
  ],
  other: [
    {
      name: "Моли гардишдор",
      category: "Умумӣ",
      typicalBuy: 50,
      typicalSell: 75,
      verdict: "watch",
      why: "Аввал 3 SKU-и зудфурӯш, баъд васеъ кунед.",
    },
  ],
};

function copy(
  locale: Locale,
  packs: Record<Locale, string>,
): string {
  return packs[locale];
}

/** Барои ҷустуҷӯи веби Claude — шаҳри тоҷикиро ба макони ҷустуҷӯ мегардонем. */
export function citySearchLocation(city: string): {
  type: "approximate";
  city: string;
  country: "TJ";
  timezone: "Asia/Dushanbe";
} {
  const id = cityId(city);
  const names: Record<CityId, string> = {
    dushanbe: "Dushanbe",
    khujand: "Khujand",
    bokhtar: "Bokhtar",
    kulob: "Kulob",
    other: city.trim() || "Dushanbe",
  };
  return {
    type: "approximate",
    city: names[id],
    country: "TJ",
    timezone: "Asia/Dushanbe",
  };
}

export function localMarketBrief(city: string, type: string, locale: Locale): MarketBrief {
  const id = cityId(city);
  const prices = type === "trade" || type === "other" ? TRADE_SKUS[id] : TRADE_SKUS.other.slice(0, 2);
  const climate: MarketBrief["climate"] =
    id === "dushanbe" ? "mixed" : id === "khujand" ? "mixed" : "hard";

  return {
    city,
    type,
    climate,
    summary: copy(locale, {
      tg:
        id === "dushanbe"
          ? "Душанбе бозори калонтарин аст: талабот ҳаст, иҷора ва рақобат ҳам баланд. Корвон барои оптом, марказҳо барои нархҳои витрина."
          : id === "khujand"
            ? "Хуҷанд бозори дуюм аст. Интиқол аз Душанбе ва савдо бо ҳамсояҳо нархро ҳаракат медиҳад."
            : "Бозор хурдтар аст. Аввал гардиши зуд, на моли гарон.",
      ru:
        id === "dushanbe"
          ? "Душанбе — самый большой рынок: спрос есть, аренда и конкуренция высокие. Корвон для опта, ТЦ для витрины."
          : id === "khujand"
            ? "Худжанд — второй рынок. Доставка из Душанбе и приграничная торговля двигают цену."
            : "Рынок меньше. Сначала быстрый оборот, не дорогой сток.",
      en:
        id === "dushanbe"
          ? "Dushanbe is the largest market: demand exists, rent and competition are high. Korvon for wholesale, malls for shelf price."
          : id === "khujand"
            ? "Khujand is the second market. Freight from Dushanbe and cross-border trade move prices."
            : "Smaller market. Start with fast-turn SKUs, not expensive stock.",
    }),
    demand: copy(locale, {
      tg: "Телефон, лавозимот ва хӯроквории рӯзмарра устувортаранд аз электроникаи гарон.",
      ru: "Телефоны, аксессуары и повседневные продукты устойчивее дорогой электроники.",
      en: "Phones, accessories and daily goods are more stable than expensive electronics.",
    }),
    prices,
    products: prices.filter((p) => p.verdict !== "avoid").map((p) => p.name),
    risks: [
      copy(locale, {
        tg: "Нархи зиндаи Somon/OLX кашида намешавад — рақамҳои рақибро худатон нависед.",
        ru: "Живые цены Somon/OLX не считываются — цены конкурентов вводите сами.",
        en: "Live Somon/OLX prices are not scraped — enter competitor prices yourself.",
      }),
      copy(locale, {
        tg: "Иҷора ва интиқол аксар вақт маржаи коғазиро мехӯранд.",
        ru: "Аренда и доставка часто съедают бумажную маржу.",
        en: "Rent and freight often eat paper margin.",
      }),
    ],
    opportunities: [
      copy(locale, {
        tg: "SKU-ҳои арзон бо гардиши зуд хазинаро гарм нигоҳ медоранд.",
        ru: "Дешёвые SKU с быстрым оборотом держат кассу живой.",
        en: "Cheap fast-turn SKUs keep cash moving.",
      }),
    ],
    usedAi: false,
    usedWeb: false,
    disclaimer: copy(locale, {
      tg: "Пешгӯӣ аз модели шаҳр ва дониши умумӣ. Нархҳои зиндаи бозор кашида нашудаанд. Кафолати фоида нест.",
      ru: "Прогноз модели города и общих знаний. Живые цены площадок не сняты. Это не гарантия прибыли.",
      en: "City-model forecast and public knowledge. Live marketplace prices are not scraped. Not a profit guarantee.",
    }),
  };
}
