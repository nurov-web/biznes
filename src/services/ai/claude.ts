/**
 * Вызовы Claude API. Все AI-запросы только отсюда.
 */
export type ToolSpec = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
};

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; tool_use_id: string; content: string }
  | { type: "server_tool_use"; name?: string }
  | { type: "web_search_tool_result" };

type Message = { role: "user" | "assistant"; content: string | ContentBlock[] };

function apiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) throw new Error("NO_API_KEY");
  return key;
}

function model(): string {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
}

const CLAUDE_TIMEOUT_MS = 16000;

async function callApi(body: Record<string, unknown>): Promise<{
  content?: ContentBlock[];
  stop_reason?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: model(), temperature: 0.2, ...body }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`CLAUDE_HTTP_${response.status}: ${detail}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("CLAUDE_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function completeClaude(system: string, user: string): Promise<string> {
  const data = await callApi({
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: user.slice(0, 8000) }],
  });
  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) {
    throw new Error("Empty Claude response");
  }
  return text;
}

/**
 * Гуфтугӯ бо Claude, ки метавонад асбобҳои моро даъват кунад
 * (тарҳи MCP: модел маълумоти воқеии бизнесро мехонад, на тахмин мезанад).
 */
export async function completeClaudeWithTools(options: {
  system: string;
  user: string;
  tools: ToolSpec[];
  runTool: (name: string, input: unknown) => Promise<unknown>;
  maxRounds?: number;
}): Promise<{ text: string; toolsUsed: string[] }> {
  const messages: Message[] = [{ role: "user", content: options.user.slice(0, 12000) }];
  const toolsUsed: string[] = [];
  const maxRounds = options.maxRounds ?? 3;

  for (let round = 0; round < maxRounds; round += 1) {
    const data = await callApi({
      max_tokens: 4000,
      system: options.system,
      tools: options.tools,
      messages,
    });
    const blocks = data.content ?? [];
    const calls = blocks.filter((b): b is Extract<ContentBlock, { type: "tool_use" }> =>
      b.type === "tool_use",
    );
    if (data.stop_reason !== "tool_use" || calls.length === 0) {
      const text = blocks
        .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (!text) throw new Error("Empty Claude response");
      return { text, toolsUsed };
    }

    messages.push({ role: "assistant", content: blocks });
    const results: ContentBlock[] = [];
    for (const call of calls) {
      toolsUsed.push(call.name);
      let payload: unknown;
      try {
        payload = await options.runTool(call.name, call.input);
      } catch (error) {
        payload = { error: error instanceof Error ? error.message : "tool_failed" };
      }
      results.push({
        type: "tool_result",
        tool_use_id: call.id,
        content: JSON.stringify(payload).slice(0, 12000),
      });
    }
    messages.push({ role: "user", content: results });
  }

  throw new Error("TOOL_LOOP_LIMIT");
}

export function extractJsonObject(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Claude бо ҷустуҷӯи интернети серверӣ (на парсинги Somon/OLX).
 * Агар асбоб дастнорас бошад, хато медиҳад — даъваткунанда fallback мекунад.
 */
export async function completeClaudeWeb(options: {
  system: string;
  user: string;
  city?: string;
  maxUses?: number;
}): Promise<{ text: string; usedWeb: boolean }> {
  const location = options.city
    ? {
        type: "approximate" as const,
        city: options.city,
        country: "TJ",
        timezone: "Asia/Dushanbe",
      }
    : {
        type: "approximate" as const,
        city: "Dushanbe",
        country: "TJ",
        timezone: "Asia/Dushanbe",
      };

  const data = await callApi({
    max_tokens: 4000,
    system: options.system,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: options.maxUses ?? 2,
        user_location: location,
      },
    ],
    messages: [{ role: "user", content: options.user.slice(0, 8000) }],
  });
  const blocks = data.content ?? [];
  const usedWeb = blocks.some(
    (block) =>
      block.type === "web_search_tool_result" ||
      block.type === "server_tool_use" ||
      (block.type === "tool_use" && block.name === "web_search"),
  );
  const text = blocks
    .filter((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Empty Claude web response");
  return { text, usedWeb };
}
