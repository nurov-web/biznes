"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Eye, EyeOff, Link2, Lock, Store } from "lucide-react";
import { GsapStep } from "@/components/motion/GsapStep";
import { Icon } from "@/components/ui/Icon";
import { STORE_PLATFORMS, type StorePlatform } from "@/constants/store";
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

export function StoreConnectWizard({ webhook, onDone }: Props) {
  const t = useTranslations("store");
  const [step, setStep] = useState(1);
  const [storeUrl, setStoreUrl] = useState("");
  const [platform, setPlatform] = useState<StorePlatform>("custom");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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

  function goNext() {
    setFields({});
    if (step === 1) {
      if (!preview) {
        setFields({ storeUrl: "bad_url" });
        return;
      }
      setPlatform(detectStorePlatform(preview));
      setStep(2);
      return;
    }
  }

  async function onConnect(event: FormEvent) {
    event.preventDefault();
    setFields({});
    if (login.trim().length < 2) {
      setFields({ login: "short" });
      return;
    }
    if (password.length < 4) {
      setFields({ password: "short" });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl,
          login: login.trim(),
          password,
          platform,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        key?: string | null;
        fields?: Record<string, string>;
      };
      if (!response.ok) {
        setFields(json.fields ?? { storeUrl: "bad_url" });
        if (json.fields?.storeUrl) setStep(1);
        return;
      }
      setFreshKey(json.key ?? "");
      setPassword("");
      setStep(3);
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
      <ol className="mb-5 flex gap-2" aria-label={t("step", { current: step, total: 3 })}>
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </ol>

      <GsapStep step={step}>
        {step === 1 ? (
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              {t("url")}
              <input
                className={`input-field ${fields.storeUrl ? "input-error" : ""}`}
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
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {t("next")}
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <form className="grid gap-4" onSubmit={(e) => void onConnect(e)}>
            <p className="text-sm text-muted-foreground">{t("authLead")}</p>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">{t("platform")}</legend>
              <div className="grid grid-cols-2 gap-2">
                {STORE_PLATFORMS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn btn-ghost min-h-12 text-sm ${
                      platform === id ? "border-primary text-primary" : ""
                    }`}
                    onClick={() => setPlatform(id)}
                  >
                    {t(`platforms.${id}`)}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("login")}
              <input
                className={`input-field ${fields.login ? "input-error" : ""}`}
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setFields({});
                }}
                autoComplete="username"
              />
              {fieldError("login") ? (
                <span className="font-normal text-destructive">{fieldError("login")}</span>
              ) : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              {t("password")}
              <span className="relative block">
                <input
                  className={`input-field pr-12 ${fields.password ? "input-error" : ""}`}
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFields({});
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-1 grid w-11 place-items-center text-muted-foreground"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? t("hidePass") : t("showPass")}
                >
                  <Icon icon={showPass ? EyeOff : Eye} className="h-4 w-4" />
                </button>
              </span>
              {fieldError("password") ? (
                <span className="font-normal text-destructive">{fieldError("password")}</span>
              ) : (
                <span className="font-normal text-xs text-muted-foreground">{t("passHint")}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                {t("back")}
              </button>
              <button type="submit" className="btn btn-primary flex-1" disabled={busy}>
                {busy ? t("connecting") : t("connect")}
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
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
            <Link href="/store" className="btn btn-primary">
              {t("manage")}
            </Link>
          </div>
        ) : null}
      </GsapStep>
      {step < 3 ? (
        <p className="mt-4 flex items-center gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Icon icon={Store} className="h-3.5 w-3.5 shrink-0" />
          {t("honest")}
        </p>
      ) : null}
    </div>
  );
}
