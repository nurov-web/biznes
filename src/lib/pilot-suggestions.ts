import { hasMixedScript } from "@/lib/tajik-text";
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

/** Матни дарозро ба қадамҳои кӯтоҳ ҷудо мекунад. */
export function splitToSteps(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  const numbered = raw
    .split(/\s*(?:\d+\s*[.)]\s+|[-–]\s+)/)
    .map((part) => part.trim())
    .filter((part) => part.length > 8);
  if (numbered.length >= 2) return numbered.slice(0, 4);
  const sentences = raw
    .split(/(?<=[.!?؟])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (sentences.length >= 2) return sentences.slice(0, 4);
  return [raw];
}

export function suggestionSteps(item: PilotSuggestionItem): string[] {
  const listed = (item.steps ?? []).map((row) => row.trim()).filter(Boolean);
  if (listed.length > 0) return listed.slice(0, 4);
  return splitToSteps(item.description);
}

/** Як ҷумлаи кӯтоҳ барои экран. */
export function shortLine(text: string, max = 90): string {
  const raw = text.trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const first = raw.split(/(?<=[.!?؟])\s+/)[0] ?? raw;
  if (first.length <= max) return first;
  return `${first.slice(0, max - 1).trim()}…`;
}

/** Қолаби кӯҳна бе қадамҳои кор — бояд аз нав ҳисоб шавад. */
export function needsBetterSteps(items: PilotSuggestionItem[]): boolean {
  if (items.length === 0) return true;
  return items.some((row) => suggestionSteps(row).length < 2);
}

/** Кортҳои бо ду алифбо (бе SSD/HDD ва калимаҳои худи соҳиб) — танҳо дастӣ «Аз нав». */
export function needsCleanText(items: PilotSuggestionItem[], ownWords: string[] = []): boolean {
  return items.some((row) => {
    const mixed = hasMixedScript([row.title, row.description, ...(row.steps ?? [])].join(" "), ownWords);
    return mixed;
  });
}
