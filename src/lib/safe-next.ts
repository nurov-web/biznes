import { stripLocalePrefix } from "@/lib/locale-path";

const ALLOWED = new Set([
  "/has-business",
  "/start-business",
  "/suggestions",
  "/dashboard",
]);

/**
 * next= аз query — танҳо роҳҳои дохилӣ, бе open-redirect.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return "";
  }
  const path = trimmed.split("?")[0]?.split("#")[0] ?? "";
  if (path.includes("\\") || path.length > 180) return "";
  const bare = stripLocalePrefix(path);
  if (!ALLOWED.has(bare) && !bare.startsWith("/dashboard/")) return "";
  return bare;
}
