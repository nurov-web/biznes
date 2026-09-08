"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Archive, Plus, Search, X } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { CUSTOMER_TAGS } from "@/constants";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string;
  notes: string;
  createdAt: string;
};

const EMPTY = { name: "", phone: "", email: "", tags: "regular", notes: "" };

export default function ClientsPage() {
  const t = useTranslations("crm");
  const [rows, setRows] = useState<Customer[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<string>("all");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/crm/clients");
    const data = (await r.json()) as { customers?: Customer[] };
    setRows(data.customers ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((c) => {
      const bySegment = segment === "all" || c.tags === segment;
      const byQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      return bySegment && byQuery;
    });
  }, [rows, query, segment]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(EMPTY);
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function archive(id: string) {
    await fetch("/api/crm/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const segments = ["all", ...CUSTOMER_TAGS];

  return (
    <PageShell
      title={t("clients")}
      lead={t("clientsLead")}
      action={
        <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-4 w-4" strokeWidth={2} aria-hidden /> : <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />}
          {open ? t("cancel") : t("addClient")}
        </button>
      }
    >
      {open ? (
        <form onSubmit={onSubmit} className="card-raised grid gap-3 p-6 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            {t("name")}
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("phone")}
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("email")}
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("segment")}
            <select
              className="input-field"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            >
              {CUSTOMER_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {t(`tagNames.${tag}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
            {t("notes")}
            <textarea
              className="input-field min-h-20"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <button className="btn btn-primary md:col-span-2" type="submit" disabled={busy}>
            {t("addClient")}
          </button>
        </form>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            className="input-field pl-9"
            placeholder={t("search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("search")}
          />
        </label>
        <div className="seg">
          {segments.map((s) => (
            <button
              key={s}
              type="button"
              className="seg-item"
              data-active={segment === s}
              onClick={() => setSegment(s)}
            >
              {s === "all" ? t("all") : t(`tagNames.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="card-raised overflow-x-auto">
        <table className="table-intel">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("phone")}</th>
              <th>{t("segment")}</th>
              <th>{t("notes")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-sm text-muted-foreground">
                  {t("noClients")}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="num text-muted-foreground">{c.phone || "—"}</td>
                  <td>
                    <span className="chip text-xs">{c.tags ? t(`tagNames.${c.tags}`) : "—"}</span>
                  </td>
                  <td className="max-w-xs text-muted-foreground">{c.notes || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => void archive(c.id)}
                      title={t("archive")}
                    >
                      <Archive className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      {t("archive")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t("archiveNote")}</p>
    </PageShell>
  );
}
