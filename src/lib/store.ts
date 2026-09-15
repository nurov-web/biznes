import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Prisma } from "@prisma/client";
import type { StorePlatform } from "@/constants/store";
import type { ChannelKind } from "@/constants/channels";
import { isPostgresConfigured, prisma } from "@/lib/prisma";

export { STORE_PLATFORMS, type StorePlatform } from "@/constants/store";

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
  /** Рӯзи лимити AI (YYYY-MM-DD). */
  aiCallsDate: string;
  aiCallsCount: number;
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

/** "running" — бизнес аллакай ҳаст; "idea" — ҳанӯз кушода نشدهаст. */
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
  productId: string | null;
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
  dealId: string | null;
  customerId: string | null;
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

/** Пайвасти мағоза — парол танҳо hash, ҳеҷ гоҳ матн. */
export type StoreConnectionRow = {
  id: string;
  businessId: string;
  storeUrl: string;
  platform: StorePlatform;
  login: string;
  passwordHash: string;
  status: "connected" | "skipped";
  reachable: boolean;
  lastCheckAt: string;
  apiKeyId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LearnDiagnosis = {
  answers: number[];
  profile: string;
  title: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  focusUnitIds: string[];
  firstAdvice: string;
  courseLead: string;
  usedAi: boolean;
  aiError: string | null;
  createdAt: string;
};

export type LearnProgressRow = {
  id: string;
  businessId: string;
  userId: string;
  xp: number;
  streak: number;
  lastLessonAt: string | null;
  completedLessonIds: string[];
  diagnosis: LearnDiagnosis | null;
  createdAt: string;
  updatedAt: string;
};

export type StoreAuditSku = {
  name: string;
  category: string;
  sellPrice: number;
  estimatedBuy: number;
  monthlyQty: number;
  hoursPerWeek: number;
  marginPct: number;
  note: string;
};

export type StoreAuditRow = {
  id: string;
  businessId: string;
  storeUrl: string;
  summary: string;
  products: StoreAuditSku[];
  revenueMonthly: number;
  costMonthly: number;
  profitMonthly: number;
  hoursMonthly: number;
  risks: string[];
  actions: string[];
  disclaimer: string;
  usedAi: boolean;
  usedWeb: boolean;
  aiError: string | null;
  pagesRead: number;
  importedAt: string | null;
  createdAt: string;
};

export type AuditRow = {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  createdAt: string;
};

export { CHANNEL_KINDS, type ChannelKind } from "@/constants/channels";

export type ChannelLinkRow = {
  id: string;
  businessId: string;
  kind: ChannelKind;
  url: string;
  createdAt: string;
};

export type PilotKind = "has_business" | "starting";
export type PilotDifficulty = "easy" | "medium" | "hard";

export type PilotProfileRow = {
  id: string;
  userId: string;
  kind: PilotKind;
  category: string;
  subcategory: string;
  product: string;
  region: string;
  volume: string;
  price: string;
  channels: string[];
  problem: string;
  shopUrl: string;
  createdAt: string;
};

export type PilotSuggestionItem = {
  title: string;
  description: string;
  /** Қадамҳои кор — агар нест, аз description ҷудо мешавад. */
  steps?: string[];
  difficulty: PilotDifficulty;
  potentialSomoni: number;
};

export type PilotSuggestionRow = {
  id: string;
  userId: string;
  profileId: string | null;
  items: PilotSuggestionItem[];
  chosenIndex: number | null;
  createdAt: string;
};

export type PilotPlanRow = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type PilotCourseRow = {
  id: string;
  userId: string;
  moduleId: number;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
};

/** Фурӯши як рӯз — рақами воқеӣ, на пешгӯӣ. */
export type PilotDayLogRow = {
  id: string;
  userId: string;
  date: string;
  sold: number;
  createdAt: string;
  updatedAt: string;
};

/** Қадами ҳафтаи нақша иҷро шуд. */
export type PilotWeekMarkRow = {
  id: string;
  userId: string;
  date: string;
  createdAt: string;
};

/** Хониши витринаи соҳиб — рақами саҳифа ё кабинет, на демо. */
export type PilotShopPulseRow = {
  id: string;
  userId: string;
  url: string;
  platform: string;
  title: string;
  sold: number | null;
  refused: number | null;
  complaints: number | null;
  reviews: number | null;
  rating: number | null;
  returnPct: number | null;
  soldSource: string | null;
  refusedSource: string | null;
  complaintsSource: string | null;
  catalogProducts: number | null;
  catalogReviews: number | null;
  catalogShops: number | null;
  locked: string[];
  status: string;
  fetchedAt: string;
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
  storeConnections: StoreConnectionRow[];
  learnProgress: LearnProgressRow[];
  storeAudits: StoreAuditRow[];
  channelLinks: ChannelLinkRow[];
  pilotProfiles: PilotProfileRow[];
  pilotSuggestions: PilotSuggestionRow[];
  pilotPlans: PilotPlanRow[];
  pilotCourse: PilotCourseRow[];
  pilotDayLogs: PilotDayLogRow[];
  pilotWeekMarks: PilotWeekMarkRow[];
  pilotShopPulses: PilotShopPulseRow[];
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
  storeConnections: [],
  learnProgress: [],
  storeAudits: [],
  channelLinks: [],
  pilotProfiles: [],
  pilotSuggestions: [],
  pilotPlans: [],
  pilotCourse: [],
  pilotDayLogs: [],
  pilotWeekMarks: [],
  pilotShopPulses: [],
};

type StoreMemory = { __bpDb?: Database };

function dataFile(): string {
  const fromEnv = process.env.BP_DATA_FILE?.trim();
  if (fromEnv) return fromEnv;
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
    users: (raw.users ?? []).map((user) => ({
      ...user,
      aiCallsDate: user.aiCallsDate ?? "",
      aiCallsCount: typeof user.aiCallsCount === "number" ? user.aiCallsCount : 0,
    })),
    smsCodes: raw.smsCodes ?? [],
    products: raw.products ?? [],
    movements: raw.movements ?? [],
    customers: raw.customers ?? [],
    deals: (raw.deals ?? []).map((row) => ({
      ...row,
      customerId: row.customerId ?? null,
      productId: row.productId ?? null,
    })),
    financeEntries: raw.financeEntries ?? [],
    tasks: raw.tasks ?? [],
    aiReports: raw.aiReports ?? [],
    competitors: raw.competitors ?? [],
    salesLines: (raw.salesLines ?? []).map((row) => ({
      ...row,
      dealId: row.dealId ?? null,
      customerId: row.customerId ?? null,
    })),
    memory: raw.memory ?? [],
    actions: raw.actions ?? [],
    alerts: raw.alerts ?? [],
    auditLogs: raw.auditLogs ?? [],
    plans: raw.plans ?? [],
    apiKeys: raw.apiKeys ?? [],
    storeConnections: raw.storeConnections ?? [],
    learnProgress: (raw.learnProgress ?? []).map((row) => ({
      ...row,
      diagnosis: row.diagnosis
        ? { ...row.diagnosis, aiError: row.diagnosis.aiError ?? null }
        : null,
    })),
    storeAudits: (raw.storeAudits ?? []).map((row) => ({
      ...row,
      aiError: row.aiError ?? null,
    })),
    channelLinks: raw.channelLinks ?? [],
    pilotSuggestions: (raw.pilotSuggestions ?? []).map((row) => ({
      ...row,
      profileId: row.profileId ?? null,
      chosenIndex: row.chosenIndex ?? null,
    })),
    pilotPlans: raw.pilotPlans ?? [],
    pilotCourse: raw.pilotCourse ?? [],
    pilotDayLogs: raw.pilotDayLogs ?? [],
    pilotWeekMarks: raw.pilotWeekMarks ?? [],
    pilotShopPulses: (raw.pilotShopPulses ?? []).map((row) => ({
      ...row,
      catalogProducts: row.catalogProducts ?? null,
      catalogReviews: row.catalogReviews ?? null,
      catalogShops: row.catalogShops ?? null,
      locked: Array.isArray(row.locked) ? row.locked : [],
    })),
    pilotProfiles: (raw.pilotProfiles ?? []).map((row) => ({
      ...row,
      shopUrl: row.shopUrl ?? "",
    })),
    businesses: (raw.businesses ?? []).map((b) => ({
      ...b,
      stage: b.stage === "idea" ? "idea" : "running",
      budget: typeof b.budget === "number" ? b.budget : 0,
      goal: b.goal ?? "",
      experience: b.experience ?? "",
    })),
  };
}

