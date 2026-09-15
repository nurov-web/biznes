import type { PilotDifficulty, PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import { parseLocale } from "@/lib/locale-query";
import { monthlyRevenue } from "@/lib/pilot-volume";
import { defaultUnitFor, PILOT_UNITS } from "@/constants/pilot";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { completeAi } from "@/services/ai/complete";
import { extractJsonArray } from "@/services/ai/claude";
import type { ShopPulse } from "@/types/shop-pulse";
import { pulseFacts } from "@/services/shop-pulse";

export type PilotSuggestionBatch = {
  items: PilotSuggestionItem[];
  usedAi: boolean;
};

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

function parseJsonList(text: string): unknown[] {
  try {
    return extractJsonArray(text);
  } catch {
    try {
      const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
      const parsed: unknown = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") {
        const rec = parsed as Record<string, unknown>;
        const inner = rec.items ?? rec.suggestions ?? rec.data;
        if (Array.isArray(inner)) return inner;
      }
    } catch {
      return [];
    }
    return [];
  }
}

/** Рақам танҳо дар доираи ҳисоби соҳиб — бе бозори сохта. */
function clampAmount(n: number, cap: number): number {
  if (cap <= 0 || n <= 0) return 0;
  return Math.min(n, cap);
}

function itemFromUnknown(raw: unknown, fallbackTitle: string, cap: number): PilotSuggestionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const title = String(row.title ?? row.name ?? "").trim() || fallbackTitle;
  const description = String(row.description ?? "").trim() || title;
  if (!title) return null;
  return {
    title: title.slice(0, 80),
    description: description.slice(0, 360),
    difficulty: difficultyOf(row.difficulty),
    potentialSomoni: clampAmount(num(row.potential_somoni ?? row.monthly_income ?? row.potentialSomoni, 0), cap),
  };
}

function parseItems(text: string, fallbackTitle: string, cap: number): PilotSuggestionItem[] {
  return parseJsonList(text)
    .map((row) => itemFromUnknown(row, fallbackTitle, cap))
    .filter((row): row is PilotSuggestionItem => row !== null)
    .slice(0, 4);
}

function extrasFrom(turnover: number): number[] {
  if (turnover <= 0) return [0, 0, 0, 0];
  return [0.04, 0.05, 0.06, 0.07].map((part) => Math.max(50, Math.round(turnover * part)));
}

function fallbackFor(product: string, region: string, price = "", volume = ""): PilotSuggestionItem[] {
  const who = product.trim() || "маҳсулот";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархе, ки шумо навиштед";
  const extras = extrasFrom(monthlyRevenue(volume, price));
  return [
    {
      title: `${who} ба яклухт`,
      description: `3 харидори яклухтро дар ${where} пайдо кунед. Нарх: ${priceText} сомонӣ — ҳамин рақаме, ки шумо навиштед, на нархи бозор.`,
      difficulty: "easy",
      potentialSomoni: extras[0] ?? 0,
    },
    {
      title: "Нархи баста",
      description: `${who}-ро дар бастаи 3–5 воҳид бо нархи ${priceText} сомонӣ фурӯшед. Рақами иловагӣ аз ҳаҷми шумо ҳисоб шуд, на аз интернет.`,
      difficulty: "easy",
      potentialSomoni: extras[1] ?? 0,
    },
    {
      title: "Каналҳои ҳозира",
      description: `Дар каналҳои ки аллакай кор мекунед, рӯзе як пешниҳоди ${who} бо нарх фиристед. Харидорони ${where}.`,
      difficulty: "medium",
      potentialSomoni: extras[2] ?? 0,
    },
    {
      title: "Харидори такрорӣ",
      description: `5 харидори ${who}-ро бо рақам нависед ва ҳар ҳафта хабар диҳед, ки мол омода аст.`,
      difficulty: "medium",
      potentialSomoni: extras[3] ?? 0,
    },
  ];
}

