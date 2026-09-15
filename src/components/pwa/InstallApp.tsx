"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import {
  isIosSafari,
  isPwaInstalled,
  isStandaloneApp,
  markPwaInstalled,
  PWA_AVAILABLE_EVENT,
  PWA_OPEN_EVENT,
} from "@/lib/pwa";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "bp-pwa-dismiss";

function isIos(): boolean {
  return isIosSafari();
}

/** Насби барнома дар телефон ва компютер. */
export function InstallApp() {
  const t = useTranslations("pwa");
  const eventRef = useRef<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandaloneApp() || isPwaInstalled()) return;
    const dismissed = () => {
      try {
        return sessionStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        return true;
      }
    };

    if (isIos()) {
      setIos(true);
      if (!dismissed()) setOpen(true);
    }

    const onPrompt = (raw: Event) => {
      raw.preventDefault();
      eventRef.current = raw as InstallEvent;
      setCanPrompt(true);
      window.dispatchEvent(new Event(PWA_AVAILABLE_EVENT));
      if (!dismissed()) setOpen(true);
    };
    const onOpen = () => {
      if (isStandaloneApp() || isPwaInstalled()) return;
      if (eventRef.current) {
        void runInstall();
        return;
      }
      setOpen(true);
    };
    const onInstalled = () => {
      eventRef.current = null;
      setCanPrompt(false);
      setOpen(false);
      markPwaInstalled();
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener(PWA_OPEN_EVENT, onOpen);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener(PWA_OPEN_EVENT, onOpen);
      window.removeEventListener("appinstalled", onInstalled);
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

  async function runInstall() {
    const event = eventRef.current;
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    eventRef.current = null;
    setCanPrompt(false);
    if (choice.outcome === "accepted") {
      markPwaInstalled();
      hide();
    }
  }

  if (!open) return null;

  const lead = ios ? t("iosLead") : canPrompt ? t("lead") : t("howTo");

  return (
    <div className="bp-pwa-bar" role="dialog" aria-label={t("title")}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{t("title")}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{lead}</p>
      </div>
      {ios || !canPrompt ? null : (
        <button
          type="button"
          className="btn btn-primary inline-flex min-h-12 shrink-0 items-center gap-2"
          onClick={() => void runInstall()}
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
