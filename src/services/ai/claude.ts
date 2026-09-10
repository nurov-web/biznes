/**
 * Даъвати Claude API. Ҳамаи зангҳои AI танҳо аз ҳамин ҷо мегузаранд.
 * Вызовы Claude API. Все AI-запросы проходят только отсюда.
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

export type AiKeyStatus = "missing" | "invalid_prefix" | "configured";

/**
 * Вазъияти калиди API-ро месанҷад (бе фош кардани худи калид).
 * Проверяет статус API-ключа без утечки самого ключа.
 */
export function getAiKeyStatus(): AiKeyStatus {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return "missing";
  if (!key.startsWith("sk-ant-")) return "invalid_prefix";
  return "configured";
}

/**
 * Оё калиди Claude дуруст танзим шудааст? (ғайрихолӣ ва бо sk-ant- сар мешавад).
 * Настроен ли ключ Claude корректно (не пустой и начинается с sk-ant-).
 */
export function aiConfigured(): boolean {
  return getAiKeyStatus() === "configured";
}

function apiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY?.trim() ?? "";
  if (!key) throw new Error("NO_API_KEY");
  if (!key.startsWith("sk-ant-")) throw new Error("INVALID_PREFIX");
  return key;
}

function model(): string {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
}

const CLAUDE_TIMEOUT_MS = 16000;

async function callApi(
  body: Record<string, unknown>,
  timeoutMs = CLAUDE_TIMEOUT_MS,
): Promise<{
  content?: ContentBlock[];
  stop_reason?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const key = apiKey();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: model(), temperature: 0.2, ...body }),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("CLAUDE_UNAUTHORIZED");
      }
      throw new Error(`CLAUDE_HTTP_${response.status}`);
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

export async function completeClaude(
  system: string,
  user: string,
  options?: { timeoutMs?: number; maxTokens?: number; userLimit?: number },
): Promise<string> {
  const data = await callApi(
    {
      max_tokens: options?.maxTokens ?? 4000,
      system,
      messages: [{ role: "user", content: user.slice(0, options?.userLimit ?? 8000) }],
    },
    options?.timeoutMs ?? CLAUDE_TIMEOUT_MS,
  );
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

export type ClaudeFail = "no_key" | "invalid_prefix" | "bad_key" | "timeout" | "fail";

export function classifyClaudeError(error: unknown): ClaudeFail {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "NO_API_KEY") return "no_key";
  if (msg === "INVALID_PREFIX") return "invalid_prefix";
  if (
    msg === "CLAUDE_UNAUTHORIZED" ||
    msg.includes("CLAUDE_HTTP_401") ||
    msg.includes("authentication_error") ||
    msg.includes("invalid x-api-key") ||
    msg.includes("invalid_api_key")
  ) {
    return "bad_key";
  }
  if (msg.includes("CLAUDE_TIMEOUT")) return "timeout";
  return "fail";
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
