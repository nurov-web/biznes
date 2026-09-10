/** Нархи фурӯш дар касса ва дар сатри salesLines як хел бошад. */
export function productSellPrice(p: {
  sellPriceMin: number;
  sellPriceMax: number;
}): number {
  if (p.sellPriceMin > 0 && p.sellPriceMax > 0) {
    return Math.round((p.sellPriceMin + p.sellPriceMax) / 2);
  }
  return p.sellPriceMax || p.sellPriceMin || 0;
}

export function productBuyCost(p: {
  buyPriceMin: number;
  buyPriceMax: number;
}): number {
  return (p.buyPriceMin + p.buyPriceMax) / 2;
}
