/** Универсалӣ барои кортҳои «ИИ мегӯяд» — Business-MU 2.0. */
export type AiRecommendationCardModel = {
  what: string;
  why: string;
  steps: string[];
  data?: string;
  risk?: string;
  nextLabel?: string;
  result?: string;
  /** Рақами иловагӣ ё пешбинӣ — холӣ = намедонем. */
  forecastSomoni?: number | null;
};
