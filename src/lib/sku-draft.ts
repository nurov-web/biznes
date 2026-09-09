import type { MarketSkuHint, ProductDraft } from "@/types";

/** SKU-и скани бозорро ба сатри каталог табдил медиҳад. */
export function skuToDraft(sku: MarketSkuHint): ProductDraft {
  const parts = sku.name.split(" ");
  const brand = parts[0] ?? sku.name;
  const model = parts.slice(1).join(" ") || sku.name;
  return {
    category: sku.category,
    brand,
    model,
    buyPriceMin: sku.typicalBuy,
    buyPriceMax: sku.typicalBuy,
    sellPriceMin: sku.typicalSell,
    sellPriceMax: sku.typicalSell,
    quantity: 4,
    condition: "new",
  };
}
