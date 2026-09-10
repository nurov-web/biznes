"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Link2, Lock, Store } from "lucide-react";
import { GsapStep } from "@/components/motion/GsapStep";
import { Icon } from "@/components/ui/Icon";
import type { StorePlatform } from "@/constants/store";
import { detectStorePlatform, normalizeStoreUrl } from "@/lib/store-url";
import { Link } from "@/i18n/navigation";

export type StorePublic = {
  id: string;
  storeUrl: string;
  platform: StorePlatform;
  login: string;
  status: "connected" | "skipped";
  reachable: boolean;
  ordersSync?: boolean;
  lastCheckAt: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  webhook: string;
  onDone?: () => void;
};

/** Силка кофӣ аст. Логини админ лозим нест — мо ворид намешавем. */
export function StoreConnectWizard({ webhook, onDone }: Props) {
  const t = useTranslations("store");
  const [step, setStep] = useState(1);
  const [storeUrl, setStoreUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [freshKey, setFreshKey] = useState("");
  const [copied, setCopied] = useState("");

  const preview = useMemo(() => normalizeStoreUrl(storeUrl), [storeUrl]);

  function fieldError(name: string): string {
    const code = fields[name];
    if (!code) return "";
    return t(`errors.${code}` as "errors.bad_url");
  }

  async function onConnect(event: FormEvent) {
    event.preventDefault();
    setFields({});
    if (!preview) {
      setFields({ storeUrl: "bad_url" });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl,
          platform: detectStorePlatform(preview),
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        key?: string | null;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        setFields(json.fields ?? { storeUrl: "bad_url" });
        return;
      }
      setFreshKey(json.key ?? "");
      setStep(2);
      onDone?.();
    } finally {
      setBusy(false);
    }
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

  return (
    <div>
      <ol className="mb-5 flex gap-2" aria-label={t("step", { current: step, total: 2 })}>
        {[1, 2].map((n) => (
          <li
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </ol>

      <GsapStep step={step}>
        {step === 1 ? (
          <form className="grid gap-4" onSubmit={(e) => void onConnect(e)}>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("url")}
              <input
                className={`input-field min-h-12 ${fields.storeUrl ? "input-error" : ""}`}
                value={storeUrl}
                onChange={(e) => {
                  setStoreUrl(e.target.value);
                  setFields({});
                }}
                placeholder={t("urlPh")}
                inputMode="url"
                autoComplete="url"
              />
            </label>
            {fieldError("storeUrl") ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldError("storeUrl")}
              </p>
            ) : preview ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon icon={Link2} className="h-3.5 w-3.5 text-primary" />
                {preview}
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">{t("urlHint")}</p>
            )}
            <button type="submit" className="btn btn-primary min-h-12" disabled={busy}>
              {busy ? t("connecting") : t("connect")}
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card text-primary">
                <Icon icon={Check} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t("successTitle")}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("successLead")}</p>
              </div>
            </div>
            {freshKey ? (
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{t("freshKey")}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="num min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">
                    {freshKey}
                  </code>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => void copy(freshKey, "key")}>
                    {copied === "key" ? (
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
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium">{t("webhook")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="num min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs">
                  {webhook}
                </code>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => void copy(webhook, "hook")}>
                  {copied === "hook" ? (
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  )}
                  {t("copy")}
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("webhookHint")}</p>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon icon={Lock} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("secureNote")}
            </p>
            <Link href="/store" className="btn btn-primary min-h-12">
              {t("manage")}
            </Link>
          </div>
        ) : null}
      </GsapStep>
      {step < 2 ? (
        <p className="mt-4 flex items-center gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Icon icon={Store} className="h-3.5 w-3.5 shrink-0" />
          {t("honest")}
        </p>
      ) : null}
    </div>
  );
}
