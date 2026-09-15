/**
 * Даъвати Gemini API. Калид танҳо дар сервер мемонад.
 */

type GeminiPart = { text?: string; thought?: boolean };
type GeminiContent = { role?: string; parts?: GeminiPart[] };
type GeminiResponse = {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  error?: { message?: string; status?: string; code?: number };
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

const GEMINI_TIMEOUT_MS = 18000;
const RETIRED_MODEL = /gemini-(1\.5|2\.0|2\.5)($|-)/;

function geminiApiKey(): string {
  const dedicated = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (dedicated) return dedicated;
  const shared = process.env.ANTHROPIC_API_KEY?.trim() ?? "";
  if (shared && !shared.startsWith("sk-ant-")) return shared;
  return "";
}

export function geminiConfigured(): boolean {
  return geminiApiKey().length > 0;
}

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
}

export function geminiModelName(): string {
  return geminiModel();
}

function geminiModels(): string[] {
  const configured = geminiModel();
  const live = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
  ];
  const first = configured && !RETIRED_MODEL.test(configured) ? [configured] : [];
  return Array.from(new Set([...first, ...live]));
}

function extractText(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const visible = parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
  if (visible) return visible;
  return parts.map((part) => part.text ?? "").join("\n").trim();
}

function isAuthError(response: Response, data: GeminiResponse): boolean {
  const status = data.error?.status ?? "";
  const code = data.error?.code ?? response.status;
  return (
    code === 401 ||
    code === 403 ||
    status === "UNAUTHENTICATED" ||
    status === "PERMISSION_DENIED"
  );
}

type ThinkingMode = "level" | "budget";

function generationBody(
  options: {
    system: string;
    contents: GeminiContent[];
    maxOutputTokens: number;
    json?: boolean;
  },
  thinking: ThinkingMode,
): string {
  const thinkingConfig =
    thinking === "level" ? { thinkingLevel: "low" } : { thinkingBudget: 0 };
  return JSON.stringify({
    systemInstruction: { parts: [{ text: options.system }] },
    contents: options.contents,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens,
      thinkingConfig,
      ...(options.json ? { responseMimeType: "application/json" } : {}),
    },
  });
}

export async function completeGemini(options: {
  system: string;
  messages: ChatTurn[];
  timeoutMs?: number;
  maxOutputTokens?: number;
  json?: boolean;
  temperature?: number;
}): Promise<string> {
  const key = geminiApiKey();
  if (!key) throw new Error("NO_API_KEY");
  void options.temperature;

  const contents: GeminiContent[] = options.messages
    .filter((row) => row.content.trim())
    .map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: row.content.slice(0, 8000) }],
    }));
  if (contents.length === 0 || contents[contents.length - 1]?.role !== "user") {
    throw new Error("GEMINI_BAD_TURN");
  }

  const models = geminiModels();
  let lastError: Error | null = null;
  const deadline = Date.now() + (options.timeoutMs ?? GEMINI_TIMEOUT_MS);
  const maxOutputTokens = options.maxOutputTokens ?? 2048;

  for (const model of models) {
    const remain = deadline - Date.now();
    if (remain < 2500) break;
    const slice = Math.min(8000, remain);
    const thinkingModes: ThinkingMode[] = ["level", "budget"];
    for (let attempt = 0; attempt < thinkingModes.length; attempt += 1) {
      const thinking = thinkingModes[attempt] ?? "level";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), slice);
      try {
        const endpoint = new URL(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        );
        endpoint.searchParams.set("key", key);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": key,
          },
          body: generationBody(
            {
              system: options.system,
              contents,
              maxOutputTokens,
              json: options.json,
            },
            thinking,
          ),
          signal: controller.signal,
        });
        const data = (await response.json()) as GeminiResponse;
        if (!response.ok) {
          console.error("[gemini]", model, response.status, data.error?.status ?? "");
        }
        if (response.status === 404) {
          lastError = new Error(`GEMINI_HTTP_404:${model}`);
          break;
        }
        if (response.status === 400 && attempt === 0) {
          lastError = new Error(`GEMINI_HTTP_400:${model}`);
          continue;
        }
        if (response.status === 429 || response.status === 503) {
          lastError = new Error(`GEMINI_HTTP_${response.status}:${model}`);
          await new Promise((resolve) => setTimeout(resolve, 250));
          break;
        }
        if (!response.ok) {
          lastError = new Error(
            isAuthError(response, data)
              ? "GEMINI_UNAUTHORIZED"
              : `GEMINI_HTTP_${response.status}:${model}`,
          );
          if (lastError.message === "GEMINI_UNAUTHORIZED") {
            throw lastError;
          }
          break;
        }
        const text = extractText(data);
        if (!text) {
          lastError = new Error(
            `Empty Gemini response:${data.candidates?.[0]?.finishReason ?? "?"}:${model}`,
          );
          if (attempt === 0) continue;
          break;
        }
        return text;
      } catch (error) {
        if (error instanceof Error && error.message === "GEMINI_UNAUTHORIZED") {
          throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
          lastError = new Error(`GEMINI_TIMEOUT:${model}`);
          break;
        }
        lastError = error instanceof Error ? error : new Error("GEMINI_FAIL");
        break;
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw lastError ?? new Error("GEMINI_HTTP_404");
}

export type GeminiFail = "no_key" | "bad_key" | "timeout" | "fail";

export function classifyGeminiError(error: unknown): GeminiFail {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "NO_API_KEY") return "no_key";
  if (msg === "GEMINI_UNAUTHORIZED" || msg.includes("GEMINI_HTTP_400")) return "bad_key";
  if (msg.includes("GEMINI_TIMEOUT")) return "timeout";
  return "fail";
}
