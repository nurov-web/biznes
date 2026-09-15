"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import {
  getDeferredPrompt,
  isInAppBrowser,
  isIosDevice,
  isStandaloneApp,
  openInSystemBrowser,
  PWA_AVAILABLE_EVENT,
  PWA_INSTALLED_EVENT,
  PWA_OPEN_EVENT,
  rememberDeferredPrompt,
  requestPwaInstall,
  type PwaPromptEvent,
} from "@/lib/pwa";

const DISMISS_KEY = "bp-pwa-dismiss";

function dismissedNow(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/** Насби барнома дар телефон ва компютер. */
export function InstallApp() {
  const t = useTranslations("pwa");
  const [ios, setIos] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandaloneApp()) return;
    setIos(isIosDevice());
    setInApp(isInAppBrowser());
    setCanPrompt(Boolean(getDeferredPrompt()));
    if ((isIosDevice() || isInAppBrowser() || getDeferredPrompt()) && !dismissedNow()) {
      setOpen(true);
    }

    const onPrompt = (raw: Event) => {
      rememberDeferredPrompt(raw as PwaPromptEvent);
      setCanPrompt(true);
      if (!dismissedNow()) setOpen(true);
    };
    const onOpen = () => {
      if (isStandaloneApp()) return;
      setCanPrompt(Boolean(getDeferredPrompt()));
      if (getDeferredPrompt()) {
        void requestPwaInstall();
        return;
      }
      setOpen(true);
    };
    const onInstalled = () => {
      setCanPrompt(false);
      setOpen(false);
    };
    const onAvail = () => setCanPrompt(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener(PWA_OPEN_EVENT, onOpen);
    window.addEventListener(PWA_AVAILABLE_EVENT, onAvail);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(PWA_INSTALLED_EVENT, onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener(PWA_OPEN_EVENT, onOpen);
      window.removeEventListener(PWA_AVAILABLE_EVENT, onAvail);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(PWA_INSTALLED_EVENT, onInstalled);
    };
  }, []);

  function hide() {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      return;
    }
  }

  if (!open || isStandaloneApp()) return null;

  const lead = inApp ? t("inApp") : ios ? t("iosLead") : canPrompt ? t("lead") : t("howTo");

  return (
    <div className="bp-pwa-bar" role="dialog" aria-label={t("title")}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{t("title")}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{lead}</p>
      </div>
      {inApp ? (
        <button
          type="button"
          className="btn btn-primary inline-flex min-h-12 shrink-0 items-center gap-2"
          onClick={openInSystemBrowser}
        >
          {t("openBrowser")}
        </button>
      ) : ios || !canPrompt ? null : (
        <button
          type="button"
          className="btn btn-primary inline-flex min-h-12 shrink-0 items-center gap-2"
          onClick={() => void requestPwaInstall()}
        >
          <Icon icon={Download} className="h-4 w-4" />
          {t("install")}
        </button>
      )}
      <button type="button" className="bp-chat-iconbtn h-12 w-12 shrink-0" aria-label={t("later")} onClick={hide}>
        <Icon icon={X} className="h-5 w-5" />
      </button>
    </div>
  );
}
