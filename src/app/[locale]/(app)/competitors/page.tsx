"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { money, useIntelligence } from "@/hooks/useIntelligence";

export default function CompetitorsPage() {
  const t = useTranslations("intel");
  const { data, loading, error, reload } = useIntelligence();
  const [form, setForm] = useState({ name: "", product: "", price: 0, promo: "", note: "" });
  const [err, setErr] = useState("");

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setErr("");
    const response = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setErr(t("saveFail"));
      return;
    }
    setForm({ name: "", product: "", price: 0, promo: "", note: "" });
    await reload();
  }

  async function remove(id: string) {
    await fetch("/api/competitors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await reload();
  }

  if (loading || error || !data) {
    return <p className="p-6 text-sm text-muted-foreground">{error ? t("error") : t("loading")}</p>;
  }

  return (
    <PageShell title={t("compTitle")} lead={t("compLead")}>
      <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={(e) => void onCreate(e)}>
        <label className="text-sm">
          {t("compName")}
          <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="text-sm">
          {t("compProduct")}
          <input className="input-field mt-1" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
        </label>
        <label className="text-sm">
          {t("compPrice")}
          <input
            className="input-field mt-1"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          {t("compPromo")}
          <input className="input-field mt-1" value={form.promo} onChange={(e) => setForm({ ...form, promo: e.target.value })} />
        </label>
        <label className="text-sm md:col-span-2">
          {t("compNote")}
          <input className="input-field mt-1" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        {err ? <p className="text-sm text-destructive md:col-span-2">{err}</p> : null}
        <button type="submit" className="btn btn-primary md:col-span-2">
          {t("compAdd")}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="table-intel">
          <thead>
            <tr>
              <th>{t("compName")}</th>
              <th>{t("compProduct")}</th>
              <th>{t("compPrice")}</th>
              <th>{t("compPromo")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.competitorRows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.product || "—"}</td>
                <td className="font-mono">{c.price ? money(c.price) : "—"}</td>
                <td>{c.promo || "—"}</td>
                <td>
                  <button type="button" className="btn btn-ghost text-sm" onClick={() => void remove(c.id)}>
                    {t("remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {data.competitors.map((c) => (
          <li key={`${c.name}-${c.product}`}>
            {c.name}: {c.vsUs}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
    </PageShell>
  );
}
