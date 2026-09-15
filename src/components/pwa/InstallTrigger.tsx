"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { requestPwaInstall, subscribeInstallButton } from "@/lib/pwa";

type Props = {
  className?: string;
  menu?: boolean;
  compact?: boolean;
  onPick?: () => void;
};

/** Тугмаи «Скачат»: пас аз насб нест, пас аз нест кардан боз. */
export function InstallTrigger({ className, menu, compact, onPick }: Props) {
  const t = useTranslations("pwa");
  const [show, setShow] = useState(false);

  useEffect(() => subscribeInstallButton(setShow), []);

  if (!show) return null;

  function pick() {
    onPick?.();
    void requestPwaInstall();
  }

  if (menu) {
    return (
      <button type="button" role="menuitem" className="account-menu-item" onClick={pick}>
        <Icon icon={Download} className="h-4 w-4 text-dark-muted" />
        {t("install")}
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        className={
          className ??
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white"
        }
        aria-label={t("install")}
        onClick={pick}
      >
        <Icon icon={Download} className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button type="button" className={className} onClick={pick}>
      <Icon icon={Download} className="h-4 w-4" />
      {t("install")}
    </button>
  );
}
