/**
 * Досьеҳои шаҳр — дониши маҳсулот, на парсинги эълонҳо.
 * Рақамҳо ориентир барои модели пешгӯӣ ҳастанд.
 */
import type { MarketBrief, MarketSkuHint } from "@/types";
import type { Locale } from "@/lib/locale-query";
import { detectNiche, nicheLabel, optionFitsOwnerGoal, type NicheId } from "@/lib/niche";
import { tajikIncludes } from "@/lib/tajik-text";

type CityId = "dushanbe" | "khujand" | "bokhtar" | "kulob" | "other";

export function cityId(city: string): CityId {
  if (tajikIncludes(city, "душанбе") || tajikIncludes(city, "dushanbe")) return "dushanbe";
  if (tajikIncludes(city, "хуҷанд") || tajikIncludes(city, "khujand")) return "khujand";
  if (tajikIncludes(city, "бохтар") || tajikIncludes(city, "bokhtar") || tajikIncludes(city, "қурғон")) {
    return "bokhtar";
  }
  if (tajikIncludes(city, "кӯлоб") || tajikIncludes(city, "kulob")) return "kulob";
  return "other";
}

function sku(
  name: string,
  category: string,
  typicalBuy: number,
  typicalSell: number,
  verdict: MarketSkuHint["verdict"],
  why: string,
): MarketSkuHint {
  return { name, category, typicalBuy, typicalSell, verdict, why };
}

const CITY_PRICE: Record<CityId, number> = {
  dushanbe: 1,
  khujand: 0.95,
  bokhtar: 0.9,
  kulob: 0.9,
  other: 0.88,
};

const NICHE_SKUS: Record<NicheId, MarketSkuHint[]> = {
  cars: [
    sku("Равғани мотор 4л", "Мошин", 85, 125, "good", "Гардиши зуд, харидори такрорӣ. Нархи Корвонро пеш аз харид санҷед."),
    sku("Филтри ҳаво / равған", "Запчаст", 22, 40, "good", "Маржа хуб, ҷои кам мегирад, бо равған якҷоя фурӯхта мешавад."),
    sku("Лавҳаи тормоз", "Запчаст", 140, 220, "watch", "Талабот ҳаст, аммо қалбакӣ зиёд — бренди маълум гиред."),
    sku("Шинаи тобистона", "Мошин", 380, 520, "watch", "Мавсимӣ. Партияи калон пулро банд мекунад."),
    sku("Мошини коркардшуда", "Мошин", 25000, 32000, "avoid", "Барои буҷаи хурд нест: ҳуҷҷат, таъмир ва фурӯши суст хазинаро мекӯшад."),
  ],
  phones: [
    sku("Xiaomi Redmi Note", "Телефон", 1650, 2050, "good", "Гардиш баланд аст, агар захира аз 2 ҳафта зиёд нашавад."),
    sku("Powerbank 10000", "Лавозимот", 95, 135, "good", "Маржа хуб, хавфи кӯҳнашавӣ кам."),
    sku("Кабел Type-C", "Лавозимот", 12, 20, "good", "Гардиши зуд, хароҷоти интиқолро дар нарх ҳисоб кунед."),
    sku("AirPods-клон", "Лавозимот", 45, 90, "avoid", "Нархи паст ҷанг мешавад, бозгашт зиёд."),
  ],
  clothes: [
    sku("Футболка", "Либос", 45, 75, "good", "Нархи пасти вуруд, андозаҳоро кам нигоҳ доред."),
    sku("Кроссовка", "Пойафзол", 180, 270, "watch", "Андозаи нофурӯхта пулро банд мекунад."),
    sku("Курткаи мавсимӣ", "Либос", 220, 340, "watch", "Берун аз мавсим фурӯш қатъ мешавад."),
  ],
  food: [
    sku("Себ (кг)", "Мева", 4, 7, "good", "Гардиши зуд. Вайроншавиро ҳисоб кунед, на танҳо нархи харид."),
    sku("Ангур / меваи мавсимӣ (кг)", "Мева", 6, 10, "good", "Мавсимӣ. Партияи калон пулро банд мекунад."),
    sku("Сабзавоти рӯз (кг)", "Сабзавот", 3, 5, "good", "Ҳар рӯз харида мешавад, агар тоза бошад."),
    sku("Қаҳва (дона, кг)", "Хӯрок", 190, 520, "good", "Маржа баланд, агар ҷой ва ҷараёни одамон бошад."),
    sku("Нони рӯз", "Хӯрок", 3, 5, "good", "Гардиши ҳаррӯза, бе tajribаи калон."),
    sku("Шир / нӯшокӣ", "Хӯрок", 9, 14, "watch", "Муддати кӯтоҳ — хароҷоти вайроншавӣ ҳисоб кунед."),
  ],
  construction: [
    sku("Семент 50кг", "Масолеҳ", 48, 62, "good", "Талаботи мавсимӣ, интиқол қимат аст."),
    sku("Арматура", "Масолеҳ", 55, 72, "watch", "Нарх бо қурб меҷунбад, захираи зиёд хавфнок."),
  ],
  agriculture: [
    sku("Тухмии сабзавот", "Кишоварзӣ", 18, 35, "good", "Мавсими баҳор — пеш аз кишт харид кунед."),
    sku("Хӯроки чорво", "Кишоварзӣ", 40, 55, "watch", "Вазн ва интиқол маржаро мехӯрад."),
  ],
  education: [
    sku("Курси 1 моҳ", "Таълим", 60, 280, "good", "Хароҷоти асосӣ вақти устод аст, на мол."),
    sku("Дафтар / мавод", "Таълим", 8, 15, "good", "Фурӯши иловагӣ ҳангоми сабти ном."),
  ],
  it: [
    sku("Лендинг", "IT", 900, 2800, "good", "Як лоиҳаи хурд — пешпардохт гиред."),
    sku("Нигоҳдории моҳона", "IT", 200, 600, "good", "Даромади такрорӣ, агар 2–3 муштарӣ дошта бошед."),
  ],
  repair: [
    sku("Ивази экран / қисм", "Таъмир", 120, 260, "good", "Маржа аз маҳорат, на аз мол. Бе устод даромад нест."),
    sku("Ташхис", "Таъмир", 20, 50, "good", "Хизмати арзон муштарӣ меорад."),
  ],
  online: [
    sku("Моли трендӣ (партия)", "Онлайн", 60, 95, "watch", "Бе реклама фурӯш нест. Баргашт хароҷот аст."),
    sku("Бастабандӣ + расонидан", "Онлайн", 5, 12, "good", "Нархро дар нархи фурӯш пинҳон накунед."),
  ],
  service: [
    sku("Хизмати асосӣ", "Хизмат", 40, 120, "good", "Вақти худро нархгузорӣ кунед, на танҳо мавод."),
    sku("Маводи масрафӣ", "Хизмат", 15, 28, "watch", "Захираи зиёди мавод пулро банд мекунад."),
  ],
  general: [
    sku("Моли гардишдор", "Умумӣ", 50, 75, "watch", "Аввал 3 SKU-и зудфурӯш, баъд васеъ кунед."),
  ],
};

