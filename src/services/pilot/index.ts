import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type {
  PilotCourseRow,
  PilotKind,
  PilotPlanRow,
  PilotProfileRow,
  PilotSuggestionItem,
  PilotSuggestionRow,
} from "@/lib/store";
import { PILOT_MODULE_COUNT, PILOT_PASS_SCORE } from "@/constants/pilot";

export async function getPilotProfile(userId: string): Promise<PilotProfileRow | null> {
  const rows = (await readDb()).pilotProfiles.filter((p) => p.userId === userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export async function savePilotProfile(
  userId: string,
  data: {
    kind: PilotKind;
    category: string;
    subcategory?: string;
    product: string;
    region: string;
    volume: string;
    price: string;
    channels?: string[];
    problem?: string;
  },
): Promise<PilotProfileRow> {
  const now = nowIso();
  const row: PilotProfileRow = {
    id: newId(),
    userId,
    kind: data.kind,
    category: data.category,
    subcategory: data.subcategory ?? "",
    product: data.product,
    region: data.region,
    volume: data.volume,
    price: data.price,
    channels: data.channels ?? [],
    problem: data.problem ?? "",
    createdAt: now,
  };
  await withDb((db) => {
    db.pilotProfiles.push(row);
  });
  return row;
}

export async function saveSuggestions(
  userId: string,
  profileId: string | null,
  items: PilotSuggestionItem[],
): Promise<PilotSuggestionRow> {
  const row: PilotSuggestionRow = {
    id: newId(),
    userId,
    profileId,
    items,
    chosenIndex: null,
    createdAt: nowIso(),
  };
  await withDb((db) => {
    db.pilotSuggestions.push(row);
  });
  return row;
}

export async function latestSuggestions(userId: string): Promise<PilotSuggestionRow | null> {
  const rows = (await readDb()).pilotSuggestions.filter((s) => s.userId === userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export async function chooseSuggestion(userId: string, index: number): Promise<PilotSuggestionRow | null> {
  return withDb((db) => {
    const rows = db.pilotSuggestions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const row = rows[0];
    if (!row) return null;
    if (index < 0 || index >= row.items.length) return null;
    row.chosenIndex = index;
    return row;
  });
}

export async function savePlan(userId: string, content: string): Promise<PilotPlanRow> {
  const row: PilotPlanRow = {
    id: newId(),
    userId,
    content,
    createdAt: nowIso(),
  };
  await withDb((db) => {
    db.pilotPlans.push(row);
  });
  return row;
}

export async function latestPlan(userId: string): Promise<PilotPlanRow | null> {
  const rows = (await readDb()).pilotPlans.filter((p) => p.userId === userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export async function listCompletedModules(userId: string): Promise<number[]> {
  return (await readDb()).pilotCourse
    .filter((c) => c.userId === userId && c.completed)
    .map((c) => c.moduleId);
}

export async function completeModule(
  userId: string,
  moduleId: number,
  score: number,
): Promise<PilotCourseRow | null> {
  if (moduleId < 1 || moduleId > PILOT_MODULE_COUNT) return null;
  if (score < PILOT_PASS_SCORE) return null;
  const now = nowIso();
  return withDb((db) => {
    const existing = db.pilotCourse.find((c) => c.userId === userId && c.moduleId === moduleId);
    if (existing) {
      existing.completed = true;
      existing.score = score;
      existing.completedAt = now;
      return existing;
    }
    const row: PilotCourseRow = {
      id: newId(),
      userId,
      moduleId,
      completed: true,
      score,
      completedAt: now,
    };
    db.pilotCourse.push(row);
    return row;
  });
}
