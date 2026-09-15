import { aiConfigured, completeClaude } from "@/services/ai/claude";
import { completeGemini, geminiConfigured, type ChatTurn } from "@/services/ai/gemini";

function asTurns(input: string | ChatTurn[]): ChatTurn[] {
  if (typeof input === "string") return [{ role: "user", content: input }];
  return input.filter((row) => row.content.trim());
}

/** Gemini агар калид бошад; Claude танҳо агар калиди sk-ant- бошад. */
export async function completeAi(
  system: string,
  input: string | ChatTurn[],
  options?: { timeoutMs?: number; maxTokens?: number; json?: boolean; temperature?: number },
): Promise<string> {
  const messages = asTurns(input);
  if (messages.length === 0) throw new Error("EMPTY_PROMPT");
  let geminiError: unknown = null;
  if (geminiConfigured()) {
    try {
      return await completeGemini({
        system,
        messages,
        timeoutMs: options?.timeoutMs,
        maxOutputTokens: options?.maxTokens,
        json: options?.json,
        temperature: options?.temperature,
      });
    } catch (error) {
      geminiError = error;
      console.error("[completeAi/gemini]", error instanceof Error ? error.message : "fail");
    }
  }
  if (aiConfigured()) {
    const blob = messages
      .map((row) => `${row.role === "assistant" ? "Assistant" : "Owner"}: ${row.content}`)
      .join("\n\n");
    return completeClaude(system, blob, {
      timeoutMs: options?.timeoutMs,
      maxTokens: options?.maxTokens,
    });
  }
  if (geminiError instanceof Error) throw geminiError;
  throw new Error("NO_API_KEY");
}
