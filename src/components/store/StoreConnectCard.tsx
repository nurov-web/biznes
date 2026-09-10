"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Globe, Unplug } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { StoreConnectWizard, type StorePublic } from "@/components/store/StoreConnectWizard";
import { Link } from "@/i18n/navigation";

type State = {
  connection: StorePublic | null;
  skipped: boolean;
  webhook: string;
  channel: string;
};

export function StoreConnectCard({
  hideManage,
  onStatus,
}: {
  hideManage?: boolean;
  onStatus?: (connected: boolean) => void;
}) {
  const t = useTranslations("store");
  const [data, setData] = useState<State | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/store");
    if (!response.ok) {
      onStatus?.(false);
      return;
    }
    const json = (await response.json()) as State;
    setData(json);
    onStatus?.(json.connection?.status === "connected");
  }, [onStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  async function skip() {
    setBusy(true);
    try {
      await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skip: true }),
      });
      await load();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/store", { method: "DELETE" });
      await load();
      setOpen(true);
    } finally {
      setBusy(false);
    }
  }

  if (!data) return null;

  const connected = data.connection?.status === "connected";
  const skipped = data.skipped && !connected;
  const wantsStore = data.channel === "online" || data.channel === "both";
  const reachable = data.connection?.reachable !== false;

  if (connected && data.connection) {
    return (
      <section className="card-raised p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                reachable ? "bg-[#e7f6ee] text-success" : "bg-warning/15 text-warning"
              }`}
            >
              <Icon icon={reachable ? Check : Unplug} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={`eyebrow ${reachable ? "text-success" : "text-warning"}`}>
                {reachable ? t("connected") : t("unreachable")}
              </p>
              <p className="mt-1 truncate text-sm font-medium">{data.connection.storeUrl}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t(`platforms.${data.connection.platform}`)} · {data.connection.login}
              </p>
              {reachable ? null : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("unreachableLead")}</p>
              )}
              <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <p className="font-medium text-foreground">{t("connectedNote")}</p>
                {data.webhook ? (
                  <div className="mt-2 grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("webhook")}:</span>
                      <code className="num rounded border border-border bg-background px-2 py-1 text-[11px] font-mono text-foreground">
                        {data.webhook}
                      </code>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t("webhookHint")}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hideManage ? null : (
              <Link href="/store" className="btn btn-sm btn-primary">
                {t("manage")}
              </Link>
            )}
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => void disconnect()} disabled={busy}>
              <Icon icon={Unplug} className="h-3.5 w-3.5" />
              {t("disconnect")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (skipped && !open) {
    return (
      <section className="card-raised flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <p className="text-sm text-muted-foreground">{t("skippedNote")}</p>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}>
          {t("connectLater")}
        </button>
      </section>
    );
  }

  return (
    <section className="card-raised overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Icon icon={Globe} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="display-3">{t("title")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {wantsStore ? t("leadOnline") : t("lead")}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => void skip()} disabled={busy}>
          {t("skip")}
        </button>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <StoreConnectWizard webhook={data.webhook} onDone={() => void load()} />
      </div>
    </section>
  );
}
