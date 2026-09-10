import type { ProductRow } from "@/lib/store";

/**
 * Пайдо кардани маҳсулот бо SKU ё ном (case-insensitive, trimmed).
 * Санҷиш аз рӯи `product.model` ва `${product.brand} ${product.model}`.
 */
export function matchProduct(
  products: ProductRow[],
  query: string,
): ProductRow | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;

  return (
    products.find((p) => {
      if (p.archived) return false;
      const model = p.model.trim().toLowerCase();
      const fullName = `${p.brand} ${p.model}`.trim().toLowerCase();
      return model === needle || fullName === needle;
    }) ?? null
  );
}
