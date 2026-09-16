import { shortLine, suggestionSteps } from "@/lib/pilot-suggestions";
import type { PilotSuggestionItem } from "@/lib/store";
import type { AiRecommendationCardModel } from "@/types/ai-recommendation";

/** Пешниҳоди пилот → кортҳои WHAT/WHY/NEXT. */
export function suggestionToRecommendation(item: PilotSuggestionItem): AiRecommendationCardModel {
  const steps = suggestionSteps(item).map((row) => shortLine(row, 120));
  return {
    what: item.title.trim(),
    why: shortLine(item.description, 200),
    steps,
    forecastSomoni: item.potentialSomoni > 0 ? item.potentialSomoni : null,
    result: steps.length > 0 ? steps[steps.length - 1] : undefined,
  };
}
