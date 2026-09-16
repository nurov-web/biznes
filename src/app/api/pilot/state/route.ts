/**
 * GET /api/pilot/state — профил, пешниҳодҳо, курс, нақша.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isEphemeralStore } from "@/lib/store";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import {
  getPilotProfile,
  latestPlan,
  latestSuggestions,
  listCompletedModules,
  listCourseRows,
  listDayLogs,
  listWeekMarks,
} from "@/services/pilot";
import { latestShopPulse } from "@/services/shop-pulse";
import { ensurePilotBusiness } from "@/services/pilot/ensure-business";

export async function GET() {
  try {
    const user = await requireUser();
    const profileEarly = await getPilotProfile(user.id);
    if (profileEarly) {
      await ensurePilotBusiness(user.id, profileEarly).catch((error) => {
        console.error("[pilot/state/business]", error instanceof Error ? error.message : "fail");
      });
    }
    const [profile, suggestions, plan, progress, course, logs, weekDone, pulse] = await Promise.all([
      getPilotProfile(user.id),
      latestSuggestions(user.id),
      latestPlan(user.id),
      listCompletedModules(user.id),
      listCourseRows(user.id),
      listDayLogs(user.id),
      listWeekMarks(user.id),
      latestShopPulse(user.id),
    ]);
    return NextResponse.json({
      profile,
      suggestions: suggestions?.items ?? [],
      chosenIndex: suggestions?.chosenIndex ?? null,
      plan: plan?.content ?? "",
      planDate: plan?.createdAt ?? "",
      progress,
      course: course.map((row) => ({
        moduleId: row.moduleId,
        score: row.score,
        completedAt: row.completedAt,
      })),
      logs: logs.map((row) => ({ date: row.date, sold: row.sold })),
      weekDone,
      pulse,
      ephemeralStore: isEphemeralStore(),
    });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
