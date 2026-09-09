"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useIntelligence } from "@/hooks/useIntelligence";
import { PageShell } from "@/components/PageShell";
import { RecommendedBadge, RecommendedNote } from "@/components/ui/Recommended";
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

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const to = useTranslations("onboarding");
  const intel = useTranslations("intel");
  const { data: snap, locale } = useIntelligence();
  const reorderTip = snap ? suggestReorder(snap.inventory, parseLocale(locale)) : null;
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    category: "Ноутбук",
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
    const data = (await r.json()) as { products?: Product[] };
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    await load();
  }

  async function move(id: string, type: "in" | "out") {
    await fetch("/api/inventory/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, type, quantity: 1, note: "" }),
    });
    await load();
  }

  async function archive(id: string) {
    await fetch("/api/inventory", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <PageShell
      title={t("title")}
      action={
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          {t("add")}
        </button>
      }
    >
      <RecommendedNote suggestion={reorderTip} />
      {open ? (
        <form onSubmit={onCreate} className="card grid gap-3 p-4 md:grid-cols-2">
          <label className="text-sm">
            {to("category")}
            <input className="input-field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          </label>
          <label className="text-sm">
            {to("brand")}
            <input className="input-field mt-1" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
          </label>
          <label className="text-sm md:col-span-2">
            {to("model")}
            <input className="input-field mt-1" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
          </label>
          <label className="text-sm">
            {to("buyFrom")}
            <input className="input-field mt-1" type="number" min={0} value={form.buyPriceMin || ""} onChange={(e) => setForm({ ...form, buyPriceMin: Number(e.target.value) || 0 })} />
          </label>
          <label className="text-sm">
            {to("buyTo")}
            <input className="input-field mt-1" type="number" min={0} value={form.buyPriceMax || ""} onChange={(e) => setForm({ ...form, buyPriceMax: Number(e.target.value) || 0 })} />
          </label>
          <label className="text-sm">
            {to("sellFrom")}
            <input className="input-field mt-1" type="number" min={0} value={form.sellPriceMin || ""} onChange={(e) => setForm({ ...form, sellPriceMin: Number(e.target.value) || 0 })} />
          </label>
          <label className="text-sm">
            {to("sellTo")}
            <input className="input-field mt-1" type="number" min={0} value={form.sellPriceMax || ""} onChange={(e) => setForm({ ...form, sellPriceMax: Number(e.target.value) || 0 })} />
          </label>
          <label className="text-sm">
            {to("qty")}
            <input className="input-field mt-1" type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })} />
          </label>
          <button className="btn btn-primary md:col-span-2" type="submit">{to("add")}</button>
        </form>
      ) : null}
      <div className="table-scroll card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">{t("qty")}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const sku = `${p.brand} ${p.model}`.trim();
              const picked = reorderTip?.key === sku;
              return (
              <tr key={p.id} className={`border-t border-border ${picked ? "bg-primary-soft/40" : ""}`}>
                <td className="px-3 py-2">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {sku}
                    {picked ? <RecommendedBadge /> : null}
                  </span>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </td>
                <td className="px-3 py-2 font-mono">{p.quantity}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(p.id, "in")}>{t("in")}</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => move(p.id, "out")}>{t("out")}</button>
                    <button type="button" className="btn btn-sm btn-ghost text-destructive" onClick={() => archive(p.id)}>{t("archive")}</button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      {snap?.inventory?.length ? (
        <article className="card p-4">
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
