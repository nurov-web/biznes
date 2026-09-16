import type { PilotSuggestionItem } from "@/lib/store";
import { monthlyRevenue } from "@/lib/pilot-volume";

function extras(volume: string, price: string): number[] {
  const turnover = monthlyRevenue(volume, price);
  if (turnover <= 0) return [0, 0, 0, 0];
  return [0.04, 0.05, 0.06, 0.07].map((part) => {
    const value = Math.round(turnover * part);
    return value >= 50 ? value : 0;
  });
}

/** Телефон / компютер — гарантия, маржа, хизмат. */
export function techFallback(
  product: string,
  region: string,
  price = "",
  volume = "",
): PilotSuggestionItem[] {
  const who = product.trim() || "техника";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархи шумо";
  const ex = extras(volume, price);
  return [
    {
      title: `Гарантияи ${who} — равшан`,
      description: `Дар ${where} харидор пеш аз харид мепурсад: чанд моҳ кафолат?`,
      steps: [
        "Имрӯз: кафолатро дар варақаи 1 саҳифа нависед (моҳ, хизмат).",
        `Ба 3 харидори нав нишон диҳед: ${who} бо ҳамин кафолат.`,
        "Ҳар фурӯш: рақами серия ва сана дар дафтар.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[0] ?? 0,
    },
    {
      title: "Маржа — харид ва фурӯш",
      description: `Бе ҳисоби маржа ${who} фоида намедиҳад.`,
      steps: [
        `Нархи харид ва фурӯшро нависед (фурӯш ${priceText} сомонӣ).`,
        `Агар маржа <15% — модели дигари ${who} интихоб кунед.`,
        "Имрӯз дар касса як фурӯш сабт кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[1] ?? 0,
    },
    {
      title: "Хизмати пас аз фурӯш",
      description: `Насб, таъмир ё ивазкунии ${who} — сабаби баргаштани мизоҷ.`,
      steps: [
        `Рӯйхати 5 кори оддӣ барои ${who} (насб, тозакунӣ).`,
        `Ба харидори қаблӣ дар ${where} занг: «кор лозим аст?»`,
        "Нархи хизматро алоҳида нависед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[2] ?? 0,
    },
    {
      title: "Комплект ва иловага",
      description: `Кабел, қофия, ҳифз — бо ${who} якҷоя фурӯш меравад.`,
      steps: [
        "3 иловагаи зарурро дар анбор гиред.",
        `Пешниҳод: «${who} + иловага» — нархи якҷоя.`,
        "Дар POS ҳамчун як чек сабт кунед.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[3] ?? 0,
    },
  ];
}

export const TECH_PROMPT_RULES = [
  "This is PHONES / COMPUTERS / GADGETS trade or repair. Focus on warranty, margin, service after sale, accessories.",
  "Never suggest fruit spoilage or bakery packaging as main advice.",
  "Mention warranty months, buy vs sell price, or setup service.",
].join(" ");
