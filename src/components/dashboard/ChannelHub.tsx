"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Globe, MapPin, Send, Smartphone } from "lucide-react";
import { CHANNEL_KINDS, type ChannelKind } from "@/constants/channels";
import { detectStorePlatform, isLoginWalledUrl, normalizeStoreUrl } from "@/lib/store-url";

type Channel = { id: string; kind: ChannelKind; url: string };

const ICONS = {
  telegram: Send,
  instagram: Camera,
  website: Globe,
  app: Smartphone,
  offline: MapPin,
} as const;

/** Пас аз вуруд: Telegram, Instagram, сайт — силка. Фармоиш худ намеояд. */
export function ChannelHub() {
  const t = useTranslations("channels");
  const [rows, setRows] = useState<Channel[]>([]);
  const [drafts, setDrafts] = useState<Record<ChannelKind, string>>({
    telegram: "",
    instagram: "",
    website: "",
    app: "",
    offline: "",
  });
  const [busy, setBusy] = useState<ChannelKind | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/channels", { credentials: "include", cache: "no-store" });
    if (!response.ok) return;
    const json = (await response.json()) as { channels?: Channel[] };
    const list = json.channels ?? [];
    setRows(list);
    setDrafts((prev) => {
      const next = { ...prev };
      for (const kind of CHANNEL_KINDS) {
        const found = list.find((row) => row.kind === kind);
        if (found) next[kind] = found.url;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(kind: ChannelKind, event: FormEvent) {
    event.preventDefault();
    setBusy(kind);
    setError("");
    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, url: drafts[kind] }),
      });
      if (!response.ok) {
        setError(t("badUrl"));
        return;
      }
      if (kind === "website") {
        const preview = normalizeStoreUrl(drafts.website);
        if (preview && !isLoginWalledUrl(preview)) {
          await fetch("/api/store", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeUrl: preview,
              platform: detectStorePlatform(preview),
            }),
          }).catch(() => undefined);
        }
      }
      await load();
    } catch {
      setError(t("badUrl"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card-raised p-4 sm:p-6">
      <p className="eyebrow text-primary">{t("kicker")}</p>
      <h2 className="display-3 mt-1">{t("title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-5 grid gap-3 lg:grid-cols-2">
        {CHANNEL_KINDS.map((kind) => {
          const Glyph = ICONS[kind];
          const saved = rows.find((row) => row.kind === kind);
          return (
            <li key={kind} className="rounded-xl border border-border p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Glyph className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                {t(`kind_${kind}`)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t(`hint_${kind}`)}</p>
              <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => void save(kind, e)}>
                <input
                  className="input-field min-h-12 flex-1"
                  value={drafts[kind]}
                  onChange={(e) => setDrafts((d) => ({ ...d, [kind]: e.target.value }))}
                  placeholder={t(`ph_${kind}`)}
                  autoComplete="url"
                />
                <button type="submit" className="btn btn-primary min-h-12 shrink-0" disabled={busy === kind}>
                  {busy === kind ? t("saving") : saved ? t("update") : t("save")}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
