"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";

export type IntelAlert = {
  kind: "problem" | "opportunity";
  level: "high" | "medium" | "low";
  title: string;
  detail: string;
  impactMonthly: number;
};

export type IntelPrice = {
  sku: string;
  trueCost: number;
  currentSell: number;
  competitorPrice: number | null;
  recommended: number;
  marginPct: number;
  elasticity: number;
  why: string;
  monthlyImpact: number;
};

export type IntelSnap = {
  businessName: string;
  city: string;
  businessType: string;
  currency: string;
  dataQuality: number;
  healthScore: number;
  revenue: number;
  profit: number;
  marginPct: number;
  cashFlow: number;
  happened: string;
  why: string;
  willHappen: string;
  shouldDo: string;
  kpis: { key: string; label: string; value: number; unit: string }[];
  market: {
    sizeNote: string;
    demand: string;
    season: string;
    productTrend: string;
    industry: string;
    customer: string;
  };
  competitors: { name: string; product: string; price: number; promo: string; vsUs: string }[];
  prices: IntelPrice[];
  inventory: {
    sku: string;
    quantity: number;
    status: "ok" | "low" | "dead" | "over";
    forecast: string;
    reorder: number;
  }[];
  alerts: IntelAlert[];
  disclaimer: string;
  actions: {
    id: string;
    title: string;
    detail: string;
    impactMonthly: number;
    status: string;
    createdAt: string;
  }[];
  memory: { id: string; kind: string; title: string; createdAt: string }[];
  salesCount: number;
  competitorRows: { id: string; name: string; product: string; price: number; promo: string; note: string }[];
};

export function useIntelligence() {
  const locale = useLocale();
  const [data, setData] = useState<IntelSnap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/intelligence?locale=${locale}`);
      if (!response.ok) throw new Error("fail");
      const json = (await response.json()) as { data: IntelSnap };
      setData(json.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, locale };
}

export function money(n: number): string {
  return `${n.toLocaleString("ru-RU")} TJS`;
}

export function healthTone(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 45) return "text-warning";
  return "text-destructive";
}
