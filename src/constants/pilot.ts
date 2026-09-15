export const PILOT_CATEGORIES = [
  "agriculture",
  "trade",
  "food",
  "production",
  "beauty",
  "construction",
  "transport",
  "services",
  "other",
] as const;

export type PilotCategory = (typeof PILOT_CATEGORIES)[number];

export const PILOT_AGRI_SUB = ["fruits", "vegetables", "grain", "livestock", "other_agr"] as const;

export const PILOT_INTERESTS = [
  "agriculture",
  "trade",
  "food",
  "beauty",
  "construction",
  "transport",
  "services",
  "tech",
] as const;

export const PILOT_CHANNELS = ["market", "wholesale", "social", "friends", "export", "none"] as const;

export const PILOT_UNITS = ["kg", "ton", "pcs", "tjs"] as const;

export type PilotUnit = (typeof PILOT_UNITS)[number];

/** Воҳиди пешфарз аз соҳа — на аз демо-мева. */
export function defaultUnitFor(category: string): PilotUnit {
  if (category === "agriculture" || category === "food" || category === "construction") return "kg";
  if (category === "services" || category === "transport") return "tjs";
  return "pcs";
}

export const PILOT_TIME = ["full", "part", "weekend"] as const;

export const PILOT_MODULE_COUNT = 6;

/** Дар модул ду савол аст — бо як ҷавоби дуруст дарс гузашта намешавад. */
export const PILOT_PASS_SCORE = 100;

/** Дарс N кушода аст, агар қаблӣ гузашта бошад ё худи ҳамин аллакай гузашта бошад. */
export function isModuleOpen(moduleId: number, completed: number[]): boolean {
  if (moduleId <= 1) return true;
  if (completed.includes(moduleId)) return true;
  return completed.includes(moduleId - 1);
}
