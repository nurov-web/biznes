import type { ProductRow } from "@/lib/store";
import { tajikEquals } from "@/lib/tajik-text";

/**
 * Пайдо кардани маҳсулот бо SKU ё ном (case-insensitive, trimmed).
 * Санҷиш аз рӯи `product.model` ва `${product.brand} ${product.model}`.
 */
export function matchProduct(
  products: ProductRow[],
  query: string,
): ProductRow | null {
  const needle = query.trim();
  if (!needle) return null;

  return (
    products.find((p) => {
      if (p.archived) return false;
      return tajikEquals(p.model, needle) || tajikEquals(`${p.brand} ${p.model}`, needle);
    }) ?? null
  );
}
