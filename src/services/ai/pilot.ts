import type { PilotDifficulty, PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import { parseLocale, type Locale } from "@/lib/locale-query";
import { monthlyRevenue } from "@/lib/pilot-volume";
import { namedGoods } from "@/lib/owner-goods";
import { hasMixedScript, type TajikReplyScript } from "@/lib/tajik-text";
import { defaultUnitFor, PILOT_UNITS } from "@/constants/pilot";
import { businessSystemPrompt } from "@/services/ai/business-system";
import { completeAi } from "@/services/ai/complete";
import { extractJsonArray } from "@/services/ai/claude";
import type { ShopPulse } from "@/types/shop-pulse";
import { pulseFacts } from "@/services/shop-pulse";
import { splitToSteps } from "@/lib/pilot-suggestions";

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

/** Аз 50 сомонӣ камтар маънои амалӣ надорад — «+1 сомонӣ/моҳ» нанависем. */
const MIN_EXTRA_SOMONI = 50;

/** Рақам танҳо дар доираи ҳисоби соҳиб — бе бозори сохта. */
function clampAmount(n: number, cap: number): number {
  if (cap <= 0 || n <= 0) return 0;
  const value = Math.min(n, cap);
  return value >= MIN_EXTRA_SOMONI ? value : 0;
}

/** Кортҳо бо хати сайт навишта мешаванд, то дар як ҷумла ду алифбо наояд. */
function cardScript(locale: Locale): TajikReplyScript {
  return locale === "tg" ? "cyrillic" : "neutral";
}

/** Корти бо ду алифбо («narxi 1 somoni кам аст») хатои хониш аст — нишон намедиҳем. */
function mixedScriptItem(item: PilotSuggestionItem, ownWords: string[]): boolean {
  return hasMixedScript([item.title, item.description, ...(item.steps ?? [])].join(" "), ownWords);
}

function itemFromUnknown(raw: unknown, fallbackTitle: string, cap: number): PilotSuggestionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const title = String(row.title ?? row.name ?? "").trim() || fallbackTitle;
  const description = String(row.description ?? row.why ?? "").trim() || title;
  if (!title) return null;
  const listed = [row.steps, row.actions, row.kadam]
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .slice(0, 4);
  return {
    title: title.slice(0, 90),
    description: description.slice(0, 420),
    steps: listed.length > 0 ? listed : splitToSteps(description),
    difficulty: difficultyOf(row.difficulty),
    potentialSomoni: clampAmount(num(row.potential_somoni ?? row.monthly_income ?? row.potentialSomoni, 0), cap),
  };
}

function parseItems(
  text: string,
  fallbackTitle: string,
  cap: number,
  ownWords: string[] = [],
): PilotSuggestionItem[] {
  return parseJsonList(text)
    .map((row) => itemFromUnknown(row, fallbackTitle, cap))
    .filter((row): row is PilotSuggestionItem => row !== null && !mixedScriptItem(row, ownWords))
    .slice(0, 4);
}

function extrasFrom(turnover: number): number[] {
  if (turnover <= 0) return [0, 0, 0, 0];
  return [0.04, 0.05, 0.06, 0.07].map((part) => {
    const value = Math.round(turnover * part);
    return value >= MIN_EXTRA_SOMONI ? value : 0;
  });
}

