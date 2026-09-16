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

export function serviceFallback(
  product: string,
  region: string,
  price = "",
  volume = "",
): PilotSuggestionItem[] {
  const who = product.trim() || "хизмат";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархи шумо";
  const ex = extras(volume, price);
  return [
    {
      title: `Вақти қабул — ${who}`,
      description: `Дар ${where} мизоҷ мехоҳад дархост зуд ҷавоб гирад.`,
      steps: [
        "Имрӯз: соатҳои корро дар Instagram/Telegram нависед.",
        `Нархи як кор: ${priceText} сомонӣ — як ҷумла.`,
        "Ҳар дархост — сана ва ном дар CRM.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[0] ?? 0,
    },
    {
      title: "3 харидори аввал",
      description: `Пеш аз реклама — ${who} барои 3 нафери шинос.`,
      steps: [
        `10 ном дар ${where} нависед.`,
        "Имрӯз ба 3 нафар занг — нарх ва вақт гӯед.",
        "Кор анҷом шуд — дар молия сабт кунед.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[1] ?? 0,
    },
    {
      title: "Пешакӣ ё пас аз кор",
      description: "Қарори пул — камтар баҳс, зиёдтар кор.",
      steps: [
        "Қоида нависед: 50% пешакӣ ё пурра пас аз кор.",
        `Ба харидори нав ${who} — ҳамин қоида.`,
        "Дар чек/дафтар қайд кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[2] ?? 0,
    },
    {
      title: "Харидори такрорӣ",
      description: `Корҳои ${who} одатан такрор мешаванд.`,
      steps: [
        "5 мизоҷи қаблӣ — рӯйхат.",
        "Ҳафтаи оянда: «вақт доред?» — паём.",
        "Навбатро дар дафтар нигоҳ доред.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[3] ?? 0,
    },
  ];
}

export const SERVICE_PROMPT_RULES = [
  "This is a SERVICE business (repair, salon, delivery). Focus on booking time, clear price per job, deposit rules, repeat clients.",
].join(" ");
