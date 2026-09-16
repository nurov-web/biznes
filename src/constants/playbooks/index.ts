import { detectNiche, type NicheId } from "@/lib/niche";
import type { PilotSuggestionItem } from "@/lib/store";
import { produceFallback, PRODUCE_PROMPT_RULES } from "@/constants/playbooks/produce";
import { techFallback, TECH_PROMPT_RULES } from "@/constants/playbooks/tech";
import { serviceFallback, SERVICE_PROMPT_RULES } from "@/constants/playbooks/service";
import { generalFallback } from "@/constants/playbooks/general";

export type PlaybookKey = "produce" | "tech" | "service" | "general";

const FOOD_NICHES: NicheId[] = ["food", "agriculture"];
const TECH_NICHES: NicheId[] = ["phones", "it"];
const SERVICE_SET: NicheId[] = ["repair", "service", "education"];

export function playbookKeyFor(parts: {
  category?: string;
  product?: string;
  subcategory?: string;
}): PlaybookKey {
  const niche = detectNiche(parts.category, parts.subcategory, parts.product);
  if (FOOD_NICHES.includes(niche)) return "produce";
  if (TECH_NICHES.includes(niche)) return "tech";
  if (SERVICE_SET.includes(niche)) return "service";
  if (niche === "cars" || niche === "construction" || niche === "clothes") return "general";
  return "general";
}

export function playbookPromptRules(key: PlaybookKey): string {
  if (key === "produce") return PRODUCE_PROMPT_RULES;
  if (key === "tech") return TECH_PROMPT_RULES;
  if (key === "service") return SERVICE_PROMPT_RULES;
  return "";
}

export function playbookFallback(
  key: PlaybookKey,
  product: string,
  region: string,
  price = "",
  volume = "",
): PilotSuggestionItem[] {
  if (key === "produce") return produceFallback(product, region, price, volume);
  if (key === "tech") return techFallback(product, region, price, volume);
  if (key === "service") return serviceFallback(product, region, price, volume);
  return generalFallback(product, region, price, volume);
}