function fallbackFor(product: string, region: string, price = "", volume = ""): PilotSuggestionItem[] {
  const who = product.trim() || "маҳсулот";
  const where = region.trim() || "шаҳри шумо";
  const priceText = price.trim() || "нархе, ки шумо навиштед";
  const extras = extrasFrom(monthlyRevenue(volume, price));
  return [
    {
      title: `3 харидори ${who}`,
      description: `Яклухт дар ${where}. Нарх ${priceText} сомонӣ.`,
      steps: [
        `10 ном дар ${where} нависед.`,
        `Имрӯз ба 3 нафар занг: нарх ${priceText} сомонӣ.`,
        "Харидро дар дафтар нависед.",
      ],
      difficulty: "easy",
      potentialSomoni: extras[0] ?? 0,
    },
    {
      title: `${who} дар баста`,
      description: `Як нарх, як баста — то напурсанд «чанд?».`,
      steps: [
        `Бастаи 3–5 дона нависед. Нарх ${priceText} сомонӣ.`,
        `Ба 5 нафар дар ${where} паём кунед.`,
        "Ҳафтаро ҳисоб кунед: рафт ё не.",
      ],
      difficulty: "easy",
      potentialSomoni: extras[1] ?? 0,
    },
    {
      title: "Ҳар рӯз як пешниҳод",
      description: `Ҳамон канал. ${who} дар ${where}.`,
      steps: [
        "Телефон, бозор ё Telegram — якро гиред.",
        `Рӯзе як бор нарх ${priceText} сомонӣ гӯед.`,
        "Пас аз 7 рӯз: чанд харид.",
      ],
      difficulty: "medium",
      potentialSomoni: extras[2] ?? 0,
    },
    {
      title: "Харидори кӯҳна",
      description: `Касе ки ${who} харидааст — бори дигар занг.`,
      steps: [
        "5 рақами кӯҳна нависед.",
        "Ҳар ҳафта: мол ҳаст, нарх ҳамон.",
        "Харид шуд — сана нависед.",
      ],
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
      title: `${who} бо ${budget} сомонӣ`,
      description: `Аввал кори хурд дар ${where}.`,
      steps: [
        `Нархро нависед. Буҷет ${budget} сомонӣ.`,
        `Дар ${where} аз 5 нафар пурсед.`,
        "Ба 3 нафар гӯед.",
      ],
      difficulty: "easy",
      potentialSomoni: extras[0] ?? 0,
    },
    {
      title: "Як харидор",
      description: `Пеш аз хароҷот — як харидор дар ${where}.`,
      steps: [
        `10 ном дар ${where} нависед.`,
        "Имрӯз аз 3 нафар пурсед.",
        "Гуфт ҳа — рӯз нависед.",
      ],
      difficulty: "easy",
      potentialSomoni: extras[1] ?? 0,
    },
    {
      title: "Як нарх",
      description: `Як ҷумла, як нарх. Буҷет ${budget} сомонӣ.`,
      steps: [
        `Нависед: «${who} — нарх … сомонӣ».`,
        `Ба 5 нафар дар ${where} фиристед.`,
        "Ҳафтаро ҳисоб кунед.",
      ],
      difficulty: "medium",
      potentialSomoni: extras[2] ?? 0,
    },
    {
      title: "Ҳар рӯз як кор",
      description: `${who} дар ${where}. Такрор.`,
      steps: [
        "Субҳ: занг ё паём.",
        "Шаб: кардам ё не.",
        "Пас аз 7 рӯз ҳисоб.",
      ],
      difficulty: "medium",
      potentialSomoni: extras[3] ?? 0,
    },
  ];
}

