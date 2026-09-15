/**
 * Даъвати Gemini API. Калид танҳо дар сервер мемонад.
 */

type GeminiPart = { text?: string };
type GeminiContent = { role?: string; parts?: GeminiPart[] };
type GeminiResponse = {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  error?: { message?: string; status?: string; code?: number };
};

export type ChatTurn = { role: "user" | "assistant"; content: string };

const GEMINI_TIMEOUT_MS = 28000;

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
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
}

export function geminiModelName(): string {
  return geminiModel();
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

  const contents: GeminiContent[] = options.messages
    .filter((row) => row.content.trim())
    .map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: row.content.slice(0, 8000) }],
    }));
  if (contents.length === 0 || contents[contents.length - 1]?.role !== "user") {
    throw new Error("GEMINI_BAD_TURN");
  }

  const models = Array.from(
    new Set([
      geminiModel(),
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
    ]),
  );
  let lastError: Error | null = null;
  const deadline = Date.now() + (options.timeoutMs ?? GEMINI_TIMEOUT_MS);

  for (const model of models) {
    if (Date.now() >= deadline) break;
    const remain = Math.max(4000, Math.min(10000, deadline - Date.now()));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remain);
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
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: options.system }] },
          contents,
          generationConfig: {
            temperature: options.temperature ?? 0.2,
            maxOutputTokens: options.maxOutputTokens ?? 2048,
            ...(options.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
        signal: controller.signal,
      });
      const data = (await response.json()) as GeminiResponse;
      if (!response.ok) {
        console.error("[gemini]", model, response.status, data.error?.status ?? "");
      }
      if (response.status === 404) {
        lastError = new Error(`GEMINI_HTTP_404:${model}`);
        continue;
      }
      if (response.status === 429 || response.status === 503) {
        lastError = new Error(`GEMINI_HTTP_${response.status}:${model}`);
        await new Promise((resolve) => setTimeout(resolve, 400));
        continue;
      }
      if (!response.ok) {
        const status = data.error?.status ?? "";
        const code = data.error?.code ?? response.status;
        lastError = new Error(
          code === 401 || code === 403 || status === "UNAUTHENTICATED" || status === "PERMISSION_DENIED"
            ? "GEMINI_UNAUTHORIZED"
            : `GEMINI_HTTP_${response.status}:${model}`,
        );
        if (lastError.message === "GEMINI_UNAUTHORIZED") break;
        continue;
      }
      const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("\n")
        .trim();
      if (!text) {
        lastError = new Error(`Empty Gemini response:${data.candidates?.[0]?.finishReason ?? "?"}:${model}`);
        continue;
      }
      return text;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error(`GEMINI_TIMEOUT:${model}`);
        continue;
      }
      lastError = error instanceof Error ? error : new Error("GEMINI_FAIL");
    } finally {
      clearTimeout(timer);
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