function fallbackStart(interests: string[], region: string, budget: number): PilotSuggestionItem[] {
  const who = interests[0]?.trim() || "кор";
  const where = region.trim() || "шаҳри шумо";
  const extras = extrasFrom(budget);
  return [
    {
      title: `${who} бо буҷети худ`,
      description: `Бо ${budget} сомонӣ дар ${where} як хидмати хурди ${who} оғоз кунед. Бе нархи Somon ва бе кафолати фоида.`,
      difficulty: "easy",
      potentialSomoni: extras[0] ?? 0,
    },
    {
      title: "Як харидори аввал",
      description: `10 нафарро дар ${where} нависед ва аз 3 нафар пурсед, ки ба ${who} ниёз доранд.`,
      difficulty: "easy",
      potentialSomoni: extras[1] ?? 0,
    },
    {
      title: "Нархи равшан",
      description: `Як нарх ва як пешниҳод барои ${who} нависед. Рақам аз буҷети ${budget} сомонӣ аст, на аз бозор.`,
      difficulty: "medium",
      potentialSomoni: extras[2] ?? 0,
    },
    {
      title: "Такрор дар ҳафта",
      description: `Ҳар рӯз як амали фурӯш барои ${who} дар ${where}. Пешбинӣ, на кафолат.`,
      difficulty: "medium",
      potentialSomoni: extras[3] ?? 0,
    },
  ];
}

const HONEST_RULES = [
  "Use ONLY the owner's stated product, city, price, volume, channels, budget, problem, and shop-pulse facts.",
  "Do NOT invent Somon/OLX/Amazon prices, rent, tax, or market size.",
  "If sold/refused/complaints are NOT ON PAGE, say so. Never fill demo numbers (325, 70%, fake ranking).",
  "potential_somoni is a small extra in TJS from owner price × volume (about 4–8% of that turnover). If price or volume is missing, use 0.",
  "Never promise profit. The number is a model from THEIR numbers, not a live market.",
  "Each description: this product + this city + one action they can do this week.",
].join(" ");

export async function analyzeBusinessSuggestions(input: {
  locale: string;
  category: string;
  product: string;
  region: string;
  volume: string;
  price: string;
  channels: string[];
  problem: string;
  pulse?: ShopPulse | null;
}): Promise<PilotSuggestionBatch> {
  const turnover = monthlyRevenue(input.volume, input.price);
  const cap = Math.round(turnover * 0.12);
  const fallback = fallbackFor(input.product, input.region, input.price, input.volume);
  try {
    const text = await completeAi(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: `You return exactly 4 practical next moves as a JSON array. ${HONEST_RULES}`,
        jsonOnly: true,
        ownerFocus: input.product,
        format: [
          "JSON array of 4 objects.",
          '{"title":"max 6 words","description":"one sentence naming this product and city","difficulty":"осон"|"миёна"|"душвор","potential_somoni":number}',
        ].join("\n"),
      }),
      [
        `Соҳа: ${input.category}`,
        `Маҳсулот: ${input.product}`,
        `Минтақа: ${input.region}`,
        `Ҳаҷм (аз соҳиб): ${input.volume}`,
        `Нарх (аз соҳиб): ${input.price} сомонӣ`,
        `Даромади эълоншуда (ҳаҷм×нарх): ${turnover} сомонӣ`,
        `Каналҳо: ${input.channels.join(", ") || "зикр нашуд"}`,
        `Мушкил: ${input.problem || "зикр нашуд"}`,
        pulseFacts(input.pulse ?? null),
      ].join("\n"),
      { timeoutMs: 26000, maxTokens: 1400, json: true },
    );
    const items = parseItems(text, input.product, cap);
    if (items.length >= 2) return { items, usedAi: true };
    return { items: fallback, usedAi: false };
  } catch (error) {
    console.error("[pilot/suggestions]", error instanceof Error ? error.message : "fail");
    return { items: fallback, usedAi: false };
  }
}

