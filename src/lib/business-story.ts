import type { PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import type { RunGuide } from "@/components/dashboard/RunBusinessGuide";

export type StoryTone = "ok" | "watch" | "alert" | "info";

export type StoryCase =
  | "needPath"
  | "needProducts"
  | "needCustomers"
  | "needSale"
  | "quietDay"
  | "onTrack";

export type BusinessStory = {
  healthPct: number;
  tone: StoryTone;
  caseId: StoryCase;
  doHref: string;
  doKey: "toSuggestions" | "toStock" | "toCrm" | "toPos" | "toFinance";
  progressDone: number;
  progressGoal: number;
  notEnough: boolean;
  todaySales: number;
  productCount: number;
  clientCount: number;
  saleCount: number;
  mainProblem: string;
};

function cleanProblem(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  if (/time:|skills:/i.test(text)) return "";
  return text;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Хулоса аз рақами ҳақиқӣ — бе EBITDA ва бе дӯкони намуна. */
export function buildBusinessStory(input: {
  profile: PilotProfileRow | null;
  chosen: boolean;
  chosenItem: PilotSuggestionItem | null;
  guide: RunGuide | null;
  todaySales: number;
}): BusinessStory {
  const g = input.guide;
  const products = g?.products ?? 0;
  const clients = g?.clients ?? 0;
  const sales = g?.sales ?? 0;
  const ops = (products > 0 ? 25 : 0) + (clients > 0 ? 25 : 0) + (sales > 0 ? 40 : 0) + (input.chosen ? 10 : 0);
  const healthPct = clampPct(ops);
  const mainProblem = cleanProblem(input.profile?.problem ?? "") || cleanProblem(input.chosenItem?.title ?? "");

  if (!input.chosen) {
    return {
      healthPct,
      tone: "watch",
      caseId: "needPath",
      doHref: "/suggestions",
      doKey: "toSuggestions",
      progressDone: 0,
      progressGoal: 1,
      notEnough: true,
      todaySales: input.todaySales,
      productCount: products,
      clientCount: clients,
      saleCount: sales,
      mainProblem,
    };
  }
  if (products <= 0) {
    return {
      healthPct,
      tone: "alert",
      caseId: "needProducts",
      doHref: "/inventory",
      doKey: "toStock",
      progressDone: 0,
      progressGoal: 1,
      notEnough: true,
      todaySales: input.todaySales,
      productCount: products,
      clientCount: clients,
      saleCount: sales,
      mainProblem,
    };
  }
  if (clients <= 0) {
    return {
      healthPct,
      tone: "watch",
      caseId: "needCustomers",
      doHref: "/crm",
      doKey: "toCrm",
      progressDone: 1,
      progressGoal: 3,
      notEnough: true,
      todaySales: input.todaySales,
      productCount: products,
      clientCount: clients,
      saleCount: sales,
      mainProblem,
    };
  }
  if (sales <= 0) {
    return {
      healthPct,
      tone: "watch",
      caseId: "needSale",
      doHref: "/pos",
      doKey: "toPos",
      progressDone: 2,
      progressGoal: 3,
      notEnough: true,
      todaySales: input.todaySales,
      productCount: products,
      clientCount: clients,
      saleCount: sales,
      mainProblem,
    };
  }
  if (input.todaySales <= 0) {
    return {
      healthPct,
      tone: "watch",
      caseId: "quietDay",
      doHref: "/pos",
      doKey: "toPos",
      progressDone: sales,
      progressGoal: Math.max(sales + 3, 10),
      notEnough: false,
      todaySales: input.todaySales,
      productCount: products,
      clientCount: clients,
      saleCount: sales,
      mainProblem,
    };
  }
  return {
    healthPct,
    tone: "ok",
    caseId: "onTrack",
    doHref: "/finance",
    doKey: "toFinance",
    progressDone: sales,
    progressGoal: Math.max(sales, 10),
    notEnough: false,
    todaySales: input.todaySales,
    productCount: products,
    clientCount: clients,
    saleCount: sales,
    mainProblem,
  };
}