function loadFromFile(): Database {
  try {
    const raw = JSON.parse(readFileSync(dataFile(), "utf8")) as Partial<Database>;
    return hydrate(raw);
  } catch {
    return structuredClone(EMPTY);
  }
}

/** Ҳамон сохтор, ки дар prisma/migrations аст. */
const CREATE_SNAPSHOT_TABLE = `CREATE TABLE IF NOT EXISTS "AppSnapshot" (
  "id" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSnapshot_pkey" PRIMARY KEY ("id")
)`;

/** P2021 — ҷадвал нест. */
function isMissingTable(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === "P2021";
}

/**
 * Агар `prisma migrate deploy` иҷро нашуда бошад, ҷадвалро худамон месозем.
 * Ҳамин тавр дар Vercel танҳо DATABASE_URL кифоя аст — бе build-и нав.
 */
async function withSnapshotTable<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!prisma || !isMissingTable(error)) throw error;
    await prisma.$executeRawUnsafe(CREATE_SNAPSHOT_TABLE);
    return fn();
  }
}

async function load(): Promise<Database> {
  const g = storeMemory();

  if (isPostgresConfigured() && prisma) {
    if (g.__bpDb) return g.__bpDb;
    const client = prisma;
    try {
      const snap = await withSnapshotTable(() =>
        client.appSnapshot.findUnique({
          where: { id: "global" },
        }),
      );
      if (snap && snap.payload) {
        const raw = snap.payload as unknown as Partial<Database>;
        const db = hydrate(raw);
        g.__bpDb = db;
        return db;
      }
    } catch (error) {
      console.error("[store] Хатогии хондани PostgreSQL Snapshot:", error);
    }
    const fileDb = loadFromFile();
    g.__bpDb = fileDb;
    return fileDb;
  }

  if (process.env.VERCEL && g.__bpDb) return g.__bpDb;
  const db = loadFromFile();
  if (process.env.VERCEL) g.__bpDb = db;
  return db;
}