export async function generateStartIdeas(input: {
  locale: string;
  interests: string[];
  budget: number;
  time: string;
  skills: string;
  region: string;
}): Promise<PilotSuggestionBatch> {
  const cap = Math.max(0, input.budget);
  const fallback = fallbackStart(input.interests, input.region, input.budget);
  try {
    const text = await completeAi(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: `You return exactly 4 realistic start ideas as a JSON array. ${HONEST_RULES}`,
        jsonOnly: true,
        ownerFocus: input.interests.join(", "),
        format: [
          "JSON array of 4 objects.",
          '{"name":"...","startup_cost":number,"monthly_income":number,"difficulty":1|2|3,"description":"one sentence"}',
          `startup_cost must stay within the owner's budget ${input.budget} TJS. monthly_income is a model from that budget, not a market scrape.`,
        ].join("\n"),
      }),
      [
        `Манфиатҳо: ${input.interests.join(", ")}`,
        `Буҷет: ${input.budget} сомонӣ`,
        `Вақт: ${input.time}`,
        `Малака: ${input.skills || "зикр нашуд"}`,
        `Минтақа: ${input.region}`,
      ].join("\n"),
      { timeoutMs: 26000, maxTokens: 1400, json: true },
    );
    const items = parseJsonList(text)
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
          cap,
        );
      })
      .filter((row): row is PilotSuggestionItem => row !== null)
      .slice(0, 4);
    if (items.length >= 2) return { items, usedAi: true };
    return { items: fallback, usedAi: false };
  } catch (error) {
    console.error("[pilot/ideas]", error instanceof Error ? error.message : "fail");
    return { items: fallback, usedAi: false };
  }
}

export async function generateSalesPlan(input: {
  locale: string;
  category: string;
  product: string;
  region: string;
  volume: string;
  price: string;
  channels: string[];
  problem: string;
  pulse?: ShopPulse | null;
}): Promise<string> {
  try {
    return await completeAi(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        role: [
          "Write a short sales plan: 3–4 steps. Each step: title + 2–3 concrete actions.",
          "Name this owner's product, city and price in the actions — never generic advice.",
          "Use only their numbers and shop-pulse facts. If sold/refused/complaints are NOT ON PAGE, do not invent them. No invented market prices. End with a TJS calculation from volume × price. No markdown.",
        ].join(" "),
        ownerFocus: input.product,
      }),
      [
        `Соҳа: ${input.category}`,
        `Маҳсулот: ${input.product}`,
        `Минтақа: ${input.region}`,
        `Ҳаҷм: ${input.volume}`,
        `Нархи ҳозира: ${input.price} сомонӣ`,
        `Каналҳои ҳозира: ${input.channels.join(", ") || "зикр нашуд"}`,
        `Мушкил: ${input.problem || "зикр нашуд"}`,
        `Ҳисоби соҳиб: ${monthlyRevenue(input.volume, input.price)} сомонӣ (ҳаҷм×нарх)`,
        pulseFacts(input.pulse ?? null),
      ].join("\n"),
      { timeoutMs: 26000, maxTokens: 1500 },
    );
  } catch (error) {
    console.error("[pilot/plan]", error instanceof Error ? error.message : "fail");
    return [
      `1. Харидор дар ${input.region}`,
      `Рӯйхати 10 харидори ${input.product}-ро нависед. Ҳар рӯз ба 3 нафар занг занед ё паём диҳед.`,
      "",
      "2. Пешниҳоди равшан",
      `Нарх: ${input.price || "—"} сомонӣ (рақами шумо). Як баста ва як нарх барои яклухт нависед.`,
      "",
      "3. Такрор",
      "Харидори харидаро ҳар ҳафта хабар диҳед. Ин арзонтар аз ҷустуҷӯи нав аст.",
      "",
      `Ҳисоб аз рақами шумо: ${input.volume || "ҳаҷм"} × ${input.price || "нарх"} = ${monthlyRevenue(input.volume, input.price)} сомонӣ. Ин нуқтаи имрӯз аст, на кафолат.`,
    ].join("\n");
  }
}

function startTime(problem: string): "full" | "part" | "weekend" {
  const raw = problem.match(/time:([^;]*)/)?.[1]?.trim() ?? "";
  if (raw === "full" || raw === "weekend" || raw === "part") return raw;
  return "part";
}

