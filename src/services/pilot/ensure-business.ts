import { businessTypeForNiche, detectNiche } from "@/lib/niche";
import { getOwnedBusiness } from "@/lib/business";
import { newId, nowIso, withDb, type PilotProfileRow } from "@/lib/store";

function parsePriceTjs(raw: string): number {
  const n = Number(String(raw ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

/** Пас аз анкета — бизнес ва (агар лозим) 1 мол барои POS/анбор. */
export async function ensurePilotBusiness(userId: string, profile: PilotProfileRow): Promise<string | null> {
  const existing = await getOwnedBusiness(userId);
  if (existing) return existing.id;

  const niche = detectNiche(profile.category, profile.subcategory, profile.product);
  const type = businessTypeForNiche(niche);
  const businessId = newId();
  const now = nowIso();
  const name = profile.product.trim() ? `Дӯкони ${profile.product.trim()}` : "Бизнеси ман";
  const city = profile.region.trim() || "—";
  const sell = parsePriceTjs(profile.price);
  const buy = sell > 0 ? Math.max(1, Math.round(sell * 0.85)) : 0;

  await withDb((db) => {
    db.businesses.push({
      id: businessId,
      ownerId: userId,
      name,
      type,
      typeNote: profile.category,
      city,
      region: profile.region,
      yearsOpen: 0,
      employees: 1,
      channel: profile.channels[0] ?? "offline",
      competitors: "",
      audience: "",
      onboardingDone: true,
      stage: "running",
      budget: 0,
      goal: profile.problem,
      experience: "",
      createdAt: now,
      updatedAt: now,
    });

    const hasProduct = db.products.some((p) => p.businessId === businessId && !p.archived);
    if (!hasProduct && profile.product.trim()) {
      db.products.push({
        id: newId(),
        businessId,
        category: profile.category || "мол",
        brand: "—",
        model: profile.product.trim().slice(0, 80),
        buyPriceMin: buy,
        buyPriceMax: buy,
        sellPriceMin: sell || buy,
        sellPriceMax: sell || buy,
        quantity: 10,
        condition: "new",
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return businessId;
}
