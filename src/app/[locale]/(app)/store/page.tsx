"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { StoreAuditPanel } from "@/components/store/StoreAuditPanel";
import { StoreConnectCard } from "@/components/store/StoreConnectCard";
import { StoreLedgerPanel } from "@/components/store/StoreLedgerPanel";
import { Link } from "@/i18n/navigation";

export default function StorePage() {
  const t = useTranslations("store");
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);

  const onStatus = useCallback((ok: boolean) => {
    setConnected(ok);
    setReady(true);
  }, []);

  return (
    <PageShell title={t("manageTitle")} lead={t("manageLead")}>
      <StoreConnectCard hideManage onStatus={onStatus} />
      {ready && connected ? <StoreLedgerPanel /> : null}
      {ready && connected ? <StoreAuditPanel autoRun /> : null}
      {ready && !connected ? (
        <p className="text-sm text-muted-foreground">
          {t("auditNoStore")}{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            {t("backDash")}
          </Link>
        </p>
      ) : null}
    </PageShell>
  );
}
