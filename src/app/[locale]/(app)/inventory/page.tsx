"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useIntelligence } from "@/hooks/useIntelligence";
import { PageShell } from "@/components/PageShell";
import { LowStockBanner } from "@/components/inventory/LowStockBanner";
import { ModuleEmpty } from "@/components/ops/ModuleEmpty";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
import { LOW_STOCK_THRESHOLD } from "@/constants";
import { parseLocale } from "@/lib/locale-query";
import { suggestReorder } from "@/services/intelligence/advice";

type Product = {
  id: string;
  category: string;
  brand: string;
  model: string;
  buyPriceMin: number;
  buyPriceMax: number;
  sellPriceMin: number;
  sellPriceMax: number;
  quantity: number;
  condition: string;
};

type Movement = {
  id: string;
  type: string;
  quantity: number;
  sku: string;
  createdAt: string;
};

function skuOf(p: Product): string {
  return `${p.brand} ${p.model}`.trim();
}

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const to = useTranslations("onboarding");
  const intel = useTranslations("intel");
  const { data: snap, locale } = useIntelligence();
  const reorderTip = snap ? suggestReorder(snap.inventory, parseLocale(locale)) : null;
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    category: "",
    brand: "",
    model: "",
    buyPriceMin: 0,
    buyPriceMax: 0,
    sellPriceMin: 0,
    sellPriceMax: 0,
    quantity: 1,
    condition: "new" as "new" | "used",
  });

  async function load() {
    const r = await fetch("/api/inventory");
    const data = (await r.json()) as { products?: Product[]; movements?: Movement[] };
    setProducts(data.products ?? []);
    setMovements(data.movements ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => skuOf(p).toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, query]);

  const lowNames = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD).map(skuOf);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      setOpen(false);
      setForm({ ...form, brand: "", model: "", quantity: 1 });
      await load();
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, type: "in" | "out") {
    setError("");
    const response = await fetch("/api/inventory/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, type, quantity: 1, note: "" }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error === "negative_stock" ? t("negativeStock") : t("saveError"));
      return;
    }
    await load();
  }

  async function archive(id: string) {
    setError("");
    const response = await fetch("/api/inventory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      setError(t("saveError"));
      return;
    }
    await load();
  }

  return (
    <PageShell
      title={t("title")}
      lead={t("lead")}
      action={
        <button type="button" className="btn btn-primary min-h-12" onClick={() => setOpen(true)}>
          {t("add")}
        </button>
      }
    >
      <RecommendedNote suggestion={reorderTip} />
      <LowStockBanner names={lowNames} title={t("lowStock")} lead={t("lowStockLead")} />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {open ? (
        <form onSubmit={onCreate} className="card-raised grid gap-3 p-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            {to("category")}
            <input
              className="input-field min-h-12"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder={t("categoryPh")}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("brand")}
            <input
              className="input-field min-h-12"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
            {to("model")}
            <input
              className="input-field min-h-12"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("buyFrom")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={form.buyPriceMin || ""}
              onChange={(e) => setForm({ ...form, buyPriceMin: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("buyTo")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={form.buyPriceMax || ""}
              onChange={(e) => setForm({ ...form, buyPriceMax: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("sellFrom")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={form.sellPriceMin || ""}
              onChange={(e) => setForm({ ...form, sellPriceMin: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("sellTo")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={form.sellPriceMax || ""}
              onChange={(e) => setForm({ ...form, sellPriceMax: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {to("qty")}
            <input
              className="input-field min-h-12 num"
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
            />
          </label>
          <button className="btn btn-primary min-h-12 md:col-span-2" type="submit" disabled={busy}>
            {to("add")}
          </button>
        </form>
      ) : null}

      {products.length === 0 && !open ? (
        <ModuleEmpty title={t("empty")} lead={t("emptyLead")} href="/store" cta={t("emptyCta")} />
      ) : (
        <>
          <label className="relative block min-w-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              className="input-field min-h-12 pl-9"
              placeholder={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("search")}
            />
          </label>
          <div className="table-scroll card-raised">
            <table className="table-intel">
              <thead>
                <tr>
                  <th>{t("sku")}</th>
                  <th>{t("qty")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-sm text-muted-foreground">
                      {t("noMatch")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const sku = skuOf(p);
                    const picked = reorderTip?.key === sku;
                    const low = p.quantity <= LOW_STOCK_THRESHOLD;
                    return (
                      <tr key={p.id} className={picked || low ? "bg-primary-soft/40" : ""}>
                        <td>
                          <span className="inline-flex flex-wrap items-center gap-2">
                            {sku}
                            {picked ? <RecommendedBadge /> : null}
                          </span>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </td>
                        <td className={`num ${low ? "font-semibold text-destructive" : ""}`}>{p.quantity}</td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" className="btn btn-sm btn-ghost min-h-12" onClick={() => void move(p.id, "in")}>
                              {t("in")}
                            </button>
                            <button type="button" className="btn btn-sm btn-ghost min-h-12" onClick={() => void move(p.id, "out")}>
                              {t("out")}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost min-h-12 text-destructive"
                              onClick={() => void archive(p.id)}
                            >
                              {t("archive")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {movements.length ? (
        <article className="card-raised p-4 sm:p-5">
          <h2 className="display-3">{t("moves")}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {movements.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span>
                  {m.sku} · {m.type === "in" ? t("in") : t("out")} × {m.quantity}
                </span>
                <span className="num text-xs text-muted-foreground">{m.createdAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {snap?.inventory?.length ? (
        <article className="card-raised p-4">
          <h2 className="font-medium">{intel("dataTitle")}</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {snap.inventory.map((row) => (
              <li
                key={row.sku}
                className={`flex flex-wrap items-center justify-between gap-2 ${
                  reorderTip?.key === row.sku ? "rounded-lg bg-primary-soft/50 px-2 py-1" : ""
                }`}
              >
                <span className="inline-flex flex-wrap items-center gap-2">
                  {row.sku} · {row.status}
                  {reorderTip?.key === row.sku ? <RecommendedBadge /> : null}
                </span>
                <span className="text-muted-foreground">{row.forecast}</span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </PageShell>
  );
}