/** Пешниҳодҳоро аз профили захирашуда боз месозад. */
export async function suggestionsFromProfile(
  locale: string,
  profile: PilotProfileRow,
  pulse?: ShopPulse | null,
): Promise<PilotSuggestionBatch> {
  if (profile.kind === "starting") {
    const interests = profile.category
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const budget = Number(String(profile.volume).replace(/[^\d.-]/g, "")) || 0;
    return generateStartIdeas({
      locale,
      interests: interests.length ? interests : [profile.product || "бизнес"],
      budget: Math.max(500, budget),
      time: startTime(profile.problem),
      skills: profile.problem.match(/skills:(.*)/)?.[1]?.trim() ?? "",
      region: profile.region,
    });
  }
  return analyzeBusinessSuggestions({
    locale,
    category: profile.category,
    product: profile.product,
    region: profile.region,
    volume: profile.volume,
    price: profile.price,
    channels: profile.channels,
    problem: profile.problem,
    pulse: pulse ?? null,
  });
}

function parseJsonRecord(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function asUnit(raw: unknown, category: string): (typeof PILOT_UNITS)[number] {
  const s = String(raw ?? "").toLowerCase().trim();
  if ((PILOT_UNITS as readonly string[]).includes(s)) {
    return s as (typeof PILOT_UNITS)[number];
  }
  if (s.includes("ton") || s.includes("тонн")) return "ton";
  if (s.includes("kg") || s.includes("кг") || s.includes("kilo")) return "kg";
  if (s.includes("som") || s.includes("tjs") || s.includes("сомон")) return "tjs";
  return defaultUnitFor(category);
}

export type BusinessRead = {
  understood: string;
  unit: (typeof PILOT_UNITS)[number];
  volumeHint: string;
  priceHint: string;
  note: string;
  usedAi: boolean;
};

/** Қадами 1: ИИ маҳсулот ва шаҳрро мехонад — бе нархи бозор. */
export async function readBusinessDraft(input: {
  locale: string;
  category: string;
  subcategory: string;
  product: string;
  region: string;
}): Promise<BusinessRead> {
  const fallback: BusinessRead = {
    understood: `${input.product.trim()} — ${input.region.trim()}`,
    unit: defaultUnitFor(input.category),
    volumeHint: "",
    priceHint: "",
    note: "",
    usedAi: false,
  };
  try {
    const text = await completeAi(
      businessSystemPrompt({
        locale: parseLocale(input.locale),
        jsonOnly: true,
        ownerFocus: input.product,
        ownerMessage: `${input.product}. ${input.region}`,
        role: [
          "The owner just named their real shop. Confirm you understood THIS product and THIS city.",
          "Do NOT invent Somon/OLX prices, market size, or volume. Do not use demo goods (apples, phones, oil) unless they wrote them.",
          "unit must be one of: kg, ton, pcs, tjs — the unit that fits THEIR product.",
          "volume_hint and price_hint: short questions naming their product, asking THEM for their numbers.",
        ].join(" "),
        format: [
          "JSON object only:",
          '{"understood":"one sentence","unit":"kg|ton|pcs|tjs","volume_hint":"...","price_hint":"...","note":"we still need their volume and price; no market scrape"}',
        ].join("\n"),
      }),
      [
        `Соҳа: ${input.category}`,
        input.subcategory ? `Зерсоҳа: ${input.subcategory}` : "",
        `Маҳсулот: ${input.product}`,
        `Минтақа: ${input.region}`,
      ]
        .filter(Boolean)
        .join("\n"),
      { timeoutMs: 26000, maxTokens: 1200, json: true },
    );
    const row = parseJsonRecord(text);
    if (!row) return fallback;
    const understood = String(row.understood ?? row.summary ?? "").trim();
    if (!understood) return fallback;
    return {
      understood: understood.slice(0, 240),
      unit: asUnit(row.unit, input.category),
      volumeHint: String(row.volume_hint ?? row.volumeHint ?? "").trim().slice(0, 160),
      priceHint: String(row.price_hint ?? row.priceHint ?? "").trim().slice(0, 160),
      note: String(row.note ?? "").trim().slice(0, 200),
      usedAi: true,
    };
  } catch (error) {
    console.error("[pilot/read-business]", error instanceof Error ? error.message : "fail");
    return fallback;
  }
}
