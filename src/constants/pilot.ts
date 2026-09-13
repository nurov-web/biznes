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

export const PILOT_TIME = ["full", "part", "weekend"] as const;

export const PILOT_MODULE_COUNT = 6;

export const PILOT_PASS_SCORE = 50;