const HONEST_RULES = [
  "Use ONLY the owner's stated product, city, price, volume, channels, budget, problem, and shop-pulse facts.",
  "Do NOT invent Somon/OLX/Amazon prices, rent, tax, or market size.",
  "If sold/refused/complaints are NOT ON PAGE, say so. Never fill demo numbers (325, 70%, fake ranking).",
  "Each item: title = the action (4–8 words); description = WHY in one sentence; steps = exactly 3 actions they can do this week.",
  "Steps must be in the order they are done: step 1 today, step 2 this week, step 3 after that. Step 2 must only make sense after step 1.",
  "Every step is ONE sentence under 80 characters, starts with a verb, and names THIS product and THIS city. No vague 'review the price' without how.",
  "potential_somoni is a small extra in TJS from owner price × volume (about 4–8% of that turnover). If price or volume is missing, or the extra would be under 50 TJS, use 0.",
  "Never promise profit. The number is a model from THEIR numbers, not a live market.",
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
        role: `You return exactly 4 next moves as a JSON array, each with 3 doable steps. ${HONEST_RULES}`,
        jsonOnly: true,
        ownerFocus: input.product,
        replyScript: cardScript(parseLocale(input.locale)),
        format: [
          "JSON array of 4 objects.",
          '{"title":"4-8 words","description":"why, one sentence","steps":["action 1 with product and city","action 2","action 3"],"difficulty":"осон"|"миёна"|"душвор","potential_somoni":number}',
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
      { timeoutMs: 28000, maxTokens: 2200, json: true },
    );
    const items = parseItems(text, input.product, cap, [input.product, input.region]);
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
        role: `You return exactly 4 start ideas as a JSON array, each with 3 doable steps. ${HONEST_RULES}`,
        jsonOnly: true,
        ownerFocus: input.interests.join(", "),
        replyScript: cardScript(parseLocale(input.locale)),
        format: [
          "JSON array of 4 objects.",
          '{"name":"...","startup_cost":number,"monthly_income":number,"difficulty":1|2|3,"description":"why","steps":["action 1","action 2","action 3"]}',
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
      { timeoutMs: 28000, maxTokens: 2200, json: true },
    );
    const items = parseJsonList(text)
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const rec = row as Record<string, unknown>;
        return itemFromUnknown(
          {
            title: rec.name ?? rec.title,
            description: rec.description,
            steps: rec.steps ?? rec.actions,
            difficulty: rec.difficulty,
            potential_somoni: rec.monthly_income ?? rec.potential_somoni,
          },
          input.interests[0] || "бизнес",
          cap,
        );
      })
      .filter(
        (row): row is PilotSuggestionItem =>
          row !== null && !mixedScriptItem(row, [...input.interests, input.region]),
      )
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
          "Write a short sales plan: 3–4 steps, numbered 1., 2., 3. in the order they must be done.",
          "Each step: title + 2–3 concrete actions. Step 2 starts only after step 1 is done.",
          "Name this owner's product, city and price in the actions — never generic advice.",
          "Use only their numbers and shop-pulse facts. If sold/refused/complaints are NOT ON PAGE, do not invent them. No invented market prices. End with a TJS calculation from volume × price. No markdown.",
        ].join(" "),
        ownerFocus: input.product,
        replyScript: cardScript(parseLocale(input.locale)),
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
  const goods = namedGoods(input.product);
  const city = input.region.trim();
  const fallback: BusinessRead = {
    understood: goods ? `${goods} — ${city}` : city,
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
        ownerFocus: goods || city,
        ownerMessage: `${goods || "маҳсулот номбар нашуд"}. ${city}`,
        role: [
          goods
            ? "The owner named a real product. Confirm THIS product and THIS city in one short sentence."
            : "The owner did NOT name a product. Words like надорам, нет, нету, нест mean 'I don't have one' — NEVER quote them as a SKU or product title.",
          "Confirm the city. If no product name, ask them to name one thing they sell (bread, phone, clothes). Do not lecture about missing prices, estimates, or Somon.",
          "Do NOT invent Somon/OLX prices, market size, or volume. Do not use demo goods unless they wrote them.",
          "unit must be one of: kg, ton, pcs, tjs.",
          "volume_hint and price_hint: short questions. note must be empty or one short next step — never a warning about approximate estimates.",
        ].join(" "),
        format: [
          "JSON object only:",
          '{"understood":"one helpful sentence","unit":"kg|ton|pcs|tjs","volume_hint":"...","price_hint":"...","note":""}',
        ].join("\n"),
      }),
      [
        `Соҳа: ${input.category}`,
        input.subcategory ? `Зерсоҳа: ${input.subcategory}` : "",
        goods ? `Маҳсулот: ${goods}` : "Маҳсулот: номбар нашуд (калимаи рад — мол нест)",
        `Минтақа: ${city}`,
      ]
        .filter(Boolean)
        .join("\n"),
      { timeoutMs: 26000, maxTokens: 1200, json: true },
    );
    const row = parseJsonRecord(text);
    if (!row) return fallback;
    const understood = String(row.understood ?? row.summary ?? "").trim();
    if (!understood) return fallback;
    const quotesEmpty =
      !goods && /надорам|не дорам|«нет»|"нет"|нету/i.test(understood);
    const rawNote = String(row.note ?? "").trim();
    const lecture = /тахмин|приблизит|оценк|Somon|бидуни рақам|generic|каталог/i.test(
      `${understood} ${rawNote}`,
    );
    return {
      understood: quotesEmpty ? fallback.understood : understood.slice(0, 240),
      unit: asUnit(row.unit, input.category),
      volumeHint: String(row.volume_hint ?? row.volumeHint ?? "").trim().slice(0, 160),
      priceHint: String(row.price_hint ?? row.priceHint ?? "").trim().slice(0, 160),
      note: lecture ? "" : rawNote.slice(0, 200),
      usedAi: true,
    };
  } catch (error) {
    console.error("[pilot/read-business]", error instanceof Error ? error.message : "fail");
    return fallback;
  }
}
