import { detectNiche, type NicheId } from "@/lib/niche";
import type { PilotProfileRow } from "@/lib/store";

export type IntegrationAdvice = {
  niche: NicheId;
  builtInCrm: boolean;
  suggestBitrix: boolean;
  suggestMcp: boolean;
  reasonKey: "food" | "tech" | "service" | "general";
};

export function recommendIntegrations(profile: PilotProfileRow | null): IntegrationAdvice {
  const niche = detectNiche(profile?.category, profile?.subcategory, profile?.product);
  const builtInCrm = true;
  const suggestBitrix = niche === "phones" || niche === "it" || niche === "repair" || niche === "service";
  const suggestMcp = true;
  let reasonKey: IntegrationAdvice["reasonKey"] = "general";
  if (niche === "food" || niche === "agriculture") reasonKey = "food";
  else if (niche === "phones" || niche === "it") reasonKey = "tech";
  else if (niche === "repair" || niche === "service" || niche === "education") reasonKey = "service";

  return { niche, builtInCrm, suggestBitrix, suggestMcp, reasonKey };
}
