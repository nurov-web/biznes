import type { PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import { PILOT_MODULE_COUNT } from "@/constants/pilot";
import type { RunGuide } from "@/components/dashboard/RunBusinessGuide";

export type TodayInsight = {
  healthPct: number;
  healthWhy: string;
  mainProblem: string;
  nextHref: string;
  nextLabelKey: "toStock" | "toCrm" | "toPos" | "toFinance";
};

function guideScore(guide: RunGuide | null): number {
  if (!guide) return 0;
  let pts = 0;
  if (guide.products > 0) pts += 25;
  if (guide.clients > 0) pts += 25;
  if (guide.sales > 0) pts += 50;
  return Math.min(100, pts);
}

export function buildTodayInsight(input: {
  profile: PilotProfileRow | null;
  progressCount: number;
  chosen: boolean;
  chosenItem: PilotSuggestionItem | null;
  guide: RunGuide | null;
}): TodayInsight {
  const profile = input.profile;
  const coursePct = Math.round((input.progressCount / PILOT_MODULE_COUNT) * 100);
  const opsPct = guideScore(input.guide);
  const chosenPts = input.chosen ? 15 : 0;
  const healthPct = Math.min(100, Math.round(coursePct * 0.35 + opsPct * 0.5 + chosenPts));

  const mainProblem =
    profile?.problem?.trim() ||
    (input.chosenItem?.description?.trim() ? input.chosenItem.description : "") ||
    "";

  let nextHref = "/inventory";
  let nextLabelKey: TodayInsight["nextLabelKey"] = "toStock";
  const g = input.guide;
  if (g) {
    if (g.products <= 0) {
      nextHref = "/inventory";
      nextLabelKey = "toStock";
    } else if (g.clients <= 0) {
      nextHref = "/crm/clients";
      nextLabelKey = "toCrm";
    } else if (g.sales <= 0) {
      nextHref = "/pos";
      nextLabelKey = "toPos";
    } else {
      nextHref = "/finance";
      nextLabelKey = "toFinance";
    }
  }

  let healthWhy = "course";
  if (opsPct < 50 && g) healthWhy = "ops";
  else if (!input.chosen) healthWhy = "pickPath";
  else if (coursePct < 40) healthWhy = "course";

  return { healthPct, healthWhy, mainProblem, nextHref, nextLabelKey };
}