function writeLocalFile(db: Database): void {
  const file = dataFile();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
}

function rowTime(row: { updatedAt?: string; createdAt?: string }): string {
  return row.updatedAt || row.createdAt || "";
}

function mergeRows<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  local: T[],
  remote: T[],
): T[] {
  const map = new Map<string, T>();
  for (const row of remote) map.set(row.id, row);
  for (const row of local) {
    const prev = map.get(row.id);
    if (!prev || rowTime(row) >= rowTime(prev)) map.set(row.id, row);
  }
  return [...map.values()];
}

function pickUser(a: UserRow, b: UserRow): UserRow {
  const newer = rowTime(a) >= rowTime(b) ? a : b;
  const older = newer === a ? b : a;
  return {
    ...older,
    ...newer,
    passwordHash: newer.passwordHash || older.passwordHash,
    phoneVerified: newer.phoneVerified || older.phoneVerified,
    firstName: newer.firstName || older.firstName,
    lastName: newer.lastName || older.lastName,
    phone: newer.phone || older.phone,
  };
}

function mergeUsers(local: UserRow[], remote: UserRow[]): UserRow[] {
  const byId = new Map<string, UserRow>();
  for (const user of [...remote, ...local]) {
    const prev = byId.get(user.id);
    byId.set(user.id, prev ? pickUser(prev, user) : user);
  }
  const byEmail = new Map<string, UserRow>();
  const noEmail: UserRow[] = [];
  for (const user of byId.values()) {
    const email = user.email.trim().toLowerCase();
    if (!email) {
      noEmail.push(user);
      continue;
    }
    const prev = byEmail.get(email);
    byEmail.set(email, prev ? pickUser(prev, user) : user);
  }
  return [...byEmail.values(), ...noEmail];
}

