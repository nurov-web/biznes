import type { ShopPlatform } from "@/lib/shop-link";

export type MetricSource = "page" | "owner";

export type ShopPulse = {
  url: string;
  platform: ShopPlatform;
  title: string;
  sold: number | null;
  refused: number | null;
  complaints: number | null;
  reviews: number | null;
  rating: number | null;
  returnPct: number | null;
  catalogProducts: number | null;
  catalogReviews: number | null;
  catalogShops: number | null;
  locked: string[];
  soldSource: MetricSource | null;
  refusedSource: MetricSource | null;
  complaintsSource: MetricSource | null;
  status: "read" | "walled" | "empty" | "blocked";
  fetchedAt: string;
};
