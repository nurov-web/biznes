import type { BusinessType } from "@/constants";
import type { Locale } from "@/lib/locale-query";

export const NICHES = [
  "cars",
  "phones",
  "clothes",
  "food",
  "construction",
  "agriculture",
  "education",
  "it",
  "repair",
  "online",
  "service",
  "general",
] as const;

export type NicheId = (typeof NICHES)[number];

const RULES: { id: NicheId; keys: string[] }[] = [
  {
    id: "cars",
    keys: [
      "мошин",
      "машин",
      "авто",
      "автомобил",
      "запчаст",
      "шина",
      "покрышк",
      "диски",
      "мотор",
      "автомойк",
      "детейл",
      "такси",
      "car",
      "auto part",
      "tyre",
      "tire",
    ],
  },
  {
    id: "phones",
    keys: [
      "телефон",
      "смартфон",
      "iphone",
      "redmi",
      "гаджет",
      "powerbank",
      "наушник",
      "airpods",
      "ноутбук",
      "laptop",
      "phone",
      "gadget",
    ],
  },
  {
    id: "clothes",
    keys: ["либос", "одежд", "пойафзол", "обув", "cloth", "shoe", "куртка"],
  },
  {
    id: "food",
    keys: ["хӯрок", "еда", "кафе", "кофе", "қаҳва", "food", "coffee", "ресторан", "оши"],
  },
  {
    id: "construction",
    keys: ["сохтмон", "цемент", "масолеҳ", "строи", "cement", "construction"],
  },
  {
    id: "agriculture",
    keys: ["кишоварз", "тухм", "agricult", "ферма", "чорво"],
  },
  {
    id: "education",
    keys: ["курс", "мактаб", "таълим", "educat", "репетитор"],
  },
  {
    id: "it",
    keys: ["сомона", "сайт", "it ", "программ", "разработ"],
  },
  {
    id: "repair",
    keys: ["таъмир", "ремонт", "repair", "сервис"],
  },
  {
    id: "online",
    keys: ["онлайн", "online", "инстаграм", "instagram", "доставк"],
  },
  {
    id: "service",
    keys: ["хизмат", "услуг", "service"],
  },
];

/** Аз матни соҳибкор самтро мефаҳмем — на аз default-и телефон. */
export function detectNiche(...parts: Array<string | undefined | null>): NicheId {
  const text = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ")
    .toLowerCase();
  if (!text) return "general";
  for (const rule of RULES) {
    if (rule.keys.some((key) => text.includes(key))) return rule.id;
  }
  return "general";
}

export function nicheLabel(id: NicheId, locale: Locale): string {
  const pack: Record<NicheId, Record<Locale, string>> = {
    cars: { tg: "мошин / запчаст", ru: "авто / запчасти", en: "cars / parts" },
    phones: { tg: "телефон ва гаҷет", ru: "телефоны и гаджеты", en: "phones and gadgets" },
    clothes: { tg: "либос", ru: "одежда", en: "clothing" },
    food: { tg: "хӯрок / қаҳва", ru: "еда / кофе", en: "food / coffee" },
    construction: { tg: "сохтмон", ru: "стройка", en: "construction" },
    agriculture: { tg: "кишоварзӣ", ru: "сельское хозяйство", en: "agriculture" },
    education: { tg: "таълим", ru: "обучение", en: "education" },
    it: { tg: "IT / сомона", ru: "IT / сайт", en: "IT / websites" },
    repair: { tg: "таъмир", ru: "ремонт", en: "repair" },
    online: { tg: "фурӯши онлайн", ru: "онлайн-продажи", en: "online sales" },
    service: { tg: "хизмат", ru: "услуги", en: "services" },
    general: { tg: "савдои хурд", ru: "малая торговля", en: "small trade" },
  };
  return pack[id][locale];
}

export function businessTypeForNiche(id: NicheId): BusinessType {
  if (id === "repair" || id === "service" || id === "education" || id === "it") return "service";
  if (id === "construction") return "construction";
  if (id === "agriculture") return "agriculture";
  return "trade";
}

export function ownerFocusText(parts: {
  goal?: string;
  typeNote?: string;
  name?: string;
}): string {
  return [parts.goal, parts.typeNote, parts.name]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s))
    .join(" · ");
}

const PHONE_MARK = /телефон|iphone|redmi|xiaomi|powerbank|ноутбук|lenovo|airpods|наушник|кабел type|смартфон|gadget|laptop/i;
const CAR_MARK = /мошин|авто|шин[аые]|запчаст|мотор|равған|масло|тормоз|фильтр|детейл|car|tyre|tire/i;

/** SKU-и бегонаро (телефон ба ҷои мошин) аз ҷавоби AI мепартоем. */
export function skuFitsNiche(name: string, category: string, niche: NicheId): boolean {
  const blob = `${name} ${category}`;
  if (niche === "cars") return !PHONE_MARK.test(blob);
  if (niche === "phones") return !CAR_MARK.test(blob) || PHONE_MARK.test(blob);
  if (niche === "food") return !PHONE_MARK.test(blob) && !CAR_MARK.test(blob);
  if (niche === "clothes") return !PHONE_MARK.test(blob) && !CAR_MARK.test(blob);
  if (niche === "construction") return !PHONE_MARK.test(blob);
  return true;
}
