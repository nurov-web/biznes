"use client";

import { CATALOG_SUGGESTIONS, CATEGORY_HINTS, emptyProduct } from "@/constants/catalog";
import type { BusinessType } from "@/constants";
import type { ProductDraft } from "@/types";

type Props = {
  type: BusinessType;
  products: ProductDraft[];
  onChange: (next: ProductDraft[]) => void;
  labels: {
    products: string;
    hint: string;
    suggestions: string;
    add: string;
    remove: string;
    category: string;
    brand: string;
    model: string;
    buyFrom: string;
    buyTo: string;
    sellFrom: string;
    sellTo: string;
    qty: string;
    condition: string;
    new: string;
    used: string;
    skip: string;
  };
};

export function ProductCatalogForm({ type, products, onChange, labels }: Props) {
  const suggestions = CATALOG_SUGGESTIONS[type] ?? CATALOG_SUGGESTIONS.other;

  function update(index: number, patch: Partial<ProductDraft>) {
    onChange(products.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function applySuggestion(item: (typeof suggestions)[number]) {
    const { label: _label, ...draft } = item;
    const blank = products.length === 1 && !products[0].model && !products[0].category;
    onChange(blank ? [draft] : [...products, draft]);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{labels.products}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{labels.hint}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {labels.suggestions}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm transition-colors duration-200 hover:border-primary hover:bg-card"
              onClick={() => applySuggestion(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {products.map((p, i) => (
        <fieldset key={i} className="grid gap-3 rounded-2xl border border-border bg-background p-4 md:grid-cols-2">
          <legend className="px-1 text-sm font-medium text-muted-foreground">SKU {i + 1}</legend>
          <label className="grid gap-1 text-sm font-medium">
            {labels.category}
            <input
              className="input-field"
              list="category-hints"
              value={p.category}
              onChange={(e) => update(i, { category: e.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.brand}
            <input
              className="input-field"
              value={p.brand}
              onChange={(e) => update(i, { brand: e.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium md:col-span-2">
            {labels.model}
            <input
              className="input-field"
              value={p.model}
              onChange={(e) => update(i, { model: e.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.buyFrom}
            <input
              className="input-field"
              type="number"
              min={0}
              value={p.buyPriceMin || ""}
              onChange={(e) => {
                const n = Number(e.target.value) || 0;
                update(i, { buyPriceMin: n, buyPriceMax: Math.max(n, p.buyPriceMax) });
              }}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.buyTo}
            <input
              className="input-field"
              type="number"
              min={0}
              value={p.buyPriceMax || ""}
              onChange={(e) => update(i, { buyPriceMax: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.sellFrom}
            <input
              className="input-field"
              type="number"
              min={0}
              value={p.sellPriceMin || ""}
              onChange={(e) => {
                const n = Number(e.target.value) || 0;
                update(i, { sellPriceMin: n, sellPriceMax: Math.max(n, p.sellPriceMax) });
              }}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.sellTo}
            <input
              className="input-field"
              type="number"
              min={0}
              value={p.sellPriceMax || ""}
              onChange={(e) => update(i, { sellPriceMax: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.qty}
            <input
              className="input-field"
              type="number"
              min={0}
              value={p.quantity || ""}
              onChange={(e) => update(i, { quantity: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            {labels.condition}
            <select
              className="input-field"
              value={p.condition}
              onChange={(e) => update(i, { condition: e.target.value as "new" | "used" })}
            >
              <option value="new">{labels.new}</option>
              <option value="used">{labels.used}</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              className="text-sm text-destructive transition-colors duration-200 hover:underline"
              onClick={() =>
                onChange(products.length === 1 ? [emptyProduct()] : products.filter((_, idx) => idx !== i))
              }
            >
              {labels.remove}
            </button>
          </div>
        </fieldset>
      ))}
      <datalist id="category-hints">
        {CATEGORY_HINTS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => onChange([...products, emptyProduct()])}>
          {labels.add}
        </button>
      </div>
    </div>
  );
}
