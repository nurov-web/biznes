import type { PilotSuggestionItem } from "@/lib/store";

const OLD_FAKE = [400, 500, 600, 800];

/** Қолаби кӯҳна (+400/500/600/800) — на аз нархи соҳиб. */
export function looksLikeCannedSuggestions(items: PilotSuggestionItem[]): boolean {
  if (items.length === 0) return true;
  const amounts = items
    .map((row) => row.potentialSomoni)
    .sort((a, b) => a - b);
  const fakeAmounts =
    amounts.length === 4 && amounts.every((value, index) => value === (OLD_FAKE[index] ?? -1));
  const fakeTitles = items.some((row) => {
    const title = row.title.trim().toLowerCase();
    return title === "канали telegram" || title === "харидори доимӣ";
  });
  return fakeAmounts || fakeTitles;
}
