import type { PilotDifficulty, PilotSuggestionItem } from "@/lib/store";
import { parseLocale } from "@/lib/locale-query";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { completeClaude, extractJsonArray } from "@/services/ai/claude";

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/\s/g, ""));
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function difficultyOf(raw: unknown): PilotDifficulty {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("осон") || s.includes("easy") || s === "1") return "easy";
  if (s.includes("душвор") || s.includes("hard") || s.includes("difficult") || s === "3") return "hard";
  return "medium";
}

function itemFromUnknown(raw: unknown, fallbackTitle: string): PilotSuggestionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const title = String(row.title ?? row.name ?? "").trim() || fallbackTitle;
  const description = String(row.description ?? "").trim();
  if (!description) return null;
  return {
    title: title.slice(0, 80),
    description: description.slice(0, 280),
    difficulty: difficultyOf(row.difficulty),
    potentialSomoni: Math.max(0, num(row.potential_somoni ?? row.monthly_income ?? row.potentialSomoni, 400)),
  };
}

function parseItems(text: string, fallbackTitle: string): PilotSuggestionItem[] {
  const parsed = extractJsonArray(text);
  const items = parsed
    .map((row) => itemFromUnknown(row, fallbackTitle))
    .filter((row): row is PilotSuggestionItem => row !== null);
  return items.slice(0, 4);
}

function fallbackFor(product: string, region: string): PilotSuggestionItem[] {
  const who = product.trim() || "маҳсулот";
  const where = region.trim() || "шаҳри шумо";
  return [
    {
      title: `${who} ба яклухт`,
      description: `3 харидори яклухтро дар ${where} пайдо кунед ва ҳафтае як бор пешниҳод фиристед.`,
      difficulty: "easy",
      potentialSomoni: 600,
    },
    {
      title: "Нархи баста",
      description: `${who}-ро дар бастаи 3–5 воҳид бо нархи равшан фурӯшед — харидор бештар мегирад.`,
      difficulty: "easy",
      potentialSomoni: 400,
    },
    {
      title: "Канали Telegram",
      description: `Рӯзе як акс ва нарх дар Telegram/Instagram — харидорони ${where} шуморо мебинанд.`,
      difficulty: "medium",
      potentialSomoni: 800,
    },
    {
      title: "Харидори доимӣ",
      description: `5 харидори такрориро бо рақам нависед ва ҳар ҳафта хабар диҳед, ки ${who} омода аст.`,
      difficulty: "medium",
      potentialSomoni: 500,
    },
  ];
}

export async function analyzeBusinessSuggestions(input: {
  locale: string;
  category: string;
  product: string;
  region: string;
  volume: string;
  price: string;
  channels: string[];
  problem: string;
}): Promise<PilotSuggestionItem[]> {
  const fallback = fallbackFor(input.product, input.region);
  try {
    const text = await completeClaude(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: "You return exactly 4 practical next moves for this owner as a JSON array.",
        jsonOnly: true,
        ownerFocus: input.product,
        format: [
          "Array of 4 objects.",
          'Each: {"title":"max 6 words","description":"one sentence","difficulty":"осон"|"миёна"|"душвор","potential_somoni":number}',
          "Numbers are estimates in TJS per month, labelled as model in the description if needed — but the JSON field is the number only.",
        ].join("\n"),
      }),
      [
        `Соҳа: ${input.category}`,
        `Маҳсулот: ${input.product}`,
        `Минтақа: ${input.region}`,
        `Ҳаҷм: ${input.volume}`,
        `Нарх: ${input.price}`,
        `Каналҳо: ${input.channels.join(", ") || "зикр нашуд"}`,
        `Мушкил: ${input.problem || "зикр нашуд"}`,
      ].join("\n"),
      { timeoutMs: 22000, maxTokens: 1200 },
    );
    const items = parseItems(text, input.product);
    return items.length >= 2 ? items : fallback;
  } catch {
    return fallback;
  }
}

export async function generateStartIdeas(input: {
  locale: string;
  interests: string[];
  budget: number;
  time: string;
  skills: string;
  region: string;
}): Promise<PilotSuggestionItem[]> {
  const fallback = fallbackFor(input.interests[0] || "бизнес", input.region);
  try {
    const text = await completeClaude(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: "You return exactly 4 realistic start-up ideas as a JSON array.",
        jsonOnly: true,
        ownerFocus: input.interests.join(", "),
        format: [
          "Array of 4 objects.",
          'Each: {"name":"...","startup_cost":number,"monthly_income":number,"difficulty":1|2|3,"description":"one sentence"}',
          `startup_cost must stay within about the owner's budget ${input.budget} TJS.`,
        ].join("\n"),
      }),
      [
        `Манфиатҳо: ${input.interests.join(", ")}`,
        `Буҷет: ${input.budget} сомонӣ`,
        `Вақт: ${input.time}`,
        `Малака: ${input.skills || "зикр нашуд"}`,
        `Минтақа: ${input.region}`,
      ].join("\n"),
      { timeoutMs: 22000, maxTokens: 1200 },
    );
    const parsed = extractJsonArray(text);
    const items = parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const rec = row as Record<string, unknown>;
        return itemFromUnknown(
          {
            title: rec.name ?? rec.title,
            description: rec.description,
            difficulty: rec.difficulty,
            potential_somoni: rec.monthly_income ?? rec.potential_somoni,
          },
          input.interests[0] || "бизнес",
        );
      })
      .filter((row): row is PilotSuggestionItem => row !== null)
      .slice(0, 4);
    return items.length >= 2 ? items : fallback;
  } catch {
    return fallback;
  }
}

export async function generateSalesPlan(input: {
  locale: string;
  product: string;
  region: string;
  volume: string;
  price: string;
}): Promise<string> {
  try {
    return await completeClaude(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: "Write a short sales plan: 3–4 steps. Each step: title + 2–3 concrete actions. End with a simple TJS calculation. No markdown.",
        ownerFocus: input.product,
      }),
      [
        `Маҳсулот: ${input.product}`,
        `Минтақа: ${input.region}`,
        `Ҳаҷм: ${input.volume}`,
        `Нархи ҳозира: ${input.price} сомонӣ`,
      ].join("\n"),
      { timeoutMs: 22000, maxTokens: 1500 },
    );
  } catch {
    return [
      `1. Харидор дар ${input.region}`,
      `Рӯйхати 10 харидори ${input.product}-ро нависед. Ҳар рӯз ба 3 нафар занг занед ё паём диҳед.`,
      "",
      "2. Пешниҳоди равшан",
      `Нарх: ${input.price || "—"} сомонӣ. Як баста ва як нарх барои яклухт нависед.`,
      "",
      "3. Такрор",
      "Харидори харидаро ҳар ҳафта хабар диҳед. Ин арзонтар аз ҷустуҷӯи нав аст.",
      "",
      `Ҳисоб: ${input.volume || "ҳаҷм"} × ${input.price || "нарх"} сомонӣ — ин нуқтаи имрӯз аст. Ҳар харидори нав ин рақамро зиёд мекунад.`,
    ].join("\n");
  }
}
