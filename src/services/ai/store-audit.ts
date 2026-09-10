/**
 * Аз саҳифаи кушодаи мағоза мол, хароҷот, фоида ва вақтро ҳисоб мекунад.
 * Пешгӯӣ аст, на кафолат. Ба админ ворид намешавем.
 */
import { fetchPublicShopText } from "@/lib/fetch-public-html";
import { llmLanguage, type Locale } from "@/lib/locale-query";
import { wrapOwnerMessage } from "@/lib/tajik-text";
import type { StoreAuditSku } from "@/lib/store";
import { businessSystemPrompt } from "@/services/ai/business-system";
import {
  aiConfigured,
  classifyClaudeError,
  completeClaude,
  completeClaudeWeb,
  extractJsonObject,
  type ClaudeFail,
} from "@/services/ai/claude";

export type StoreAuditResult = {
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
  aiError: ClaudeFail | null;
  pagesRead: number;
};

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function asSku(raw: unknown): StoreAuditSku | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const name = String(row.name ?? "").trim().slice(0, 80);
  if (!name) return null;
  const sell = num(row.sellPrice);
  const buy = num(row.estimatedBuy);
  const qty = num(row.monthlyQty);
  const hours = num(row.hoursPerWeek);
  const margin =
    sell > 0 ? Math.round(((sell - buy) / sell) * 100) : num(row.marginPct);
  return {
    name,
    category: String(row.category ?? "").trim().slice(0, 60),
    sellPrice: sell,
    estimatedBuy: buy,
    monthlyQty: qty,
    hoursPerWeek: hours,
    marginPct: Math.min(90, Math.max(0, margin)),
    note: String(row.note ?? "").trim().slice(0, 180),
  };
}

function emptyAudit(locale: Locale, pagesRead: number, aiError: ClaudeFail | null = "no_key"): StoreAuditResult {
  const pack = {
    tg: {
      summary: "Саҳифаи кушода хонда нашуд ё молҳо равшан набуданд. Силкаро санҷед.",
      disclaimer: "Ин ҳисоб аз саҳифаи кушода аст, на аз панели админ. Пешгӯӣ, на кафолат.",
    },
    ru: {
      summary: "Открытая страница не прочиталась или товары неясны. Проверьте ссылку.",
      disclaimer: "Расчёт с витрины, не из админки. Прогноз, не гарантия.",
    },
    en: {
      summary: "The public page could not be read or products were unclear. Check the URL.",
      disclaimer: "This is from the public shop, not admin. A forecast, not a guarantee.",
    },
  }[locale];
  return {
    summary: pack.summary,
    products: [],
    revenueMonthly: 0,
    costMonthly: 0,
    profitMonthly: 0,
    hoursMonthly: 0,
    risks: [],
    actions: [],
    disclaimer: pack.disclaimer,
    usedAi: false,
    usedWeb: false,
    aiError,
    pagesRead,
  };
}

function fromModel(raw: unknown, pagesRead: number, usedAi: boolean, usedWeb: boolean): StoreAuditResult {
  if (!raw || typeof raw !== "object") {
    return emptyAudit("tg", pagesRead, "fail");
  }
  const row = raw as Record<string, unknown>;
  const products = Array.isArray(row.products)
    ? row.products.map(asSku).filter((s): s is StoreAuditSku => Boolean(s)).slice(0, 12)
    : [];
  const revenue = products.reduce((s, p) => s + p.sellPrice * p.monthlyQty, 0);
  const cost = products.reduce((s, p) => s + p.estimatedBuy * p.monthlyQty, 0);
  const hours = products.reduce((s, p) => s + p.hoursPerWeek, 0);
  return {
    summary: String(row.summary ?? "").trim().slice(0, 600),
    products,
    revenueMonthly: num(row.revenueMonthly) || revenue,
    costMonthly: num(row.costMonthly) || cost,
    profitMonthly: num(row.profitMonthly) || Math.max(0, revenue - cost),
    hoursMonthly: num(row.hoursMonthly) || hours * 4,
    risks: Array.isArray(row.risks) ? row.risks.map((x) => String(x).slice(0, 160)).slice(0, 5) : [],
    actions: Array.isArray(row.actions) ? row.actions.map((x) => String(x).slice(0, 160)).slice(0, 5) : [],
    disclaimer: String(row.disclaimer ?? "").trim().slice(0, 280),
    usedAi,
    usedWeb,
    aiError: usedAi ? null : "fail",
    pagesRead,
  };
}

export async function auditStoreSite(input: {
  storeUrl: string;
  locale: Locale;
  focus?: string;
}): Promise<StoreAuditResult> {
  const shop = await fetchPublicShopText(input.storeUrl);
  const system = businessSystemPrompt({
    locale: input.locale,
    jsonOnly: true,
    ownerFocus: input.focus,
    ownerMessage: input.focus,
    role: "You read a public shop page (not admin). Extract products and estimate monthly cost, profit and owner hours. Label every number as an estimate. Never claim you logged into wp-admin or Shopify admin. Never scrape Somon/OLX.",
  });
  const schema = `{"summary":"","products":[{"name":"","category":"","sellPrice":0,"estimatedBuy":0,"monthlyQty":0,"hoursPerWeek":0,"marginPct":0,"note":""}],"revenueMonthly":0,"costMonthly":0,"profitMonthly":0,"hoursMonthly":0,"risks":[],"actions":[],"disclaimer":""}`;
  const ask = [
    `Public store URL: ${input.storeUrl}`,
    input.focus ? wrapOwnerMessage(input.focus) : "",
    shop.ok ? `Public page text (truncated):\n${shop.text}` : "Public HTML was empty or blocked.",
    `Reply in ${llmLanguage(input.locale)} as JSON only: ${schema}`,
    "Prices in TJS integers. estimatedBuy is true-cost guess if the page only shows shelf price.",
    "monthlyQty and hours are model estimates for a small Tajikistan shop, not measured traffic.",
    "If the page is Instagram or blocked, say so and give a cautious empty-or-thin estimate.",
  ].join("\n\n");

  if (aiConfigured()) {
    if (!shop.ok) {
      try {
        const web = await completeClaudeWeb({ system, user: ask, maxUses: 2 });
        return fromModel(extractJsonObject(web.text), shop.pagesRead, true, web.usedWeb);
      } catch (error) {
        console.warn("[store-audit] web fallback", error);
      }
    }
    try {
      const text = await completeClaude(system, ask, {
        timeoutMs: 22000,
        userLimit: 12000,
      });
      return fromModel(extractJsonObject(text), shop.pagesRead, true, false);
    } catch (error) {
      console.warn("[store-audit] claude fallback", error);
      return emptyAudit(input.locale, shop.pagesRead, classifyClaudeError(error));
    }
  }

  return emptyAudit(input.locale, shop.pagesRead, "no_key");
}
