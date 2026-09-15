import { newId, nowIso, readDb, withDb } from "@/lib/store";
import type { PilotShopPulseRow } from "@/lib/store";
import { SHOP_PLATFORMS, type ShopPlatform } from "@/lib/shop-link";
import type { ShopPulse } from "@/types/shop-pulse";

export type { ShopPulse, OwnerShopCounts } from "@/services/shop-pulse/read";
export { pulseFacts, readShopPulse, emptyPulse } from "@/services/shop-pulse/read";

function asPlatform(value: string): ShopPlatform {
  return (SHOP_PLATFORMS as readonly string[]).includes(value)
    ? (value as ShopPlatform)
    : "website";
}

function toPublic(row: PilotShopPulseRow): ShopPulse {
  return {
    url: row.url,
    platform: asPlatform(row.platform),
    title: row.title,
    sold: row.sold,
    refused: row.refused,
    complaints: row.complaints,
    reviews: row.reviews,
    rating: row.rating,
    returnPct: row.returnPct,
    catalogProducts: row.catalogProducts ?? null,
    catalogReviews: row.catalogReviews ?? null,
    catalogShops: row.catalogShops ?? null,
    locked: Array.isArray(row.locked) ? row.locked.filter((item) => typeof item === "string") : [],
    soldSource: row.soldSource === "owner" || row.soldSource === "page" ? row.soldSource : null,
    refusedSource:
      row.refusedSource === "owner" || row.refusedSource === "page" ? row.refusedSource : null,
    complaintsSource:
      row.complaintsSource === "owner" || row.complaintsSource === "page"
        ? row.complaintsSource
        : null,
    status:
      row.status === "read" ||
      row.status === "walled" ||
      row.status === "empty" ||
      row.status === "blocked"
        ? row.status
        : "empty",
    fetchedAt: row.fetchedAt,
  };
}

export async function latestShopPulse(userId: string): Promise<ShopPulse | null> {
  const db = await readDb();
  const rows = (db.pilotShopPulses ?? []).filter((row) => row.userId === userId);
  const last = rows.sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];
  return last ? toPublic(last) : null;
}

export async function saveShopPulse(userId: string, pulse: ShopPulse): Promise<ShopPulse> {
  const now = nowIso();
  const row: PilotShopPulseRow = {
    id: newId(),
    userId,
    url: pulse.url,
    platform: pulse.platform,
    title: pulse.title,
    sold: pulse.sold,
    refused: pulse.refused,
    complaints: pulse.complaints,
    reviews: pulse.reviews,
    rating: pulse.rating,
    returnPct: pulse.returnPct,
    soldSource: pulse.soldSource,
    refusedSource: pulse.refusedSource,
    complaintsSource: pulse.complaintsSource,
    catalogProducts: pulse.catalogProducts,
    catalogReviews: pulse.catalogReviews,
    catalogShops: pulse.catalogShops,
    locked: pulse.locked,
    status: pulse.status,
    fetchedAt: pulse.fetchedAt || now,
    createdAt: now,
  };
  await withDb((db) => {
    db.pilotShopPulses ??= [];
    const rest = db.pilotShopPulses.filter((item) => item.userId !== userId);
    rest.push(row);
    db.pilotShopPulses = rest;
  });
  return toPublic(row);
}
