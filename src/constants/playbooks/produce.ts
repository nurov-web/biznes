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

/** Мева / хӯрок — фасод, баста, мавсим (на шаблони умумӣ). */
export function produceFallback(
  product: string,
  region: string,
  price = "",
  volume = "",
): PilotSuggestionItem[] {
  const who = product.trim() || "мева";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархи шумо";
  const ex = extras(volume, price);
  return [
    {
      title: `Фасодро кам кунед — ${who}`,
      description: `Мева зуд хароб мешавад; дар ${where} харидор ба сифат эътимод мекунад.`,
      steps: [
        `Имрӯз: ${who}-ро дар ҷои сард нигоҳ доред, на дар офтоб.`,
        `Ба 3 дӯкони ${where} нишон диҳед: кадом баста хуштар мемонад.`,
        "Ҳар рӯз сана нависед: чанд дона партофт.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[0] ?? 0,
    },
    {
      title: `Бастаи ${who} — як нарх`,
      description: `«Чанд дар баста?» — як ҷавоб, нарх ${priceText} сомонӣ.`,
      steps: [
        `Бастаи 2–5 кг нависед. Нарх ${priceText} сомонӣ барои баста.`,
        `5 харидори ${where} — нишон диҳед, на танҳо гӯед.`,
        "Пас аз 7 рӯз: кадом баста зудтар меравад.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[1] ?? 0,
    },
    {
      title: "Мавсим ва нарх",
      description: `Ҳангоми зиёд будани ${who} нарх поин мешавад — пешакӣ қарор гиред.`,
      steps: [
        `Имрӯз дар ${where} аз 3 фурӯшанда нарх пурсед.`,
        `Нависед: ҳадди ақал ${priceText} сомонӣ барои шумо.`,
        "Ҳафтаи оянда: агар арзон шуд, ҳаҷмро кам кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[2] ?? 0,
    },
    {
      title: "Харидори такрорӣ",
      description: `Касе ки ${who} харидааст — ҳар ҳафта хабар диҳед.`,
      steps: [
        "5 рақами кӯҳна аз дафтар гиред.",
        `Паём: «${who} тоза омад — нарх ${priceText} сомонӣ».`,
        "Харид шуд — дар касса сабт кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[3] ?? 0,
    },
  ];
}

export const PRODUCE_PROMPT_RULES = [
  "This is FRESH FOOD / PRODUCE (fruit, vegetables, bread). Focus on spoilage, packaging per kg, seasonality, repeat buyers.",
  "Never suggest phone warranty, SSD, or car parts.",
  "Titles must mention freshness, pack size, or season — not generic «3 buyers» only.",
].join(" ");