/** Ду инстанс якҷоя навишта натавонанд ҳисобро пок кунанд. */
function mergeSnapshots(local: Database, remote: Database): Database {
  return {
    ...local,
    users: mergeUsers(local.users, remote.users),
    businesses: mergeRows(local.businesses, remote.businesses),
    products: mergeRows(local.products, remote.products),
    customers: mergeRows(local.customers, remote.customers),
    deals: mergeRows(local.deals, remote.deals),
    financeEntries: mergeRows(local.financeEntries, remote.financeEntries),
    salesLines: mergeRows(local.salesLines, remote.salesLines),
    movements: mergeRows(local.movements, remote.movements),
    tasks: mergeRows(local.tasks, remote.tasks),
    competitors: mergeRows(local.competitors, remote.competitors),
    memory: mergeRows(local.memory, remote.memory),
    actions: mergeRows(local.actions, remote.actions),
    alerts: mergeRows(local.alerts, remote.alerts),
    auditLogs: mergeRows(local.auditLogs, remote.auditLogs),
    plans: mergeRows(local.plans, remote.plans),
    apiKeys: mergeRows(local.apiKeys, remote.apiKeys),
    storeConnections: mergeRows(local.storeConnections, remote.storeConnections),
    learnProgress: mergeRows(local.learnProgress, remote.learnProgress),
    storeAudits: mergeRows(local.storeAudits, remote.storeAudits),
    channelLinks: mergeRows(local.channelLinks, remote.channelLinks),
    aiReports: mergeRows(local.aiReports, remote.aiReports),
    smsCodes: mergeRows(local.smsCodes, remote.smsCodes),
    pilotProfiles: mergeRows(local.pilotProfiles, remote.pilotProfiles),
    pilotSuggestions: mergeRows(local.pilotSuggestions, remote.pilotSuggestions),
    pilotPlans: mergeRows(local.pilotPlans, remote.pilotPlans),
    pilotCourse: mergeRows(local.pilotCourse, remote.pilotCourse),
    pilotDayLogs: mergeRows(local.pilotDayLogs, remote.pilotDayLogs),
    pilotWeekMarks: mergeRows(local.pilotWeekMarks, remote.pilotWeekMarks),
    pilotShopPulses: mergeRows(local.pilotShopPulses, remote.pilotShopPulses),
  };
}

async function save(db: Database): Promise<void> {
  const g = storeMemory();
  g.__bpDb = db;

  if (isPostgresConfigured() && prisma) {
    const client = prisma;
    try {
      const snap = await withSnapshotTable(() =>
        client.appSnapshot.findUnique({ where: { id: "global" } }),
      );
      if (snap?.payload) {
        const merged = mergeSnapshots(db, hydrate(snap.payload as unknown as Partial<Database>));
        Object.assign(db, merged);
        g.__bpDb = db;
      }
      await withSnapshotTable(() =>
        client.appSnapshot.upsert({
          where: { id: "global" },
          create: {
            id: "global",
            payload: db as unknown as Prisma.InputJsonValue,
          },
          update: {
            payload: db as unknown as Prisma.InputJsonValue,
          },
        }),
      );
      if (!process.env.VERCEL) {
        try {
          writeLocalFile(db);
        } catch (error) {
          console.error("[store] нусхаи файл навишта нашуд", error);
        }
      }
      return;
    } catch (error) {
      console.error("[store] Хатогии навиштани PostgreSQL Snapshot:", error);
      // Дар Vercel /tmp-ро «муваффақ» ҳисоб намекунем — маълумот пас аз sleep гум мешавад.
      if (process.env.VERCEL) {
        g.__bpDb = undefined;
        throw new StoreWriteError(error);
      }
    }
  }

  try {
    writeLocalFile(db);
  } catch (error) {
    console.error("[store] навишта нашуд", dataFile(), error);
    if (process.env.VERCEL) return;
    throw new StoreWriteError(error);
  }
}

export async function withDb<T>(
  fn: (db: Database) => T | Promise<T>
): Promise<T> {
  const db = await load();
  try {
    const result = await fn(db);
    await save(db);
    return result;
  } catch (error) {
    storeMemory().__bpDb = undefined;
    throw error;
  }
}

export async function readDb(): Promise<Database> {
  return load();
}

/** Vercel: /tmp + хотира танҳо вақте истифода мешавад, ки PostgreSQL танзим нашуда бошад. */
export function isEphemeralStore(): boolean {
  return Boolean(process.env.VERCEL && !isPostgresConfigured());
}
