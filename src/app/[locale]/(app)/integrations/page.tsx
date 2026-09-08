"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, KeyRound, Plug, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Link } from "@/i18n/navigation";

type ApiKey = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null };

const CATALOG = [
  { name: "CSV / Excel", state: "live", href: "/data" },
  { name: "POS (webhook)", state: "live", href: null },
  { name: "REST API", state: "live", href: null },
  { name: "Shopify", state: "queued", href: null },
  { name: "WooCommerce", state: "queued", href: null },
  { name: "Amazon", state: "queued", href: null },
  { name: "Stripe", state: "queued", href: null },
  { name: "PayPal", state: "queued", href: null },
  { name: "Google Analytics", state: "queued", href: null },
] as const;

export default function IntegrationsPage() {
  const t = useTranslations("integrations");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhook, setWebhook] = useState("");
  const [fresh, setFresh] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/integrations");
    if (!r.ok) return;
    const data = (await r.json()) as { keys: ApiKey[]; webhook: string };
    setKeys(data.keys);
    setWebhook(data.webhook);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createKey() {
    setBusy(true);
    try {
      const r = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "POS" }),
      });
      if (!r.ok) return;
      const data = (await r.json()) as { key: string };
      setFresh(data.key);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    await fetch("/api/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function copy(value: string, tag: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  const sample = `curl -X POST ${webhook || "/api/ingest/sale"} \\
  -H "x-bp-key: bp_live_..." \\
  -H "content-type: application/json" \\
  -d '{"sku":"Lenovo IdeaPad 3","quantity":1,"revenue":5200,"cost":4100}'`;

  return (
    <PageShell title={t("title")} lead={t("lead")}>
      <section className="card-raised p-6">
        <h2 className="display-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          {t("keysTitle")}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("keysLead")}</p>

        {fresh ? (
          <div className="mt-4 rounded-xl border border-primary/30 bg-primary-soft p-4">
            <p className="text-sm font-medium">{t("freshTitle")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="num min-w-0 flex-1 truncate rounded-lg bg-card px-3 py-2 text-xs">
                {fresh}
              </code>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => void copy(fresh, "fresh")}>
                {copied === "fresh" ? (
                  <Check className="h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                )}
                {t("copy")}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("freshNote")}</p>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="table-intel">
            <thead>
              <tr>
                <th>{t("keyName")}</th>
                <th>{t("keyPrefix")}</th>
                <th>{t("keyCreated")}</th>
                <th>{t("keyUsed")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-sm text-muted-foreground">
                    {t("noKeys")}
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id}>
                    <td className="font-medium">{k.name}</td>
                    <td className="num text-muted-foreground">{k.prefix}…</td>
                    <td className="num text-muted-foreground">{k.createdAt.slice(0, 10)}</td>
                    <td className="num text-muted-foreground">{k.lastUsedAt?.slice(0, 10) || "—"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost text-destructive"
                        onClick={() => void revoke(k.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {t("revoke")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button type="button" className="btn btn-primary mt-4" onClick={() => void createKey()} disabled={busy}>
          {t("createKey")}
        </button>
      </section>

      <section className="card-raised p-6">
        <h2 className="display-3">{t("webhookTitle")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("webhookLead")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="num min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">{webhook}</code>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => void copy(webhook, "hook")}>
            {copied === "hook" ? (
              <Check className="h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            )}
            {t("copy")}
          </button>
        </div>
        <pre className="num mt-3 overflow-x-auto rounded-xl bg-dark-bg p-4 text-[11px] leading-relaxed text-dark-text">
          {sample}
        </pre>
      </section>

      <section className="card-raised p-6">
        <h2 className="display-3 flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          {t("catalogTitle")}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
            >
              <span>{item.name}</span>
              {item.href ? (
                <Link href={item.href} className="text-xs font-medium text-primary hover:underline">
                  {t("open")}
                </Link>
              ) : (
                <span className={item.state === "live" ? "text-xs text-success" : "text-xs text-muted-foreground"}>
                  {item.state === "live" ? t("live") : t("queued")}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("catalogNote")}</p>
      </section>
    </PageShell>
  );
}
