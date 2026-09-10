"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, Plug, Table2, Users } from "lucide-react";
import { StoreAuditPanel } from "@/components/store/StoreAuditPanel";
import { Link } from "@/i18n/navigation";
import { detectStorePlatform, isLoginWalledUrl, normalizeStoreUrl } from "@/lib/store-url";

type Kind = "inventory" | "sales";

type Props = {
  onImported?: () => void;
};

/** Роҳи тез: силка + AI, Excel, webhook, CRM — бе навиштани ҳар мол. */
export function ImportHub({ onImported }: Props) {
  const t = useTranslations("importHub");
  const [url, setUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const [walled, setWalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<Kind>("inventory");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadStore = useCallback(async () => {
    const response = await fetch("/api/store", { credentials: "include", cache: "no-store" });
    if (!response.ok) return;
    const json = (await response.json()) as {
      connection?: { status?: string; storeUrl?: string };
    };
    const ok = json.connection?.status === "connected" && Boolean(json.connection.storeUrl);
    setConnected(ok);
    if (ok && json.connection?.storeUrl) {
      setUrl(json.connection.storeUrl);
      setWalled(isLoginWalledUrl(json.connection.storeUrl));
    }
  }, []);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  async function saveUrl(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMsg("");
    const preview = normalizeStoreUrl(url);
    if (!preview) {
      setError(t("badUrl"));
      return;
    }
    if (isLoginWalledUrl(preview)) {
      setWalled(true);
      setConnected(false);
      setError(t("walled"));
      await fetch("/api/channels", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "website", url: preview }),
      }).catch(() => undefined);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl: preview,
          platform: detectStorePlatform(preview),
        }),
      });
      if (!response.ok) {
        setError(t("badUrl"));
        return;
      }
      setWalled(false);
      setConnected(true);
      await fetch("/api/channels", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "website", url: preview }),
      }).catch(() => undefined);
      setMsg(t("urlSaved"));
    } finally {
      setBusy(false);
    }
  }

  async function importCsv(text: string) {
    setError("");
    setMsg("");
    const response = await fetch("/api/intelligence/import", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, csv: text }),
    });
    const json = (await response.json()) as {
      imported?: number;
      clients?: number;
      error?: string;
    };
    if (!response.ok) {
      setError(t("csvFail"));
      return;
    }
    const clients = json.clients ?? 0;
    setMsg(
      clients > 0
        ? t("csvOkClients", { count: json.imported ?? 0, clients })
        : t("csvOk", { count: json.imported ?? 0 }),
    );
    onImported?.();
  }

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError(t("needCsv"));
      return;
    }
    const text = await file.text();
    await importCsv(text);
  }

  return (
    <section className="card-raised p-4 sm:p-6">
      <p className="eyebrow text-primary">{t("kicker")}</p>
      <h2 className="display-3 mt-1">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Globe className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
            {t("urlTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("urlHint")}</p>
          <form className="mt-3 grid gap-2" onSubmit={(e) => void saveUrl(e)}>
            <input
              className="input-field min-h-12"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
                setWalled(false);
              }}
              placeholder={t("urlPh")}
              inputMode="url"
              autoComplete="url"
            />
            <button type="submit" className="btn btn-primary min-h-12" disabled={busy}>
              {busy ? t("reading") : t("urlCta")}
            </button>
          </form>
        </article>

        <article className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Table2 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
            {t("csvTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("csvHint")}</p>
          <div className="mt-3 grid gap-2">
            <select
              className="input-field min-h-12"
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
            >
              <option value="inventory">{t("kindStock")}</option>
              <option value="sales">{t("kindSales")}</option>
            </select>
            <label className="btn btn-primary min-h-12 cursor-pointer">
              {t("csvCta")}
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Plug className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
            {t("pipeTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("pipeHint")}</p>
          <div className="mt-3 grid gap-2">
            <Link href="/integrations" className="btn btn-primary min-h-12">
              {t("toIntegrations")}
            </Link>
            <Link href="/crm/clients" className="btn btn-ghost min-h-12">
              <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {t("toCrm")}
            </Link>
          </div>
        </article>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {msg ? <p className="mt-4 text-sm text-success">{msg}</p> : null}
      {walled ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("walledNext")}</p> : null}

      {connected && !walled ? (
        <div className="mt-6 border-t border-border pt-5">
          <StoreAuditPanel autoRun />
        </div>
      ) : null}
    </section>
  );
}
