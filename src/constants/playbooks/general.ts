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

/** Савдои умумӣ — ҳангоми нишаи муайян набошад. */
export function generalFallback(
  product: string,
  region: string,
  price = "",
  volume = "",
): PilotSuggestionItem[] {
  const who = product.trim() || "маҳсулот";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархе, ки шумо навиштед";
  const ex = extras(volume, price);
  return [
    {
      title: `3 харидори ${who}`,
      description: `Яклухт дар ${where}. Нарх ${priceText} сомонӣ.`,
      steps: [
        `10 ном дар ${where} нависед.`,
        `Имрӯз ба 3 нафар занг: нарх ${priceText} сомонӣ.`,
        "Харидро дар касса сабт кунед.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[0] ?? 0,
    },
    {
      title: `${who} — пешниҳоди равшан`,
      description: `Як нарх, як ҷумла — то напурсанд «чанд?».`,
      steps: [
        `Нарх ${priceText} сомонӣ нависед.`,
        `Ба 5 нафар дар ${where} паём кунед.`,
        "Ҳафтаро ҳисоб кунед: рафт ё не.",
      ],
      difficulty: "easy",
      potentialSomoni: ex[1] ?? 0,
    },
    {
      title: "Ҳар рӯз як кор",
      description: `Ҳамон канал. ${who} дар ${where}.`,
      steps: [
        "Телефон, бозор ё Telegram — якро гиред.",
        `Рӯзе як бор нарх ${priceText} сомонӣ гӯед.`,
        "Пас аз 7 рӯз: чанд харид.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[2] ?? 0,
    },
    {
      title: "Харидори кӯҳна",
      description: `Касе ки ${who} харидааст — бори дигар занг.`,
      steps: [
        "5 рақами кӯҳна нависед.",
        "Ҳар ҳафта: мол ҳаст, нарх ҳамон.",
        "Харид шуд — дар POS сабт кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: ex[3] ?? 0,
    },
  ];
}