function scalePrices(rows: MarketSkuHint[], city: CityId): MarketSkuHint[] {
  const k = CITY_PRICE[city];
  return rows.map((row) => ({
    ...row,
    typicalBuy: Math.round(row.typicalBuy * k),
    typicalSell: Math.round(row.typicalSell * k),
  }));
}

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

function demandFor(niche: NicheId, locale: Locale): string {
  const packs: Record<NicheId, Record<Locale, string>> = {
    cars: {
      tg: "Дар Тоҷикистон талабот ба равған, филтр ва запчасти арзон устувор аст. Фурӯши худи мошин сармояи калон ва ҳуҷҷат мехоҳад.",
      ru: "В Таджикистане устойчив спрос на масло, фильтры и недорогие запчасти. Продажа самих машин требует большого капитала и документов.",
      en: "Oil, filters and cheap parts stay in demand. Selling cars themselves needs heavy capital and paperwork.",
    },
    phones: {
      tg: "Телефон ва лавозимот гардиши зуд доранд, агар захира кӯтоҳ бошад.",
      ru: "Телефоны и аксессуары быстро оборачиваются, если запас короткий.",
      en: "Phones and accessories turn fast if stock stays short.",
    },
    clothes: {
      tg: "Либос мавсимӣ аст — андозаи нофурӯхта пулро банд мекунад.",
      ru: "Одежда сезонна — непроданный размер замораживает деньги.",
      en: "Clothing is seasonal — unsold sizes freeze cash.",
    },
    food: {
      tg: "Хӯроки рӯзмарра устувор аст, агар ҷой ва тозагӣ бошад. Хароҷоти вайроншавӣ ҳисоб кунед.",
      ru: "Повседневная еда устойчива при локации и чистоте. Считайте порчу.",
      en: "Daily food is stable with location and hygiene. Count spoilage.",
    },
    construction: {
      tg: "Масолеҳ ба мавсим ва лоиҳаҳо вобаста аст. Интиқол қисми нарх аст.",
      ru: "Материалы зависят от сезона и объектов. Доставка — часть цены.",
      en: "Materials follow season and sites. Freight is part of the price.",
    },
    agriculture: {
      tg: "Кишоварзӣ мавсимӣ аст — пеш аз кишт харид кунед.",
      ru: "Сельское хозяйство сезонно — закупайте до посева.",
      en: "Agriculture is seasonal — buy before planting.",
    },
    education: {
      tg: "Курсҳо пеш аз мавсими мактаб ва имтиҳонҳо талабот мегиранд.",
      ru: "Курсы оживают перед школьным сезоном и экзаменами.",
      en: "Courses pick up before school season and exams.",
    },
    it: {
      tg: "Лоиҳаи хурд бо пешпардохт хавфро кам мекунад.",
      ru: "Малый проект с предоплатой снижает риск.",
      en: "A small prepaid project cuts risk.",
    },
    repair: {
      tg: "Таъмир аз маҳорати устод вобаста аст, на аз анбор.",
      ru: "Ремонт зависит от мастера, не от склада.",
      en: "Repair depends on the technician, not the warehouse.",
    },
    online: {
      tg: "Бе реклама фурӯши онлайн суст аст. Баргашт хароҷот аст.",
      ru: "Без рекламы онлайн-продажи слабые. Возвраты — расход.",
      en: "Without ads, online sales stay weak. Returns cost money.",
    },
    service: {
      tg: "Хизмат вақти шумост — нархро аз соат ҳисоб кунед.",
      ru: "Услуга — это ваше время. Считайте час.",
      en: "A service is your time. Price the hour.",
    },
    general: {
      tg: "Аввал 3 SKU-и зудфурӯш, баъд васеъ кунед. Самтро худатон нависед.",
      ru: "Сначала 3 быстрых SKU, потом расширение. Напишите своё направление.",
      en: "Start with 3 fast SKUs, then expand. Write your own direction.",
    },
  };
  return packs[niche][locale];
}

