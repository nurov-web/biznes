import { nowIso, withDb } from "@/lib/store";

const DEFAULT_DAILY = 20;

/** Лимити рӯзонаи зангҳои AI барои як ҳисоб. */
export async function consumeAiQuota(
  userId: string,
  max = DEFAULT_DAILY,
): Promise<boolean> {
  const today = nowIso().slice(0, 10);
  return withDb((db) => {
    const user = db.users.find((row) => row.id === userId);
    if (!user) return false;
    if (user.aiCallsDate !== today) {
      user.aiCallsDate = today;
      user.aiCallsCount = 0;
    }
    if (user.aiCallsCount >= max) return false;
    user.aiCallsCount += 1;
    user.updatedAt = nowIso();
    return true;
  });
}
