"use client";

/**
 * Компоненти сеткаи молҳо (Product Grid) барои кассаи POS.
 * Тугмаҳои калон барои интихоби зуди мол.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Check } from "lucide-react";
import type { ProductRow } from "@/lib/store";
import { productSellPrice } from "@/services/pos/price";
import { tajikIncludes } from "@/lib/tajik-text";

export function getProductSellPrice(p: ProductRow): number {
  return productSellPrice(p);
}

type ProductGridProps = {
  products: ProductRow[];
  selectedProductId: string | null;
  onSelectProduct: (product: ProductRow) => void;
};

export function ProductGrid({ products, selectedProductId, onSelectProduct }: ProductGridProps) {
  const t = useTranslations("pos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        tajikIncludes(p.brand, q) || tajikIncludes(p.model, q) || tajikIncludes(p.category, q),
    );
  }, [products, query]);

  return (
    <div className="space-y-4">
      {/* Ҷустуҷӯи мол */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input-field min-h-12 w-full pl-10 pr-4"
        />
      </div>

      {/* Рӯйхати молҳо */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const isSelected = product.id === selectedProductId;
          const isOutOfStock = product.quantity <= 0;
          const sellPrice = getProductSellPrice(product);

          return (
            <button
              key={product.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectProduct(product)}
              className={`group relative flex min-h-[72px] w-full min-w-0 flex-col justify-between rounded-2xl border p-4 text-left ${
                isSelected
                  ? "border-primary bg-primary-soft"
                  : isOutOfStock
                    ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-[var(--shadow-sm)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight text-foreground">
                    {product.brand} {product.model}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isOutOfStock
                      ? t("outOfStock")
                      : t("inStock", { qty: product.quantity })}
                  </p>
                </div>
                {isSelected && (
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.category}
                </span>
                <span className="text-base font-bold text-primary">
                  {t("priceTjs", { price: sellPrice.toLocaleString("ru-RU") })}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t("noProductsTitle")}
        </div>
      )}
    </div>
  );
}