export function localMarketBrief(
  city: string,
  type: string,
  locale: Locale,
  goal?: string,
): MarketBrief {
  const id = cityId(city);
  const climate: MarketBrief["climate"] =
    id === "dushanbe" ? "mixed" : id === "khujand" ? "mixed" : "hard";
  const ownerNiche = detectNiche(goal);
  const niche = ownerNiche !== "general" ? ownerNiche : detectNiche(goal, type);
  const canned = scalePrices(NICHE_SKUS[niche], id);
  const named = goal?.trim().slice(0, 80) ?? "";
  const own =
    named.length > 0
      ? sku(
          named,
          nicheLabel(niche, locale),
          8,
          14,
          "good",
          copy(locale, {
            tg: `Ин моли шумост («${named}»). Нархи харидро бо роҳ худатон нависед — ин ориентир аст, на нарх аз бозор.`,
            ru: `Это ваш товар («${named}»). Цену закупа с дорогой впишите сами — это ориентир, не цена с рынка.`,
            en: `This is your goods («${named}»). Enter buy + freight yourself — this is an orienter, not a live market price.`,
          }),
        )
      : null;
  const rest = named ? canned.filter((row) => optionFitsOwnerGoal(named, `${row.name} ${row.category}`)) : canned;
  const prices = own ? [own, ...rest].slice(0, 6) : rest;
  const label = named || nicheLabel(niche, locale);

  return {
    city,
    type,
    climate,
    summary: copy(locale, {
      tg:
        id === "dushanbe"
          ? `Душанбе: бозори «${label}» калон аст, иҷора ва рақобат ҳам баланд. Корвон/опт барои харид, на барои нусхаи телефон агар самти шумо дигар бошад.`
          : id === "khujand"
            ? `Хуҷанд: бозори «${label}» хурдтар аст. Интиқол аз Душанбе нархро ҳаракат медиҳад.`
            : `Бозори «${label}» хурдтар аст. Аввал гардиши зуд, на моли гарон.`,
      ru:
        id === "dushanbe"
          ? `Душанбе: рынок «${label}» большой, аренда и конкуренция высокие. Опт на Корвоне — не подставляйте телефоны, если вы про другое.`
          : id === "khujand"
            ? `Худжанд: рынок «${label}» меньше. Доставка из Душанбе двигает цену.`
            : `Рынок «${label}» меньше. Сначала быстрый оборот, не дорогой сток.`,
      en:
        id === "dushanbe"
          ? `Dushanbe: the «${label}» market is large; rent and competition are high. Wholesale at Korvon — do not switch to phones unless that is the shop.`
          : id === "khujand"
            ? `Khujand: the «${label}» market is smaller. Freight from Dushanbe moves price.`
            : `The «${label}» market is smaller. Start with fast-turn SKUs, not expensive stock.`,
    }),
    demand: demandFor(niche, locale),
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
