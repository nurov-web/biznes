import type { BusinessType } from "@/constants";
import type { ProductDraft } from "@/types";

export type CatalogSuggestion = ProductDraft & { label: string };

/** Пешниҳодҳои каталог аз рӯи намуди бизнес — мисли Shopify/Stripe onboarding. */
export const CATALOG_SUGGESTIONS: Record<BusinessType, CatalogSuggestion[]> = {
  trade: [
    {
      label: "Asus VivoBook 15",
      category: "Ноутбук",
      brand: "Asus",
      model: "VivoBook 15",
      buyPriceMin: 2500,
      buyPriceMax: 3000,
      sellPriceMin: 3200,
      sellPriceMax: 3800,
      quantity: 15,
      condition: "new",
    },
    {
      label: "Lenovo IdeaPad",
      category: "Ноутбук",
      brand: "Lenovo",
      model: "IdeaPad 3",
      buyPriceMin: 2200,
      buyPriceMax: 2700,
      sellPriceMin: 2900,
      sellPriceMax: 3400,
      quantity: 10,
      condition: "new",
    },
    {
      label: "Kingston SSD 1TB",
      category: "Лавозимот",
      brand: "Kingston",
      model: "SSD 1TB",
      buyPriceMin: 420,
      buyPriceMax: 480,
      sellPriceMin: 590,
      sellPriceMax: 650,
      quantity: 20,
      condition: "new",
    },
    {
      label: "Xiaomi Redmi",
      category: "Телефон",
      brand: "Xiaomi",
      model: "Redmi Note",
      buyPriceMin: 1400,
      buyPriceMax: 1800,
      sellPriceMin: 1750,
      sellPriceMax: 2100,
      quantity: 12,
      condition: "new",
    },
  ],
  service: [
    {
      label: "Таъмири телефон",
      category: "Хизмат",
      brand: "Маҳаллӣ",
      model: "Ивази экран",
      buyPriceMin: 80,
      buyPriceMax: 150,
      sellPriceMin: 180,
      sellPriceMax: 280,
      quantity: 30,
      condition: "new",
    },
  ],
  production: [
    {
      label: "Маҳсулоти тайёр",
      category: "Истеҳсолот",
      brand: "Худӣ",
      model: "Партияи асосӣ",
      buyPriceMin: 40,
      buyPriceMax: 70,
      sellPriceMin: 90,
      sellPriceMax: 130,
      quantity: 100,
      condition: "new",
    },
  ],
  construction: [
    {
      label: "Семент",
      category: "Масолеҳ",
      brand: "Маҳаллӣ",
      model: "Харита 50кг",
      buyPriceMin: 45,
      buyPriceMax: 55,
      sellPriceMin: 58,
      sellPriceMax: 68,
      quantity: 200,
      condition: "new",
    },
  ],
  it: [
    {
      label: "Сомонаи ширкат",
      category: "Хизмат",
      brand: "Студия",
      model: "Лендинг",
      buyPriceMin: 800,
      buyPriceMax: 1500,
      sellPriceMin: 2500,
      sellPriceMax: 4500,
      quantity: 5,
      condition: "new",
    },
  ],
  education: [
    {
      label: "Курси асосӣ",
      category: "Курс",
      brand: "Марказ",
      model: "1 моҳ",
      buyPriceMin: 50,
      buyPriceMax: 80,
      sellPriceMin: 250,
      sellPriceMax: 400,
      quantity: 40,
      condition: "new",
    },
  ],
  agriculture: [
    {
      label: "Тухмӣ",
      category: "Кишоварзӣ",
      brand: "Маҳаллӣ",
      model: "Бастаи стандарт",
      buyPriceMin: 15,
      buyPriceMax: 25,
      sellPriceMin: 30,
      sellPriceMax: 45,
      quantity: 80,
      condition: "new",
    },
  ],
  other: [
    {
      label: "Моли асосӣ",
      category: "Умумӣ",
      brand: "Маҳаллӣ",
      model: "SKU-1",
      buyPriceMin: 20,
      buyPriceMax: 40,
      sellPriceMin: 45,
      sellPriceMax: 70,
      quantity: 25,
      condition: "new",
    },
  ],
};

export function catalogFor(type: BusinessType, typeNote?: string): CatalogSuggestion[] {
  const note = typeNote?.trim();
  if (note) {
    return [
      {
        label: note.slice(0, 80),
        category: note.slice(0, 40),
        brand: "Маҳаллӣ",
        model: note.slice(0, 120),
        buyPriceMin: 8,
        buyPriceMax: 14,
        sellPriceMin: 14,
        sellPriceMax: 22,
        quantity: 20,
        condition: "new",
      },
    ];
  }
  return CATALOG_SUGGESTIONS[type] ?? CATALOG_SUGGESTIONS.other;
}

export function emptyProduct(): ProductDraft {
  return {
    category: "",
    brand: "",
    model: "",
    buyPriceMin: 0,
    buyPriceMax: 0,
    sellPriceMin: 0,
    sellPriceMax: 0,
    quantity: 0,
    condition: "new",
  };
}

export const CATEGORY_HINTS = [
  "Мева",
  "Сабзавот",
  "Хӯрокворӣ",
  "Либос",
  "Мошин",
  "Запчаст",
  "Ноутбук",
  "Телефон",
  "Лавозимот",
  "Монитор",
  "Масолеҳ",
  "Хизмат",
];
