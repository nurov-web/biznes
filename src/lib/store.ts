import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Навиштан ба диск нашуд (дар Vercel лоиҳа read-only аст). */
export class StoreWriteError extends Error {
  constructor(cause?: unknown) {
    super("STORE_WRITE_FAILED");
    this.name = "StoreWriteError";
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}

export type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  phoneVerified: boolean;
  role: string;
  offerAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SmsRow = {
  id: string;
  phone: string;
  codeHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
};

/** "running" — бизнес аллакай ҳаст; "idea" — ҳанӯз кушода нашудааст. */
export type BusinessStage = "running" | "idea";

export type BusinessRow = {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  typeNote: string;
  city: string;
  region: string;
  yearsOpen: number;
  employees: number;
  channel: string;
  competitors: string;
  audience: string;
  onboardingDone: boolean;
  stage: BusinessStage;
  budget: number;
  goal: string;
  experience: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanOption = {
  name: string;
  why: string;
  startupCost: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakEvenMonths: number;
  risk: string;
  firstSteps: string[];
  products: {
    name: string;
    supplier: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
  }[];
};

export type PlanRow = {
  id: string;
  businessId: string;
  locale: string;
  budget: number;
  city: string;
  goal: string;
  summary: string;
  options: PlanOption[];
  warnings: string[];
  usedAi: boolean;
  createdAt: string;
};

export type ProductRow = {
  id: string;
  businessId: string;
  category: string;
  brand: string;
  model: string;
  buyPriceMin: number;
  buyPriceMax: number;
  sellPriceMin: number;
  sellPriceMax: number;
  quantity: number;
  condition: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MoveRow = {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  note: string;
  createdAt: string;
};

export type CustomerRow = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string;
  tags: string;
  notes: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DealRow = {
  id: string;
  businessId: string;
  customerId: string | null;
  title: string;
  stage: string;
  amount: number;
  lostReason: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FinanceRow = {
  id: string;
  businessId: string;
  type: string;
  amount: number;
  category: string;
  note: string;
  entryDate: string;
  createdAt: string;
};

export type TaskRow = {
  id: string;
  businessId: string;
  title: string;
  dueAt: string | null;
  done: boolean;
  archived: boolean;
  createdAt: string;
};

export type AiRow = {
  id: string;
  businessId: string;
  payload: string;
  createdAt: string;
};

export type CompetitorRow = {
  id: string;
  businessId: string;
  name: string;
  product: string;
  price: number;
  promo: string;
  note: string;
  createdAt: string;
};

export type SalesLineRow = {
  id: string;
  businessId: string;
  date: string;
  sku: string;
  quantity: number;
  revenue: number;
  cost: number;
  createdAt: string;
};

export type MemoryRow = {
  id: string;
  businessId: string;
  kind: string;
  title: string;
  payload: string;
  createdAt: string;
};

export type ActionRow = {
  id: string;
  businessId: string;
  title: string;
  detail: string;
  impactMonthly: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AlertRow = {
  id: string;
  businessId: string;
  kind: "problem" | "opportunity";
  level: "high" | "medium" | "low";
  title: string;
  detail: string;
  impactMonthly: number;
  createdAt: string;
};

export type ApiKeyRow = {
  id: string;
  businessId: string;
  name: string;
  prefix: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type AuditRow = {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  createdAt: string;
};

export type Database = {
  users: UserRow[];
  smsCodes: SmsRow[];
  businesses: BusinessRow[];
  products: ProductRow[];
  movements: MoveRow[];
  customers: CustomerRow[];
  deals: DealRow[];
  financeEntries: FinanceRow[];
  tasks: TaskRow[];
  aiReports: AiRow[];
  competitors: CompetitorRow[];
  salesLines: SalesLineRow[];
  memory: MemoryRow[];
  actions: ActionRow[];
  alerts: AlertRow[];
  auditLogs: AuditRow[];
  plans: PlanRow[];
  apiKeys: ApiKeyRow[];
};

const EMPTY: Database = {
  users: [],
  smsCodes: [],
  businesses: [],
  products: [],
  movements: [],
  customers: [],
  deals: [],
  financeEntries: [],
  tasks: [],
  aiReports: [],
  competitors: [],
  salesLines: [],
  memory: [],
  actions: [],
  alerts: [],
  auditLogs: [],
  plans: [],
  apiKeys: [],
};

type StoreMemory = { __bpDb?: Database };

function dataFile(): string {
  const fromEnv = process.env.BP_DATA_FILE?.trim();
  if (fromEnv) return fromEnv;
  // Vercel: process.cwd() навишта намешавад — танҳо /tmp.
  if (process.env.VERCEL) return join("/tmp", "businesspilot-app.json");
  return join(process.cwd(), "data", "app.json");
}

function storeMemory(): StoreMemory {
  return globalThis as typeof globalThis & StoreMemory;
}

export function newId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

function hydrate(raw: Partial<Database>): Database {
  return {
    ...EMPTY,
    ...raw,
    users: raw.users ?? [],
    smsCodes: raw.smsCodes ?? [],
    products: raw.products ?? [],
    movements: raw.movements ?? [],
    customers: raw.customers ?? [],
    deals: raw.deals ?? [],
    financeEntries: raw.financeEntries ?? [],
    tasks: raw.tasks ?? [],
    aiReports: raw.aiReports ?? [],
    competitors: raw.competitors ?? [],
    salesLines: raw.salesLines ?? [],
    memory: raw.memory ?? [],
    actions: raw.actions ?? [],
    alerts: raw.alerts ?? [],
    auditLogs: raw.auditLogs ?? [],
    plans: raw.plans ?? [],
    apiKeys: raw.apiKeys ?? [],
    businesses: (raw.businesses ?? []).map((b) => ({
      ...b,
      stage: b.stage === "idea" ? "idea" : "running",
      budget: typeof b.budget === "number" ? b.budget : 0,
      goal: b.goal ?? "",
      experience: b.experience ?? "",
    })),
  };
}

function load(): Database {
  const g = storeMemory();
  if (process.env.VERCEL && g.__bpDb) return g.__bpDb;
  try {
    const raw = JSON.parse(readFileSync(dataFile(), "utf8")) as Partial<Database>;
    const db = hydrate(raw);
    if (process.env.VERCEL) g.__bpDb = db;
    return db;
  } catch {
    const empty = structuredClone(EMPTY);
    if (process.env.VERCEL) g.__bpDb = empty;
    return empty;
  }
}

function save(db: Database): void {
  if (process.env.VERCEL) storeMemory().__bpDb = db;
  const file = dataFile();
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("[store] навишта нашуд", file, error);
    // Vercel: диск read-only — ҳисоб дар хотира /tmp мемонад, 500 намедиҳем.
    if (process.env.VERCEL) return;
    throw new StoreWriteError(error);
  }
}

export function withDb<T>(fn: (db: Database) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

export function readDb(): Database {
  return load();
}
