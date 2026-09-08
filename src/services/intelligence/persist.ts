import {
  newId,
  nowIso,
  withDb,
  type ActionRow,
  type BusinessRow,
  type CompetitorRow,
  type MemoryRow,
} from "@/lib/store";
import {
  buildIntelligence,
  type IntelligenceSnapshot,
  type Locale,
} from "@/services/intelligence/engine";

export type IntelligencePayload = IntelligenceSnapshot & {
  actions: ActionRow[];
  memory: MemoryRow[];
  salesCount: number;
  competitorRows: CompetitorRow[];
};

function seedCompetitors(business: BusinessRow, existing: CompetitorRow[]): CompetitorRow[] {
  if (existing.length) return [];
  return business.competitors
    .split(/[,;]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      id: newId(),
      businessId: business.id,
      name,
      product: "",
      price: 0,
      promo: "",
      note: "",
      createdAt: nowIso(),
    }));
}

export function syncIntelligence(
  businessId: string,
  locale: Locale,
  userId: string,
): IntelligencePayload {
  return withDb((db) => {
    const business = db.businesses.find((b) => b.id === businessId);
    if (!business) throw new Error("NO_BUSINESS");
    const seeded = seedCompetitors(
      business,
      db.competitors.filter((c) => c.businessId === businessId),
    );
    db.competitors.push(...seeded);
    const snap = buildIntelligence(db, business, locale);
    db.alerts = db.alerts.filter((a) => a.businessId !== businessId);
    for (const alert of snap.alerts) {
      db.alerts.push({
        id: newId(),
        businessId,
        kind: alert.kind,
        level: alert.level,
        title: alert.title,
        detail: alert.detail,
        impactMonthly: alert.impactMonthly,
        createdAt: nowIso(),
      });
    }
    const day = nowIso().slice(0, 10);
    const hasDaily = db.memory.some(
      (m) => m.businessId === businessId && m.kind === "daily" && m.createdAt.startsWith(day),
    );
    if (!hasDaily) {
      db.memory.push({
        id: newId(),
        businessId,
        kind: "daily",
        title: snap.happened.slice(0, 120),
        payload: JSON.stringify({
          healthScore: snap.healthScore,
          revenue: snap.revenue,
          profit: snap.profit,
          marginPct: snap.marginPct,
        }),
        createdAt: nowIso(),
      });
    }
    db.auditLogs.push({
      id: newId(),
      businessId,
      userId,
      action: "intelligence.read",
      createdAt: nowIso(),
    });
    if (db.auditLogs.length > 400) {
      db.auditLogs = db.auditLogs.slice(-300);
    }
    const newer = (a: { createdAt: string }, b: { createdAt: string }) =>
      b.createdAt.localeCompare(a.createdAt);
    return {
      ...snap,
      actions: db.actions.filter((a) => a.businessId === businessId).sort(newer).slice(0, 40),
      memory: db.memory.filter((m) => m.businessId === businessId).sort(newer).slice(0, 24),
      salesCount: db.salesLines.filter((s) => s.businessId === businessId).length,
      competitorRows: db.competitors.filter((c) => c.businessId === businessId),
    };
  });
}

export function addMemory(
  businessId: string,
  kind: string,
  title: string,
  payload: unknown,
): MemoryRow {
  return withDb((db) => {
    const row: MemoryRow = {
      id: newId(),
      businessId,
      kind,
      title,
      payload: JSON.stringify(payload),
      createdAt: nowIso(),
    };
    db.memory.push(row);
    return row;
  });
}

export function addAction(
  businessId: string,
  title: string,
  detail: string,
  impactMonthly: number,
): ActionRow {
  return withDb((db) => {
    const existing = db.actions.find(
      (a) => a.businessId === businessId && a.title === title && a.status === "pending",
    );
    if (existing) return existing;
    const row: ActionRow = {
      id: newId(),
      businessId,
      title,
      detail,
      impactMonthly,
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.actions.push(row);
    return row;
  });
}

export function addAudit(businessId: string, userId: string, action: string): void {
  withDb((db) => {
    db.auditLogs.push({
      id: newId(),
      businessId,
      userId,
      action,
      createdAt: nowIso(),
    });
  });
}
