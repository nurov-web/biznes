/**
 * Константы BusinessPilot AI — без хардкода строк в UI.
 */
export const APP_NAME = "BusinessPilot AI";

export const SESSION_COOKIE = "bp_session";
/** Почта/ҳисоб дар браузер мемонад — logout сессияро мебандад, ҳисобро не. */
export const ACCOUNT_COOKIE = "bp_account";
/** Gmail/телефон дар браузер (хонданӣ) — то ҳар дафъа аз нав нанависед. */
export const LOGIN_HINT_COOKIE = "bp_login";

/** Як маротиба дар ҷаласа: интро пас аз вуруд. */
export const SPLASH_SESSION_KEY = "bp_entry_splash";
/** Пас аз «Баромад» — саҳифаи вуруд худкор боз дарун накунад. */
export const LOGOUT_FLAG = "bp_logged_out";

export const ROLES = ["owner", "manager", "cashier"] as const;
export type Role = (typeof ROLES)[number];

export const BUSINESS_TYPES = [
  "trade",
  "service",
  "production",
  "construction",
  "it",
  "education",
  "agriculture",
  "other",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const CHANNELS = ["offline", "online", "both"] as const;
export type Channel = (typeof CHANNELS)[number];

export const PRODUCT_CONDITIONS = ["new", "used"] as const;

export const DEAL_STAGES = [
  "lead",
  "contact",
  "negotiate",
  "won",
  "lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const CUSTOMER_TAGS = ["vip", "regular", "once"] as const;

export const FINANCE_CATEGORIES = ["sales", "store_buy", "cogs", "rent", "salary", "other"] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];

export const CITIES_TJ = [
  "Душанбе",
  "Хуҷанд",
  "Бохтар",
  "Кӯлоб",
  "Истаравшан",
  "Панҷакент",
  "Ҳисор",
  "Турсунзода",
] as const;

export const LOW_STOCK_THRESHOLD = 3;

export const TARIFFS = [
  {
    id: "starter",
    priceTjs: 99,
    products: 100,
    clients: 50,
    users: 1,
  },
  {
    id: "business",
    priceTjs: 249,
    products: null,
    clients: 500,
    users: 5,
  },
  {
    id: "pro",
    priceTjs: 499,
    products: null,
    clients: null,
    users: null,
  },
] as const;

export const TRIAL_DAYS = 14;
