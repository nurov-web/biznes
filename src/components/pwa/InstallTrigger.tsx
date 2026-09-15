"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import {
  detectInstalledPwa,
  isPwaInstalled,
  markPwaInstalled,
  PWA_INSTALLED_EVENT,
  requestPwaInstall,
} from "@/lib/pwa";

type Props = {
  className?: string;
  menu?: boolean;
  compact?: boolean;
  onPick?: () => void;
};

/** Тугмаи «Насб» — пас аз скачат пинҳон. */
export function InstallTrigger({ className, menu, compact, onPick }: Props) {
  const t = useTranslations("pwa");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hide = () => {
      markPwaInstalled();
      setShow(false);
    };
    const sync = () => {
      if (isPwaInstalled()) {
        setShow(false);
        return;
      }
      setShow(true);
    };
    sync();
    void detectInstalledPwa().then((yes) => {
      if (yes) hide();
    });
    window.addEventListener("appinstalled", hide);
    window.addEventListener(PWA_INSTALLED_EVENT, hide);
    const media = window.matchMedia("(display-mode: standalone)");
    const onMode = () => {
      if (media.matches) hide();
    };
    media.addEventListener("change", onMode);
    return () => {
      window.removeEventListener("appinstalled", hide);
      window.removeEventListener(PWA_INSTALLED_EVENT, hide);
      media.removeEventListener("change", onMode);
    };
  }, []);

  if (!show) return null;

  function pick() {
    requestPwaInstall();
    onPick?.();
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
